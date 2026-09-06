# Orderly Chaos

Order six museum exhibits from lightest to heaviest with nine comparison
tokens. It is a five-minute browser puzzle for adults and teens, playable solo
or in a real asynchronous two-player room. Keyboard, mouse, and touch controls
are supported.

Play the isolated sample at <https://orderly-chaos.sociobot.in/demo>. Demo
changes do not touch normal solo progress.

## What is included

- One permanent free case with a complete win/loss loop.
- Server-validated rooms for two independent browsers. Rooms expire after 24 hours.
- A $6 USD one-time case pack with 19 more cases, for 20 total.
- Browser-local solo progress, sound choice, and reduced-motion choice.

The paid pack uses only the Sociobot checkout and license API. It is not a
subscription. The checkout product must be registered by the separate billing
operator before a purchase can complete.

## Clean setup

Prerequisites: Node.js 22+, npm, Rust stable, and Chromium for Playwright
1.58.2 (the factory image provides it through `PLAYWRIGHT_BROWSERS_PATH`).

```sh
npm ci
npm test
npm run build
```

`npm test` runs deterministic core tests, Rust/SQLite tests, a production
build, and browser tests. The browser suite starts the real Rust server with an
in-memory test database. `npm run build` writes the static bundle to `dist/`.

For local manual play:

```sh
npm run build
ORDERLY_DB_PATH=:memory: PORT=8080 cargo run --locked
```

Then open <http://localhost:8080/demo>.

## Runtime and deployment

The Rust server serves `dist/` and owns room state. In production it writes
SQLite to `/data/orderly-chaos.sqlite3`, runs as one replica, and needs only
`PORT`. The factory deployment command is:

```sh
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh orderly-chaos /work/repo Dockerfile 8080
```

Do not deploy the frontend without this service; that would make advertised
two-player rooms unavailable.

After deployment, verify that the public hostname reaches the service rather
than a static fallback:

```sh
npm run verify:live
```

This outcome check requires health JSON, a successful room creation, and an
HTTP 404 for an unknown URL. It does not print room access values.

## Documentation

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and asset provenance: [`.factory/design.md`](.factory/design.md)
- Testable public claims: [`.factory/claims.json`](.factory/claims.json)
- Demo storage boundary: [`.factory/demo.md`](.factory/demo.md)
- Privacy and terms: `/privacy` and `/terms` on the running product

The code is MIT licensed. Generated archive imagery is original to this
product and disclosed in the footer.
