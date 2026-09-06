# Handoff

## Outcome

**FAIL — independent verification found 4 findings and 6 untested public
claims.** The implementation remains buildable and passes locally, but the
live hostname does not currently expose the product-owned room service.

Live URL: <https://orderly-chaos.sociobot.in>

Reviewed implementation: `6635570ff1846153c8ff095d3700707134dd8cbd`

Documentation revision before this report: `52c60686b7e59c5458dfef62c64cdb1c0c00739d`

See [`.factory/verification-2.md`](verification-2.md) for complete evidence.

## What passed

From a clean dependency install, `npm test` passed with 5 unit tests, 3
Rust/SQLite tests, and 17 browser tests. `npm run build` produced `dist/`; the
initial JavaScript is 10.87 KB gzip and CSS is 3.95 KB gzip. Each of the ten
declared claim commands also passed separately against the local service.

Fresh live desktop and phone checks passed the first-screen, demo, solo
win/loss, restart, settings, keyboard, reduced-motion, legal-page, link,
privacy-clear, and accessibility paths. The deterministic run is recorded and
the end screen is captured. Active play measured 60 fps. Lighthouse scored
100 in performance, accessibility, best practices, and SEO.

The $6 USD one-time offer remains correct: 19 paid cases, 20 total, and no
subscription. Checkout remains honestly disabled until the external billing
operator registers it.

## What failed

- The public hostname serves a static fallback: `/health` returns HTML,
  `POST /api/rooms` returns 405, and room creation fails. Live multiplayer,
  isolation, expiry, restart persistence, and 429/`Retry-After` recovery are
  therefore unavailable or unverifiable.
- Unknown URLs render the designed page but return HTTP 200 instead of 404.
- Cases do not implement the brief's per-case special inference rules.
- Six public claims are missing from `.factory/claims.json`: five-minute round,
  full control modalities, the actual free-case loop, Start-for-real cleanup,
  the two-player room boundary, and revoked-license behavior.

The two routing failures are recurrences of verification-1 F-1 and F-2. The
current live evidence supersedes the prior PASS report.

## Reverification

```sh
npm ci
npm test
npm run build
npm run verify:live
BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
LIVE_RESTART=1 BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e -- --grep @claim:two-player-shared
/opt/fleet/lib/verify-url.sh https://orderly-chaos.sociobot.in /work/.evidence/orderly-chaos-verify-2/verify-url
```

Run the restart command only after live room creation works. Repair should
route the product hostname to the existing product-owned Rust/SQLite service,
retain its `/data` mount, add the missing case mechanics and claim tests, then
repeat the full independent live suite.
