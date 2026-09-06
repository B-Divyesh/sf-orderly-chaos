# Handoff

## Outcome

**PASS in repair verification — all three verification-6 findings are fixed.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation SHA: `7883cfb`
- Evidence: `/work/.evidence/orderly-chaos-repair-7/`
- Assigned report: `.factory/verification-6.md`

The final live footer reports build `7883cfb`. The static deployment preserved
the existing linked product-owned Rust/SQLite backend and its durable `/data`
configuration.

## Findings repaired

1. Every visible link, button, and input now measures at least 44 × 44 CSS px
   in a fresh 390 × 844 touch browser on `/`, `/demo`, `/privacy`, `/terms`,
   `/license`, and the real HTTP 404 page.
2. The 404 skip link is visually hidden until keyboard focus. When focused it
   enters normal layout, does not overlap the wordmark at phone or desktop
   widths, and uses the product's 3 px solid focus treatment. Every 404 link
   uses the same focus treatment.
3. `.factory/claims.json` now registers exact tests for no tracking or
   advertising cookies, complete browser-data removal, and hashed room-token
   storage. The browser-data test creates each stated category through the UI.
   The SQLite test creates a room through the production handler and compares
   the stored value with the returned access value without logging either.

## Verification completed

- Clean `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 4 Rust/SQLite, and 27 Playwright tests.
- `npm run build`: pass; `dist/` produced.
- Initial JavaScript: 11.72 KB gzip. CSS: 4.19 KB gzip.
- Every one of the 20 exact claim commands: pass when run separately.
- `npm run verify:live`: 2/2 pass. Two isolated clients shared an
  authoritative result, the owned backend revision restarted, the result
  persisted, and a fresh room could be created after recovery.
- Final full live suite: 27/27 pass after the clean-SHA deployment.
- URL verifier: HTTPS 200, correct title and language, one h1, main landmark,
  alt text present, controls labelled, and no console errors.
- Playwright Axe: no serious or critical violations on every public route or
  the controls dialog.
- Fresh desktop and phone browsers show the ordering job, audience, first
  action, board, and an exhibit before scrolling, without horizontal overflow.
- The one-click sample shows six named exhibits at 0/9, keeps its demo label,
  resets independently, and leaves seeded normal progress unchanged.
- Deterministic live play reaches the real win and loss screens. Replay and
  restart reset the case.
- Phone-class active play measured 60 fps.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1,208 ms, CLS 0, TBT 38 ms.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| Verification 1–5: public room backend unavailable or lost after restart | Resolved. The linked backend again passed two-client sharing, restart persistence, health, recovery, and new-room checks. |
| Verification 1–2: unknown routes returned HTTP 200 | Resolved. Unknown URLs return the designed HTML with HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved. The case-rules claim covers all 20 curated cases. |
| Verification 2: six public claims lacked registered tests | Resolved. Those six commands still pass. |
| Verification 6: undersized mobile targets | Resolved with measured cross-route browser coverage. |
| Verification 6: 404 skip-link overlap and default focus | Resolved at 390 px and 1440 px with keyboard-focus coverage. |
| Verification 6: three privacy claims lacked tests | Resolved with three exact claim commands. |

## Offer and remaining dependency

The offer remains **$6 USD once** for 19 additional curated cases, making 20
total, with no subscription. The permanent free case still works. Public
metadata is present in `.factory/billing-offer.json` and copied to
`/work/.evidence/billing-offer.json`.

Checkout registration is still owned by the separate billing operator. The
live purchase control remains disabled and says registration is pending. The
tests use recorded license verification fixtures and do not claim that a live
checkout or paid activation passed. No offline behavior is promised.

The separately named `factory-evidence/orderly-chaos-verify-6/qa-report.md`
was not mounted anywhere under `/work`; the complete repository copy in
`.factory/verification-6.md` was used.

## How to verify

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Run each exact command in `.factory/claims.json` separately. Then run the full
suite against the public origin:

```sh
BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
```

Evidence is status-only. It contains no credentials, cookie values, room
codes, player access values, or license values.
