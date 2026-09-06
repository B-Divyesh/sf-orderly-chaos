# Handoff

## Outcome

Independent verification 8 passes with **0 findings** and **0 untested public
claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Runtime implementation: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Documentation baseline: `c581a57f5d19947b1e4fe594ff13a10dd2c0f939`
- Independent report: `.factory/verification-8.md`

The live backend reports the implementation SHA, and the live JavaScript and
CSS match the clean local build byte for byte. No product code was changed by
this verification.

## Verification completed

From the documented clean setup:

```sh
npm ci
npm test
npm run build
```

- `npm ci` passed with 0 reported vulnerabilities.
- All 20 exact claim commands passed separately. Each claim ID has exactly one
  `@claim:<id>` marker, including `room-token-hash`.
- `npm test` passed: 6 core, 4 Rust/SQLite, and 27 browser tests.
- `npm run build` produced `dist/`; initial JavaScript is 11.72 KB gzip and
  CSS is 4.19 KB gzip.
- The full public HTTPS suite passed 27/27.
- `npm run verify:live` passed 2/2 after restarting only the owned product
  revision. The solved room persisted and new-room creation recovered.
- Fresh desktop and phone contexts showed the job, audience, sample action,
  facts, game board, and an exhibit before scrolling, without console errors
  or ordinary-width overflow.
- A recorded sample run reached **Case solved** with four comparisons. The
  suite also covered loss, replay, restart, settings, mouse, keyboard, touch,
  room boundaries, 429 recovery, privacy, routes, legal pages, and 404.
- URL verification and Playwright Axe passed. Mobile Lighthouse scored
  100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP
  was 1,261 ms, CLS 0, and total blocking time 56 ms.

Evidence is in `/work/.evidence/orderly-chaos-verify-8/`. The required copies
are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Earlier findings

All earlier findings are resolved: backend routing and restart persistence,
HTTP 404 status, distinct case rules, claim registration, phone target sizes,
404 focus layout, privacy claim coverage, and the `room-token-hash` tag.

## Remaining dependency

Checkout registration remains outside this repository. The product accurately
shows **Checkout registration pending** and does not claim a completed live
checkout or activation. The public offer remains $6 USD once for 19 paid
cases, 20 total, with no subscription. The free case remains complete.

## Repeat verification

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Also run every exact command in `.factory/claims.json` separately. The restart
check targets only `sf-orderly-chaos` and does not print room access values.
