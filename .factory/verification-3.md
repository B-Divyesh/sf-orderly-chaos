# Verification 3 — PASS

**Verdict: PASS.** All four findings and all six untested public claims from
verification 2 are resolved.

- Live URL: <https://orderly-chaos.sociobot.in>
- Deployed source: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Live revision: `sf-orderly-chaos--0000006`
- Verification date: 2026-09-06 UTC

## Finding disposition

1. **Live room backend — resolved.** DNS targets the product container.
   `/health` returns JSON for the deployed SHA; room creation works; two
   independent browsers share server-validated state; the state survives an
   owned-app restart; expiry, access isolation, and 429/`Retry-After` pass.
2. **HTTP 404 — resolved.** Unknown live URLs return HTTP 404 with the designed
   page. The container handles this directly, and the static configuration has
   an explicit catch-all 404 as a fallback safeguard.
3. **Per-case inference — resolved.** Every curated case has a distinct exhibit
   set and placement rule. Rules constrain the possible-order set and produce
   deductions; they are not labels on the starting clue.
4. **Six untested claims — resolved.** Dedicated outcome tests now cover the
   five-minute deterministic sample, all three input methods, the permanent
   free-case loop, Start-for-real cleanup, the two-player room limit, and
   revoked-license removal. A separate claim also covers the new case rules.

## Results

- Clean setup: `npm ci` passed with 0 vulnerabilities.
- `npm test`: 6 unit, 3 server, and 23 browser tests passed.
- All 17 exact commands in `.factory/claims.json`: passed separately.
- Final live Playwright suite: 23 passed.
- Live restart persistence check: passed with two independent clients.
- URL verifier: passed with no console errors.
- Playwright Axe: 0 serious or critical violations.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1,426 ms, CLS 0, TBT 52 ms.
- Initial bundle: 11.72 KB JavaScript gzip and 3.98 KB CSS gzip.
- Phone-class active-play measurement: 60 fps.

The $6 USD one-time offer for 19 paid cases remains intact and clearly states
that checkout registration is pending. Recorded fixtures test license grant
and revocation; no live checkout or entitlement is claimed.

Evidence is in `/work/.evidence/orderly-chaos-repair-3/`. Screenshots, video,
and reports contain no credentials, room access values, or cookies.
