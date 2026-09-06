# Verification 1 — FAIL

**Verdict: FAIL.** There are 2 findings and 0 untested declared claims.

Reviewed implementation commit: `07733f527a5263ccc4846d731d7202c4c6fee464`  
Documentation commit: `e7808219f854c4a16e615ac7bb11f5959a511f02`  
Live URL: <https://orderly-chaos.sociobot.in>  
Verification date: 2026-09-06

The live JavaScript asset is byte-identical to the build from the reviewed
implementation. The deployment is nevertheless serving a static fallback in
place of the required product-owned Rust/SQLite service.

## First screen

Desktop and a fresh 390 × 844 phone browser both show the game board without
scrolling. The title is **“Solve an ordering puzzle with limited comparisons.”**
It states that the game is for curious adults and teens seeking a five-minute
deduction game. The first action is **“Try it with sample data”**, which says it
opens a complete case without changing saved play. Desktop and phone had no
console errors; the phone had no horizontal overflow.

## Findings

### F-1 — Critical: live two-player backend is unavailable

The public host does not route the product API or health endpoint to the
Rust/SQLite service.

- `POST /api/rooms` returned **405** with `Allow: GET, HEAD, OPTIONS` and no
  `Retry-After`, both from an independent browser and direct request.
- A fresh demo browser clicked **Create two-player room** and showed “The room
  service returned an unreadable response.” No room code was created; the
  browser console recorded the 405.
- `GET /health` returned the SPA HTML (HTTP 200), not the documented health
  JSON. Consequently SQLite tenant isolation, room persistence across restart,
  and the required rate-limit 429/`Retry-After` behavior cannot be verified or
  work for players.
- The live 15-scenario browser suite failed the public
  `@claim:two-player-shared` and `@claim:room-expiry` paths and the rate-limit
  recovery scenario for this reason. The suite reported 11 passed and 4
  failed; the additional 404 failure is F-2.

This blocks the advertised real asynchronous two-player mode. Route the live
subdomain to the reviewed product container (including `/api/*` and `/health`)
with its SQLite `/data` mount, then rerun the live room, expiry, restart, and
rate-limit checks with two independent browsers.

### F-2 — Major: unknown live URLs return HTTP 200

`GET /does-not-exist` returns the SPA HTML with **HTTP 200**, not the deliberate
HTTP 404 required by the product and exercised by the declared browser test.
The client does render the designed “This page is not in the archive” page,
but crawlers and direct clients receive a success status. Configure the live
server/fallback to return the designed 404 body with HTTP 404.

## Checks that passed

- Fresh documented setup: `npm ci` completed with 0 vulnerabilities.
- `npm test` passed locally: 5 Vitest unit tests, 3 Rust/SQLite tests, and 15
  Playwright scenarios. `npm run build` passed and produced `dist/`.
- Every exact command in `.factory/claims.json` was run separately from the
  documented local setup. All 10 passed. This establishes that the candidate
  works against its local Rust server; it does not override F-1 in production.
- A real live demo run reached the **Case solved** end screen after five
  comparisons. The saved evidence is `live-win-screen.png`.
- Live desktop and phone first screens, keyboard/reduced-motion settings,
  invalid room-code validation, demo reset/isolation, privacy clear-data,
  route titles, legal pages, links, and the designed client 404 presentation
  were exercised. The invalid input response was “Enter the five-character
  room code.”
- `/opt/fleet/lib/verify-url.sh` passed against the live root: HTTPS 200,
  title, `lang=en`, one `h1`, one `main`, image alt text, labeled buttons, and
  no console errors.
- Playwright Axe checks on `/`, `/demo`, `/privacy`, `/terms`, and `/license`
  found 0 serious or critical violations. The standalone Axe CLI could not
  locate Chrome in this environment; the required Playwright Axe alternative
  was used successfully.
- Live Lighthouse (mobile-style headless Chrome): performance 100,
  accessibility 100, best practices 100, SEO 100; LCP 1,306 ms, CLS 0, TBT
  56 ms. The live active-play frame-rate claim passed its 50 fps test.
- The $6 USD one-time 19-case offer is plainly stated, says no subscription,
  and says checkout registration is pending. No checkout or activation was
  claimed as passed.

## Claims

| Claim | Local declared command | Live disposition |
| --- | --- | --- |
| Deterministic case reaches win | Pass | Pass; end-screen evidence recorded |
| Restart resets case | Pass | Pass |
| Solo progress persists | Pass | Pass |
| Demo isolation | Pass | Pass |
| Settings persist | Pass | Pass |
| Solo has no cross-origin requests | Pass | Pass |
| Two browsers share a room | Pass | **Fail — F-1** |
| Room codes expire in 24 hours | Pass | **Fail — F-1** |
| $6 one-time case pack fixture | Pass | Pass with recorded fixture; checkout deliberately unavailable |
| Active play is at least 50 fps | Pass | Pass |

Untested declared claims: **0**. Two claims failed in production rather than
being untested.

## Earlier handoff disposition

The earlier handoff recorded a live revision restart, persisted room, health
JSON, API 429, and HTTP 404. The current independent live checks do not
reproduce any of those server-side results: the static fallback now answers
`/health`, `/api/rooms`, and unknown routes. They are superseded by F-1 and
F-2, not accepted as current evidence. The earlier billing-registration gap
remains accurately disclosed in the interface and is not represented as a
completed checkout.

## Evidence

Operator evidence is in `/work/.evidence/`:

- `live-desktop-first-screen.png` and `live-phone-first-screen.png`
- `live-win-screen.png`
- `live-multiplayer-failure.png`
- `live-verify-url.json`
- `live-lighthouse.json`

Evidence contains no credentials, access tokens, or cookies.
