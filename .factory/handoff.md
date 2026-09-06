# Handoff

## Outcome

Repair 8 closes the verification-7 claims-contract finding.

- Live URL: <https://orderly-chaos.sociobot.in>
- Runtime implementation: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Repair documentation revision: `78dc5ca9fcb7e75da7eea5df22fd3e2e71ed95b7`
- Prior verification documentation: `7a446638fec79f3ae5203c424c21add05626407f`
- Repair: the existing Rust/SQLite production-handler test for hashed room
  access storage now carries its required `@claim:room-token-hash` tag.

The tag is attached directly to the test that creates a room through the
production handler and proves SQLite stores a 64-character SHA-256 value,
not the returned access value. No room behavior, data format, price, or game
scope changed.

## Verification

From the documented clean setup:

```sh
npm ci
npm test
npm run build
```

- `npm ci` passed with 0 reported vulnerabilities.
- All 20 exact commands in `.factory/claims.json` passed separately.
- The claim audit found exactly one `@claim:<id>` tag in test source for each
  of the 20 declared IDs, including `room-token-hash`.
- `npm test` passed: 6 core tests, 4 Rust/SQLite tests, and 27 Playwright
  checks.
- `npm run build` produced `dist/`; initial JavaScript is 11.72 KB gzip and
  CSS is 4.19 KB gzip.
- The focused `room-token-hash` command passed and still verifies observable
  at-rest hashing through the real handler.

The owned backend deployment preflight confirmed one replica and the durable
`/data` mount. The image-only deployment preserved that topology. Public
`/api/health` reports the runtime implementation SHA above.

After deployment:

- `npm run verify:live` passed 2/2, including an owned revision restart,
  persisted shared-room result, new-room recovery, health JSON, and deliberate
  404 behavior.
- The full public HTTPS Playwright suite passed 27/27, covering the complete
  win/loss loop, reset, keyboard/mouse/touch, demo isolation, two independent
  browser clients, expiry, third-player rejection, unauthorised access, 429
  recovery, legal routes, mobile targets, reduced motion, privacy, and Axe.
- `/opt/fleet/lib/verify-url.sh` passed with one `h1`, `lang=en`, `main`,
  image alt text, labelled controls, and no console errors.
- Fresh 1440 px desktop and 390 px phone browser contexts showed the job,
  audience, sample action, game board, and an exhibit before scrolling. Both
  had no horizontal overflow or console errors.
- `/repair-8-not-found` returns HTTP 404 as designed.

Fresh screenshots and the URL-verifier output are in
`/work/.evidence/orderly-chaos-repair-8/`. The catalog description was copied
to `/work/.evidence/catalog-description.txt`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: live room backend unavailable or lost after restart | Resolved and rechecked after the owned revision restart. |
| Verification 1–2: unknown routes returned 200 | Resolved; current deliberate missing route is HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved; the curated-case rule claim remains green. |
| Verification 2: public claims lacked registrations | Resolved. |
| Verification 6: undersized targets and 404 focus overlap | Resolved; full live browser checks remain green. |
| Verification 6: three privacy claims lacked tests | Resolved. |
| Verification 7: missing `@claim:room-token-hash` tag | Resolved by this repair; behavior and tag audit both pass. |

## Offer and remaining dependency

The permanent free case remains playable. The complete offer remains **$6 USD
once** for 19 additional curated cases, 20 total, with no subscription.
Checkout registration is still an external billing-operator dependency. The
public control remains disabled and says registration is pending; this repair
does not claim a checkout or paid activation passed.

## How to verify again

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Run each exact command in `.factory/claims.json` separately. The live suite
requires the product-owned backend and contains no credentials or test tokens.
