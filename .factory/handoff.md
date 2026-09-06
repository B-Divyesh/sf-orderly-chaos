# Handoff

## Outcome

**PASS — the live shared-room service is available at the product origin.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Product implementation: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Deployed source revision: `0ed5e8234e61012dfcec92d5104317fe5c4b5c8c`
- Verification documentation: `494a989d53a4f4096f9514a64af4b33a1a7e9fbf`
- Deployed container revision: `sf-orderly-chaos--0000007`
- Repair report: `.factory/verification-4.md`

The implementation already contained the tested Rust/SQLite room service. The
failure was at the deployment layer: the public hostname served a static
fallback for backend routes. Repair 4 deployed the repository's `Dockerfile`
to the owned `sf-orderly-chaos` container app and bound the product hostname to
that service.

The deployed app keeps one running replica, one maximum replica, and the
existing `sf-orderly-chaos-data` volume mounted at `/data`. SQLite state stays
at `/data/orderly-chaos.sqlite3`. No shared database is used.

## Verified

- `npm ci`: pass with no audit vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright tests.
- `npm run build`: pass; `dist/` produced.
- Every command in `.factory/claims.json`: pass when run separately.
- `npm run verify:live`: pass against the HTTPS origin.
- Full live Playwright suite with `LIVE_RESTART=1`: 23/23 pass.
- Two independent browser clients created and joined one room. One client
  solved the case and the second read the authoritative result.
- The same room remained available after restarting the owned container
  revision, proving SQLite persistence on the durable mount.
- A client without room access received 401. A third player received 409.
- Room expiry was 24 hours. Burst requests received 429 and `Retry-After: 1`,
  and health remained available.
- `/health` returned JSON with status `ok`; unknown routes returned the
  designed page with HTTP 404.
- Fresh desktop and 390 x 844 phone browsers showed the play task, audience,
  sample action, three facts, and game board without console errors or page
  overflow.
- The one-click demo loaded six exhibits, kept its sample-data label, reset
  cleanly, and did not change normal saved play.
- A deterministic live run reached the `Case solved` end screen with four
  comparisons and offered replay. The loss and restart paths also passed.
- Keyboard, mouse, touch, focus, reduced motion, route titles, legal pages,
  links, local data clearing, and Playwright Axe checks passed. Axe found no
  serious or critical violations on any public route or the controls dialog.
- `/opt/fleet/lib/verify-url.sh` passed: one `h1`, `lang=en`, a `main`
  landmark, alt text, labelled controls, and no console errors.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.43 seconds, CLS 0, and total blocking time 48 ms.
- The active-play browser profile met the registered 50 fps minimum.
- Initial assets remain within budget: JavaScript 33.96 KB and CSS 13.76 KB
  uncompressed; the 720 px scene is 42.08 KB.

Status-only evidence is in `/work/.evidence/orderly-chaos-repair-4/`. It
contains fresh desktop, phone, demo, and win-screen captures, URL-verifier
output, and Lighthouse JSON. It contains no room access values, credentials,
cookies, or tokens.

## Offer and remaining dependency

The researched offer is unchanged: $6 USD once for 19 additional curated
cases, making 20 total. It is not a subscription. Public offer metadata is in
`.factory/billing-offer.json` and copied to
`/work/.evidence/billing-offer.json` for the isolated billing operator.

Checkout registration remains an external dependency. The interface still
states that registration is pending. Recorded fixtures verify license grant
and revocation behavior, but no checkout or paid activation is claimed as
live-tested.

## Run and deploy

```sh
npm ci
npm test
npm run build
LIVE_RESTART=1 BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
```

Deploy only as the product container so `/health` and `/api/*` stay on the
same origin as the game:

```sh
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh orderly-chaos /work/repo Dockerfile 8080
```

Do not replace this deployment with a static-only host. Preserve the `/data`
volume and the one-replica minimum and maximum.
