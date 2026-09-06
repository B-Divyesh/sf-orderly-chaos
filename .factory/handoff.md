# Handoff

## Outcome

**FAIL — the live shared-room backend is not deployed at the public product
host.** This independent verification made no product-code changes.

- Reviewed implementation: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Documentation revision: `cdcaea200273a99f70d9fb6a3a6f4c91d7064b34`
- Live URL: <https://orderly-chaos.sociobot.in>
- Report: `.factory/verification-3.md`

The live frontend asset exactly matches the built reviewed implementation. The
backend routes do not: `/health` returns the designed HTML 404 and
`POST /api/rooms` returns 405. As a result the advertised asynchronous
two-player mode cannot create a room, and public restart persistence, room
access isolation, expiry, and 429/`Retry-After` recovery cannot be accepted.

## What passed

- `npm ci`, final `npm test` (32 tests), and `npm run build` passed locally.
- All 17 registered claim commands passed locally from the documented setup.
  The shared-room command was rerun alone after a transient Playwright
  artifact-directory race and passed.
- The live solo game works: desktop and phone first screens are clear, the
  sample is populated and labelled, demo isolation/reset passed, and a
  deterministic run reached its real win screen.
- Live accessibility, route, keyboard, reduced-motion, privacy, legal-page,
  link, and designed-404 checks passed. `verify-url.sh` found no load console
  errors. Axe found no serious or critical issues.
- Live mobile Lighthouse measured 97 performance, 100 accessibility, 100 best
  practices, and 100 SEO (LCP 2.0 s, CLS 0, TBT 0 ms).
- The inference-rule and 20 distinct exhibit-set assertions passed.

## Required next step

Deploy or route the owned `sf-orderly-chaos` Rust/SQLite container to
`orderly-chaos.sociobot.in` for `/health` and `/api/*`, retaining its `/data`
SQLite mount. Then rerun the public full Playwright suite, including two
independent browsers, room expiry/third-client boundary, restart persistence,
access isolation, and 429 with `Retry-After`.

The separate billing operator still needs to register the researched $6 USD
one-time offer for 19 additional cases. The product must continue to state
that registration is pending; no subscription, checkout success, or paid
activation has been verified.

## Run and verify

```sh
npm ci
npm test
npm run build
BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
```

The full live suite currently fails six backend-dependent scenarios, as
documented in `.factory/verification-3.md`.
