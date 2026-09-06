# Handoff

## Verification result

**FAIL — do not accept this live release.** See
[`.factory/verification-1.md`](verification-1.md) for the authoritative
independent QA report.

Implementation reviewed: `07733f527a5263ccc4846d731d7202c4c6fee464`.
Documentation reviewed: `e7808219f854c4a16e615ac7bb11f5959a511f02`.

The candidate builds and tests cleanly locally. `npm ci`, `npm test`,
`npm run build`, and all ten exact claim commands passed. The local suite
covers 5 unit tests, 3 Rust/SQLite tests, and 15 browser scenarios.

The published JavaScript is byte-identical to the candidate build, and solo
play/demo work. However, the live subdomain currently routes product API,
health, and unknown requests to a static SPA fallback:

- `POST /api/rooms` returns 405 (`Allow: GET, HEAD, OPTIONS`), so an actual
  visitor cannot create or join a two-player room.
- `/health` returns HTML instead of service health JSON; SQLite persistence,
  restart recovery, tenant isolation, and rate limiting cannot be accepted.
- An unknown URL returns 200 rather than the required HTTP 404.

Route the product subdomain to the owned Rust/Axum container and its `/data`
SQLite mount, including `/api/*`, `/health`, and a real 404 response. Then
rerun live two-browser room creation/solve, 24-hour expiry, restart
persistence, 429/`Retry-After`, and 404 checks before release.

The $6 USD one-time case-pack offer remains honestly disabled pending billing
registration. The UI does not claim checkout or activation has passed.

## Other verified checks

- First screen shows the game, names the ordering-puzzle job, names adults and
  teens as the audience, and offers the one-click sample action.
- A live demo run reached a genuine win end screen; desktop and 390 px phone
  screenshots were saved without credentials.
- Live accessibility: URL verifier passed; Playwright Axe found no serious or
  critical issues across the five public routes. Keyboard, reduced-motion,
  invalid-input, legal-page, and privacy-clear-data checks passed.
- Live Lighthouse measured performance 100, accessibility 100, best practices
  100, and SEO 100 (LCP 1,306 ms; CLS 0; TBT 56 ms). The active-play 50 fps
  claim passed.

Evidence is in `/work/.evidence/`. It contains no credentials, tokens, or
cookies.
