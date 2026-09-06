# Handoff

## Outcome

**FAIL — the live multiplayer backend regresses after an owned product revision
restart.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Reviewed implementation candidate: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Documentation revision at review: `46635f26ed590e76da762f4c64027ef78b186b9c`
- Verification report: `.factory/verification-4.md`

No product code was changed in this verification.

The live frontend matches the reviewed implementation build exactly. Before a
restart, two independent browser clients successfully shared an authoritative
room and one client observed the other's solved result. After restarting the
owned active product revision to verify SQLite durability, the hostname
returned static-style responses: `/health` was HTTP 404 HTML and
`POST /api/rooms` was HTTP 405. The service did not recover during the full
live test run.

## Verification completed

- `npm ci`: pass, no audit vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 local Playwright tests.
- `npm run build`: pass; `dist/` produced.
- All 17 exact `.factory/claims.json` commands: pass individually against the
  documented local Rust/SQLite test server.
- Fresh desktop and 390 px phone views showed the game first, with the job,
  audience, sample action, price, local-solo fact, and room-expiry fact.
- The isolated demo loaded six exhibits, retained its sample-data banner,
  reset cleanly, and did not change normal saved solo data.
- A deterministic live run reached the real win screen. Loss, replay, restart,
  settings, keyboard, mouse, touch, reduced motion, privacy, routes, legal
  pages, 404 presentation, and no serious/critical axe findings passed.
- The 50 fps phone-class active-play claim passed. Root URL verification passed
  with no console errors.
- The full live suite with the required revision restart: **17 passed, 6
  failed**. `npm run verify:live` also fails after recovery because `/health`
  is HTTP 404 instead of JSON.

## Required next step

Repair the product deployment so a restart preserves routing of the product
hostname, including `/health` and `/api/*`, to the owned Rust/SQLite container.
Then rerun:

```sh
npm ci
npm test
npm run build
LIVE_RESTART=1 BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
npm run verify:live
```

Do not claim checkout or paid activation: the existing offer remains $6 USD
once for 19 additional cases (20 total), and external offer registration is
still pending.

## Evidence

Fresh status-only evidence is in `/work/.evidence/orderly-chaos-verify-4/`.
It includes desktop, phone, populated-demo, and win-screen captures plus URL
verifier output. It does not contain credentials, cookies, room codes, access
values, or license tokens.
