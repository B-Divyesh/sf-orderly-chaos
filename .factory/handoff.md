# Handoff

## Outcome

Strict review 2 passes with **0 findings** and **0 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Runtime implementation: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Documentation baseline reviewed: `82a777280548e3ba11db290507a5fd3c9f2a0aac`
- Live static build label: `c581a57`
- Review report: `.factory/review-2.md`
- Evidence: `/work/.evidence/orderly-chaos-review-2/`

The live backend reports the implementation SHA. Later commits change only
factory reports. A build with the live static label produces JavaScript and
CSS that match the deployed assets byte for byte. This review changed no
product code.

## Verification completed

- `npm ci`: pass; zero reported vulnerabilities.
- `npm test`: pass; 6 unit, 4 Rust/SQLite, and 27 browser tests.
- `npm run build`: pass; `dist/` produced.
- All 20 exact claim commands: pass separately; each ID has one claim tag.
- Full live suite: 27/27 pass.
- `npm run verify:live`: 2/2 pass after restarting only
  `sf-orderly-chaos`; the solved room persisted and new-room creation
  recovered.
- Fresh desktop and phone runs: populated sample, reset, active play, solved
  end screen, and replay action passed. The live suite also covered loss.
- Keyboard, mouse, touch, settings, reduced motion, 200% text, focus return,
  route focus, invalid inputs, 401 isolation, two-player limit, room expiry,
  429 recovery, privacy, legal pages, and the expected HTTP 404 passed.
- URL verification and Playwright Axe passed with no console, serious, or
  critical accessibility issue.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1,298 ms, CLS 0, total blocking time 128 ms.
- Live phone active play measured 60 fps against the declared 50 fps floor.

## Remaining external dependency

Checkout registration remains outside this repository. The product accurately
shows **Checkout registration pending** and does not claim completed live
checkout or activation. The offer remains $6 USD once for 19 paid cases, 20
total, with no subscription. The free case remains complete.

## Repeat verification

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Also run every exact command in `.factory/claims.json` separately. The live
restart check targets only `sf-orderly-chaos` and does not print room access
values.
