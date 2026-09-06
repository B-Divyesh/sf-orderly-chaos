# Verification 4 — PASS

**Verdict: PASS.** The critical live shared-room finding is resolved. There
are no new findings and no untested public claims.

- Live URL: <https://orderly-chaos.sociobot.in>
- Product implementation: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Deployed source revision: `0ed5e8234e61012dfcec92d5104317fe5c4b5c8c`
- Container revision: `sf-orderly-chaos--0000007`
- Verification date: 2026-09-06 UTC

## Repair

The public origin previously served the static fallback for backend paths.
The repository already contained the passing Rust/SQLite implementation, so
the cause was repaired by deploying the owned `sf-orderly-chaos` container and
binding `orderly-chaos.sociobot.in` to it.

The live configuration reports one minimum and one maximum replica. The
product-owned durable share `sf-orderly-chaos-data` is mounted at `/data`.
The service needs no secret configuration and uses no shared PostgreSQL.

## Live backend evidence

- `GET /health` returned HTTP 200 JSON with `status: ok` and deployed source
  revision `0ed5e8234e61012dfcec92d5104317fe5c4b5c8c`.
- `POST /api/rooms` created a room.
- Two fresh, independent browser contexts joined the same room. After the
  first solved the seeded case, the second retrieved its solved result.
- The owned container revision was restarted during that test. The room and
  solved result remained available afterward.
- A request without that room's access value received HTTP 401.
- A third join received HTTP 409 with the full-room explanation.
- The returned expiry was within five seconds of exactly 24 hours.
- A request burst reached HTTP 429 with `Retry-After: 1`; health still
  returned 200.
- An unknown route returned the designed HTML page with HTTP 404.

Room codes and access values were used only in ephemeral test contexts. They
were not printed or retained in evidence.

## Product and quality evidence

- Clean `npm ci`: pass, 0 vulnerabilities.
- `npm test`: 32/32 pass (6 unit, 3 Rust/SQLite, 23 browser).
- `npm run build`: pass and `dist/` produced.
- All 17 exact `.factory/claims.json` commands: pass individually.
- Full public suite with restart enabled: 23/23 pass.
- Fresh desktop and phone first screens name the task, audience, first action,
  price, persistence boundary, and room expiry. No overflow or console errors
  were observed.
- The sample loaded six populated exhibits with a persistent demo label. Demo
  reset and normal-data isolation passed.
- A deterministic public run reached the real `Case solved` screen with four
  comparisons. Loss, replay, and restart also passed.
- Keyboard, mouse, touch, focus, reduced motion, local data clearing, routes,
  links, privacy, terms, and designed 404 checks passed.
- Playwright Axe found no serious or critical issues across all public routes
  and the controls dialog.
- `verify-url.sh` passed the live root with no console errors.
- Lighthouse scored 100 for performance, accessibility, best practices, and
  SEO. LCP was 1,426 ms, CLS 0, and total blocking time 48 ms.
- Initial JavaScript is 33,955 bytes and CSS is 13,764 bytes uncompressed.
- The active-play phone-class profile met the registered 50 fps minimum.

## Earlier findings

| Finding | Current disposition |
| --- | --- |
| Verification 1 F-1 / verification 2 F-1 / verification 3 F-1: room backend unavailable | Resolved. Public health, room creation, two-client sharing, expiry, access isolation, restart persistence, and rate-limit recovery pass. |
| Verification 1 F-2 / verification 2 F-2: unknown route returned 200 | Remains resolved. The live response is HTTP 404 with the designed page. |
| Verification 2 F-3: per-case inference rule missing | Remains resolved. The claim test covers 20 distinct exhibit sets and placement rules that narrow valid orders. |
| Verification 2 F-4: six public claims were absent | Remains resolved. The registry contains 17 claims, and every exact command passed. |

## Offer status

The public offer remains $6 USD once for 19 additional cases, 20 total, with
no subscription. Checkout registration is still pending with the separate
billing operator. The product does not claim that checkout or activation has
passed. Valid and revoked license behavior passed recorded-fixture tests.

## Evidence

Status-only evidence is stored in
`/work/.evidence/orderly-chaos-repair-4/`. Public catalog and billing metadata
are copied to `/work/.evidence/catalog-description.txt` and
`/work/.evidence/billing-offer.json`. No credentials, cookies, room access
values, or tokens are present.
