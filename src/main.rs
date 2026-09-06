use axum::{
    body::Body,
    extract::{Path, Request, State},
    http::{header, HeaderMap, HeaderValue, Response, StatusCode, Uri},
    middleware::{self, Next},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use rand::RngCore;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, VecDeque},
    path::{Path as FilePath, PathBuf},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};
use tokio::{fs, net::TcpListener, signal};
use tracing::{info, warn};

const ROOM_LIFETIME_SECONDS: i64 = 24 * 60 * 60;
const BUILD_SHA: &str = match option_env!("BUILD_SHA") {
    Some(value) => value,
    None => "dev",
};

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    limits: Arc<Mutex<HashMap<String, VecDeque<Instant>>>>,
    dist: Arc<PathBuf>,
}

#[derive(Serialize)]
struct Health {
    status: &'static str,
    build: &'static str,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateRoomRequest {
    seed: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProgressRequest {
    comparisons_used: u8,
    order: Option<Vec<String>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RoomAccess {
    code: String,
    seed: String,
    player: u8,
    player_token: String,
    expires_at: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PlayerView {
    player: u8,
    comparisons_used: u8,
    status: String,
    efficiency: Option<u8>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RoomView {
    code: String,
    seed: String,
    expires_at: i64,
    players: Vec<PlayerView>,
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

type ApiError = (StatusCode, Json<ErrorBody>);

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .json()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let db_path = database_path();
    let db = open_database_with_retry(&db_path).await;
    info!(database = %redacted_database_location(&db_path), "room database ready; no secret configuration required");

    let state = AppState {
        db: Arc::new(Mutex::new(db)),
        limits: Arc::new(Mutex::new(HashMap::new())),
        dist: Arc::new(PathBuf::from("dist")),
    };
    let app = app(state);
    let listener = TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("port bind failed");
    info!(port = %port, build = BUILD_SHA, "server started");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server failed");
}

fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/api/rooms", post(create_room))
        .route("/api/rooms/{code}/join", post(join_room))
        .route("/api/rooms/{code}", get(get_room))
        .route("/api/rooms/{code}/progress", post(update_progress))
        .fallback(static_response)
        .layer(middleware::from_fn(security_headers))
        .with_state(state)
}

async fn health() -> Json<Health> {
    Json(Health {
        status: "ok",
        build: BUILD_SHA,
    })
}

async fn create_room(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CreateRoomRequest>,
) -> Result<Json<RoomAccess>, ApiError> {
    enforce_rate_limit(&state, &headers, 8)?;
    let seed = body
        .seed
        .unwrap_or_else(|| format!("room-{}", Utc::now().timestamp()));
    if !valid_seed(&seed) {
        return Err(api_error(
            StatusCode::BAD_REQUEST,
            "Use a case seed with 3–64 lowercase letters, numbers, or hyphens.",
        ));
    }
    let now = Utc::now().timestamp();
    let expires_at = now + ROOM_LIFETIME_SECONDS;
    let token = random_token();
    let token_hash = hash_token(&token);
    let mut attempts = 0;
    let code = loop {
        attempts += 1;
        let candidate = random_room_code();
        let order = hidden_order(&seed).join(",");
        let result = state.db.lock().expect("db lock").execute(
            "INSERT OR IGNORE INTO rooms(code, seed, hidden_order, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![candidate, seed, order, now, expires_at],
        );
        match result {
            Ok(1) => break candidate,
            Ok(_) if attempts < 12 => continue,
            Ok(_) => {
                return Err(api_error(
                    StatusCode::SERVICE_UNAVAILABLE,
                    "Could not reserve a room code. Try again.",
                ))
            }
            Err(error) => {
                warn!(%error, "room insert failed");
                return Err(api_error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "The room could not be created. Try again.",
                ));
            }
        }
    };
    state.db.lock().expect("db lock").execute(
        "INSERT INTO players(room_code, player_number, token_hash, comparisons_used, status, updated_at) VALUES (?1, 1, ?2, 0, 'active', ?3)",
        params![code, token_hash, now],
    ).map_err(|_| api_error(StatusCode::INTERNAL_SERVER_ERROR, "The room could not be created. Try again."))?;
    Ok(Json(RoomAccess {
        code,
        seed,
        player: 1,
        player_token: token,
        expires_at,
    }))
}

async fn join_room(
    State(state): State<AppState>,
    Path(code): Path<String>,
    headers: HeaderMap,
) -> Result<Json<RoomAccess>, ApiError> {
    enforce_rate_limit(&state, &headers, 8)?;
    let code = normalize_code(&code)?;
    let now = Utc::now().timestamp();
    purge_expired(&state, now);
    let room: Option<(String, i64)> = state
        .db
        .lock()
        .expect("db lock")
        .query_row(
            "SELECT seed, expires_at FROM rooms WHERE code = ?1 AND expires_at > ?2",
            params![code, now],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|_| {
            api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "The room could not be opened. Try again.",
            )
        })?;
    let (seed, expires_at) = room.ok_or_else(|| {
        api_error(
            StatusCode::NOT_FOUND,
            "That room was not found or has expired.",
        )
    })?;
    let count: i64 = state
        .db
        .lock()
        .expect("db lock")
        .query_row(
            "SELECT COUNT(*) FROM players WHERE room_code = ?1",
            params![code],
            |row| row.get(0),
        )
        .map_err(|_| {
            api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "The room could not be opened. Try again.",
            )
        })?;
    if count >= 2 {
        return Err(api_error(
            StatusCode::CONFLICT,
            "That room already has two players.",
        ));
    }
    let token = random_token();
    state.db.lock().expect("db lock").execute(
        "INSERT INTO players(room_code, player_number, token_hash, comparisons_used, status, updated_at) VALUES (?1, 2, ?2, 0, 'active', ?3)",
        params![code, hash_token(&token), now],
    ).map_err(|_| api_error(StatusCode::CONFLICT, "That room already has two players."))?;
    Ok(Json(RoomAccess {
        code,
        seed,
        player: 2,
        player_token: token,
        expires_at,
    }))
}

async fn get_room(
    State(state): State<AppState>,
    Path(code): Path<String>,
    headers: HeaderMap,
) -> Result<Json<RoomView>, ApiError> {
    enforce_rate_limit(&state, &headers, 20)?;
    let code = normalize_code(&code)?;
    authenticate(&state, &code, &headers)?;
    Ok(Json(room_view(&state, &code)?))
}

async fn update_progress(
    State(state): State<AppState>,
    Path(code): Path<String>,
    headers: HeaderMap,
    Json(body): Json<ProgressRequest>,
) -> Result<Json<RoomView>, ApiError> {
    enforce_rate_limit(&state, &headers, 8)?;
    let code = normalize_code(&code)?;
    let player = authenticate(&state, &code, &headers)?;
    if body.comparisons_used > 9 {
        return Err(api_error(
            StatusCode::BAD_REQUEST,
            "Comparisons used must be between 0 and 9.",
        ));
    }
    let current: u8 = state
        .db
        .lock()
        .expect("db lock")
        .query_row(
            "SELECT comparisons_used FROM players WHERE room_code = ?1 AND player_number = ?2",
            params![code, player],
            |row| row.get(0),
        )
        .map_err(|_| api_error(StatusCode::NOT_FOUND, "That player was not found."))?;
    if body.comparisons_used < current {
        return Err(api_error(
            StatusCode::CONFLICT,
            "Comparison progress cannot move backward.",
        ));
    }
    let status = if let Some(order) = body.order {
        if order.len() != 6 || order.iter().any(|id| !valid_item_id(id)) {
            return Err(api_error(
                StatusCode::BAD_REQUEST,
                "Submit each of the six exhibit ids once.",
            ));
        }
        let expected: String = state
            .db
            .lock()
            .expect("db lock")
            .query_row(
                "SELECT hidden_order FROM rooms WHERE code = ?1",
                params![code],
                |row| row.get(0),
            )
            .map_err(|_| {
                api_error(
                    StatusCode::NOT_FOUND,
                    "That room was not found or has expired.",
                )
            })?;
        if order.join(",") == expected {
            "won"
        } else {
            "lost"
        }
    } else {
        "active"
    };
    let now = Utc::now().timestamp();
    state.db.lock().expect("db lock").execute(
        "UPDATE players SET comparisons_used = ?1, status = ?2, updated_at = ?3 WHERE room_code = ?4 AND player_number = ?5",
        params![body.comparisons_used, status, now, code, player],
    ).map_err(|_| api_error(StatusCode::INTERNAL_SERVER_ERROR, "Progress could not be saved. Try again."))?;
    Ok(Json(room_view(&state, &code)?))
}

fn room_view(state: &AppState, code: &str) -> Result<RoomView, ApiError> {
    let now = Utc::now().timestamp();
    purge_expired(state, now);
    let (seed, expires_at): (String, i64) = state
        .db
        .lock()
        .expect("db lock")
        .query_row(
            "SELECT seed, expires_at FROM rooms WHERE code = ?1 AND expires_at > ?2",
            params![code, now],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|_| {
            api_error(
                StatusCode::NOT_FOUND,
                "That room was not found or has expired.",
            )
        })?;
    let db = state.db.lock().expect("db lock");
    let mut statement = db.prepare("SELECT player_number, comparisons_used, status FROM players WHERE room_code = ?1 ORDER BY player_number")
        .map_err(|_| api_error(StatusCode::INTERNAL_SERVER_ERROR, "Room progress could not be read."))?;
    let players = statement
        .query_map(params![code], |row| {
            let comparisons: u8 = row.get(1)?;
            let status: String = row.get(2)?;
            Ok(PlayerView {
                player: row.get(0)?,
                comparisons_used: comparisons,
                efficiency: if status == "won" {
                    Some(9 - comparisons)
                } else {
                    None
                },
                status,
            })
        })
        .map_err(|_| {
            api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Room progress could not be read.",
            )
        })?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|_| {
            api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Room progress could not be read.",
            )
        })?;
    Ok(RoomView {
        code: code.to_string(),
        seed,
        expires_at,
        players,
    })
}

fn authenticate(state: &AppState, code: &str, headers: &HeaderMap) -> Result<u8, ApiError> {
    let token = headers
        .get("x-room-token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or("");
    if token.len() < 32 {
        return Err(api_error(
            StatusCode::UNAUTHORIZED,
            "Open this room from the browser that created or joined it.",
        ));
    }
    let token_hash = hash_token(token);
    state
        .db
        .lock()
        .expect("db lock")
        .query_row(
            "SELECT player_number FROM players WHERE room_code = ?1 AND token_hash = ?2",
            params![code, token_hash],
            |row| row.get(0),
        )
        .optional()
        .map_err(|_| {
            api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "The room could not be opened.",
            )
        })?
        .ok_or_else(|| {
            api_error(
                StatusCode::UNAUTHORIZED,
                "This room access is no longer valid.",
            )
        })
}

fn enforce_rate_limit(
    state: &AppState,
    headers: &HeaderMap,
    allowance: usize,
) -> Result<(), ApiError> {
    let ip = headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .unwrap_or("local")
        .trim()
        .to_string();
    let now = Instant::now();
    let mut limits = state.limits.lock().expect("rate lock");
    let entries = limits.entry(ip).or_default();
    while entries
        .front()
        .is_some_and(|instant| now.duration_since(*instant) >= Duration::from_secs(1))
    {
        entries.pop_front();
    }
    if entries.len() >= allowance {
        let mut response = api_error(
            StatusCode::TOO_MANY_REQUESTS,
            "Too many requests. Wait one second and try again.",
        );
        response.1 .0.error = "Too many requests. Wait one second and try again.".to_string();
        return Err(response);
    }
    entries.push_back(now);
    Ok(())
}

async fn security_headers(request: Request, next: Next) -> Response<Body> {
    let path = request.uri().path().to_string();
    let is_api = path.starts_with("/api/");
    let mut response = next.run(request).await;
    let rate_limited = response.status() == StatusCode::TOO_MANY_REQUESTS;
    let headers = response.headers_mut();
    headers.insert(
        "x-content-type-options",
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        "referrer-policy",
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    headers.insert("x-frame-options", HeaderValue::from_static("DENY"));
    headers.insert(
        "permissions-policy",
        HeaderValue::from_static("camera=(), microphone=(), geolocation=()"),
    );
    headers.insert("content-security-policy", HeaderValue::from_static("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.sociobot.in; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://api.sociobot.in"));
    if rate_limited {
        headers.insert(header::RETRY_AFTER, HeaderValue::from_static("1"));
    }
    if is_api {
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    } else if path.starts_with("/assets/") {
        headers.insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=31536000, immutable"),
        );
    } else if path.starts_with("/art/") || path.ends_with(".webp") || path.ends_with(".png") {
        headers.insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=604800"),
        );
    } else {
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-cache"));
    }
    response
}

async fn static_response(State(state): State<AppState>, uri: Uri) -> impl IntoResponse {
    let path = uri.path();
    let known_route = matches!(path, "/" | "/demo" | "/privacy" | "/terms" | "/license");
    let relative = path.trim_start_matches('/');
    let safe_asset = !relative.contains("..")
        && !relative.is_empty()
        && (relative.starts_with("assets/")
            || relative.starts_with("art/")
            || matches!(
                relative,
                "favicon.svg"
                    | "apple-touch-icon.png"
                    | "social-card.webp"
                    | "robots.txt"
                    | "sitemap.xml"
                    | "manifest.webmanifest"
                    | "staticwebapp.config.json"
                    | "404.css"
            ));
    let (file, status) = if known_route {
        (state.dist.join("index.html"), StatusCode::OK)
    } else if safe_asset {
        (state.dist.join(relative), StatusCode::OK)
    } else {
        (state.dist.join("404.html"), StatusCode::NOT_FOUND)
    };
    match fs::read(&file).await {
        Ok(bytes) => {
            let mime = content_type(&file);
            Response::builder()
                .status(status)
                .header(header::CONTENT_TYPE, mime)
                .body(Body::from(bytes))
                .unwrap()
        }
        Err(_) => Response::builder()
            .status(StatusCode::NOT_FOUND)
            .header(header::CONTENT_TYPE, "text/plain; charset=utf-8")
            .body(Body::from("Not found"))
            .unwrap(),
    }
}

fn content_type(path: &FilePath) -> &'static str {
    match path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
    {
        "html" => "text/html; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "webp" => "image/webp",
        "json" | "webmanifest" => "application/json; charset=utf-8",
        "xml" => "application/xml; charset=utf-8",
        "txt" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn database_path() -> String {
    if let Ok(path) = std::env::var("ORDERLY_DB_PATH") {
        return path;
    }
    let data_dir = if FilePath::new("/data").is_dir() {
        "/data"
    } else {
        "."
    };
    format!("{data_dir}/orderly-chaos.sqlite3")
}

fn redacted_database_location(path: &str) -> &'static str {
    if path == ":memory:" {
        "memory"
    } else if path.starts_with("/data/") {
        "/data"
    } else {
        "local"
    }
}

fn open_database(path: &str) -> rusqlite::Result<Connection> {
    let connection = Connection::open(path)?;
    connection.busy_timeout(Duration::from_secs(5))?;
    connection.execute_batch(
        "PRAGMA foreign_keys = ON;
         CREATE TABLE IF NOT EXISTS rooms (
           code TEXT PRIMARY KEY,
           seed TEXT NOT NULL,
           hidden_order TEXT NOT NULL,
           created_at INTEGER NOT NULL,
           expires_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS players (
           room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
           player_number INTEGER NOT NULL CHECK(player_number IN (1, 2)),
           token_hash TEXT NOT NULL,
           comparisons_used INTEGER NOT NULL DEFAULT 0,
           status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'won', 'lost')),
           updated_at INTEGER NOT NULL,
           PRIMARY KEY(room_code, player_number),
           UNIQUE(room_code, token_hash)
         );
         CREATE INDEX IF NOT EXISTS idx_rooms_expiry ON rooms(expires_at);",
    )?;
    Ok(connection)
}

async fn open_database_with_retry(path: &str) -> Connection {
    let mut last_error = String::new();
    for attempt in 1..=12_u64 {
        match open_database(path) {
            Ok(connection) => return connection,
            Err(error) => {
                last_error = error.to_string();
                warn!(attempt, error = %error, "database setup delayed; retrying");
                tokio::time::sleep(Duration::from_secs(attempt.min(5))).await;
            }
        }
    }
    panic!("database setup failed after retries: {last_error}");
}

fn purge_expired(state: &AppState, now: i64) {
    if let Err(error) = state
        .db
        .lock()
        .expect("db lock")
        .execute("DELETE FROM rooms WHERE expires_at <= ?1", params![now])
    {
        warn!(%error, "expired room cleanup failed");
    }
}

fn valid_seed(seed: &str) -> bool {
    (3..=64).contains(&seed.len())
        && seed
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
}

fn normalize_code(code: &str) -> Result<String, ApiError> {
    let normalized = code.trim().to_ascii_uppercase();
    if normalized.len() == 5
        && normalized
            .bytes()
            .all(|byte| byte.is_ascii_uppercase() || byte.is_ascii_digit())
    {
        Ok(normalized)
    } else {
        Err(api_error(
            StatusCode::BAD_REQUEST,
            "Enter the five-character room code.",
        ))
    }
}

fn valid_item_id(id: &str) -> bool {
    matches!(
        id,
        "item-0" | "item-1" | "item-2" | "item-3" | "item-4" | "item-5"
    )
}

fn random_room_code() -> String {
    const ALPHABET: &[u8] = b"23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let mut bytes = [0_u8; 5];
    rand::rng().fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|byte| ALPHABET[*byte as usize % ALPHABET.len()] as char)
        .collect()
}

fn random_token() -> String {
    let mut bytes = [0_u8; 24];
    rand::rng().fill_bytes(&mut bytes);
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn hash_token(token: &str) -> String {
    format!("{:x}", Sha256::digest(token.as_bytes()))
}

fn hidden_order(seed: &str) -> Vec<String> {
    let mut hash = 0x811c9dc5_u32;
    for byte in seed.bytes() {
        hash ^= byte as u32;
        hash = hash.wrapping_mul(0x01000193);
    }
    let mut order = (0..6)
        .map(|index| format!("item-{index}"))
        .collect::<Vec<_>>();
    for index in (1..order.len()).rev() {
        hash = hash.wrapping_mul(1664525).wrapping_add(1013904223);
        let random = hash as f64 / 4294967296.0;
        let swap = (random * (index + 1) as f64).floor() as usize;
        order.swap(index, swap);
    }
    order
}

fn api_error(status: StatusCode, message: &str) -> ApiError {
    (
        status,
        Json(ErrorBody {
            error: message.to_string(),
        }),
    )
}

async fn shutdown_signal() {
    let control_c = async { signal::ctrl_c().await.expect("control-c handler failed") };
    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("terminate handler failed")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! { _ = control_c => {}, _ = terminate => {} }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_order_contains_each_item_once() {
        let order = hidden_order("free-paper-moon");
        assert_eq!(order.len(), 6);
        let mut sorted = order.clone();
        sorted.sort();
        assert_eq!(
            sorted,
            (0..6)
                .map(|index| format!("item-{index}"))
                .collect::<Vec<_>>()
        );
        assert_eq!(order, hidden_order("free-paper-moon"));
    }

    #[test]
    fn sqlite_state_survives_reopen() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("rooms.sqlite3");
        {
            let db = open_database(path.to_str().unwrap()).unwrap();
            db.execute("INSERT INTO rooms(code, seed, hidden_order, created_at, expires_at) VALUES ('ABCDE', 'case-one', 'item-0,item-1,item-2,item-3,item-4,item-5', 1, 9999999999)", []).unwrap();
        }
        let reopened = open_database(path.to_str().unwrap()).unwrap();
        let count: i64 = reopened
            .query_row(
                "SELECT COUNT(*) FROM rooms WHERE code = 'ABCDE'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn room_codes_and_seeds_reject_bad_boundaries() {
        assert!(valid_seed("abc"));
        assert!(!valid_seed("ab"));
        assert!(!valid_seed("UPPER"));
        assert!(normalize_code("a2b3c").is_ok());
        assert!(normalize_code("four").is_err());
    }
}
