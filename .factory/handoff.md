# Handoff

## Outcome

**FAIL — public multiplayer routing regresses after an owned revision
restart.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Reviewed implementation: `a1f64ae39dc18764310169be498ee7622e6dc0e4`
- Documentation revision reviewed: `23a60066c267d25afff8ed0bcaed9ddf2fbc5b6d`
- Report: `.factory/verification-5.md`
- Findings: 1 critical
- Untested public claims: 0

Two independent clients created, joined, and solved a shared room before the
required restart. After restarting the active owned `sf-orderly-chaos`
revision, the public host did not recover the product backend: `/health`
returns 404 HTML and room creation returns 405. The owned container remains
healthy and its direct health endpoint reports implementation `a1f64ae`, so
the defect is public routing after restart.

## Verification completed

- Fresh `npm ci`: pass; 0 vulnerabilities reported.
- `npm test`: pass — 6 unit, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; 11.72 KB gzip JavaScript and 4.13 KB gzip CSS.
- All 17 claim commands: pass separately against the documented local server.
- Restart-enabled live suite: **17 passed, 6 failed** after public routing
  regressed.
- `npm run verify:live`: **2 failed** in the post-restart public state.
- Fresh desktop and 390 × 844 phone first screens: pass; job, audience, sample
  action, board, and an exhibit are visible without scrolling.
- Demo isolation, reset, deterministic win/loss, replay, keyboard, pointer,
  touch, settings, reduced motion, privacy clearing, legal pages, links, and
  the designed HTTP 404: pass.
- URL verifier: pass. Live Axe checks: 0 serious or critical issues.
- Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100
  SEO; LCP 1,203 ms, CLS 0, TBT 70 ms.

## Required next step

Restore the product subdomain to the healthy owned Rust/SQLite runtime and fix
the restart routing lifecycle. Re-run the full live suite with restart and
verify the persisted solved room, a new post-restart room, 24-hour expiry,
two-player limit, access isolation, and 429 with `Retry-After`.

The $6 USD one-time 19-case pack remains complete and accurately described as
20 total cases with no subscription. Checkout registration remains an
external billing-operator dependency; no checkout or activation was reported
as passing.

Evidence: `/work/.evidence/orderly-chaos-verify-5-independent/`. It contains
status-only results and no credentials, cookie values, room codes, player
tokens, or license values.
