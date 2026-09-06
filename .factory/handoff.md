# Handoff

## Outcome

**FAIL in independent verification 7 — one incomplete claims-contract item remains.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation reviewed: `7883cfb0a065fc6523bc93ce54c4f404871e0cf7`
- Documentation revision: `8b798354ca5f7e6f16901ce120dbcb0c9e359f1a`
- Report: `.factory/verification-7.md`
- Evidence: `/work/.evidence/orderly-chaos-verify-7/`

The live static assets match a clean production build at the documentation revision; changes after the implementation candidate are documentation only.

## Remaining finding

The public privacy claim that room access tokens are stored as hashes has a passing exact Rust/SQLite test, but the test does not carry the required `@claim:room-token-hash` tag. The claims contract requires exactly one such tag per declared public claim. Add a runner-recognized tag to that exact test, keep the declared command, and rerun the separate claim audit. This is the only verification-7 finding; do not mark the product PASS until it is closed.

## What passed

- `npm ci` passed with 0 reported vulnerabilities.
- `npm test` passed: 6 unit, 4 Rust/SQLite, and 27 Playwright tests.
- `npm run build` passed and produced `dist/`; JS is 11.72 KB gzip and CSS is 4.19 KB gzip.
- Every one of the 20 exact commands in `.factory/claims.json` passed when run separately. Nineteen have exactly one required tag; the remaining passing command is the incomplete item above.
- Live browser suite: 27/27 passed. Restart-enabled live suite: 2/2 passed. Two isolated clients shared an authoritative result; the owned backend restart preserved it and recovered health. 429/`Retry-After`, expiry, unauthorised access, and the two-player limit passed.
- Fresh desktop and 390 px phone contexts showed the job, audience, first action, game board, and an exhibit before scrolling with no overflow or console errors. The sample was populated, labelled persistently, resettable, and isolated from normal storage.
- Deterministic live play reached both actual win and loss end screens. Replay/restart reset correctly. Phone-class measured frame rate was 60 fps.
- URL verification and Playwright Axe passed. The repaired 44 px touch targets and 404 skip-link focus/overlap checks passed on all public routes.
- Successful mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1,211 ms, CLS 0, TBT 52 ms.

## Offer and dependency

The complete offer is $6 USD once for 19 extra curated cases, 20 total, with no subscription. The free case remains usable. Checkout registration remains an external billing-operator dependency. The public button stays disabled and says registration is pending; verification used recorded license fixtures and does not claim a real checkout or paid activation.

## How to verify

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Run each command in `.factory/claims.json` separately. Then verify that every claim ID appears exactly once as `@claim:<id>` in its test source. The current audit fails only for `room-token-hash`.
