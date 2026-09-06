# Handoff

## Outcome

**PASS — the public room service now survives static releases and container
revision restarts.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Deployed product implementation: `27713d6d1ff7870bea61eff169daa0405f0f3986`
- Deployment-tooling revision: `47633e5ae7e74bc6cb3716a7ff5810252f0be6f1`
- Active backend revision: `sf-orderly-chaos--0000010`
- Evidence: `/work/.evidence/orderly-chaos-repair-6/`

The recurring defect was a deployment-topology conflict. The container deploy
set the product CNAME to the Rust service at 04:36:33 UTC, then the work
order's automatic static deployment set it back to Azure Static Web Apps at
04:41:26 UTC. Restarting a container revision did not change DNS; the later
static release did.

The static site is now the stable public origin. Its linked backend sends
`/api/*` to the owned `sf-orderly-chaos` Container App. Static routing rewrites
public `/health` to the backend's `/api/health` alias. Static releases no
longer disconnect multiplayer, and container restarts no longer depend on a
CNAME cutover.

The backend link remained provisioned after a fresh static upload. The active
container still has one minimum and maximum replica, the existing
`sf-orderly-chaos-data` volume at `/data`, and SQLite state at
`/data/orderly-chaos.sqlite3`. `scripts/deploy-backend.sh` now updates only the
owned image and verifies the build through the linked API, preserving that
topology.

## Verification completed

- Clean `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; `dist/` produced. Initial JavaScript is 11.72 KB gzip
  and CSS is 4.13 KB gzip.
- All 17 exact commands in `.factory/claims.json`: pass independently against
  the documented local Rust/SQLite server.
- `npm run verify:live`: pass after restarting the owned active revision.
- Full restart-enabled live suite: 23/23 pass.
- Two independent browser contexts created and joined one room. One solved the
  case, the other read the server-validated result, and the result persisted
  through restart. A new room also succeeded after restart.
- Live expiry, two-player limit, access isolation, and burst recovery pass.
  The burst returns 429 with `Retry-After: 1`; health stays available.
- Public `/health` returns 200 JSON with build `27713d6`; room creation returns
  200 JSON; an unknown route returns the designed HTML with HTTP 404.
- Fresh 1440 × 900 desktop and 390 × 844 phone contexts show the play task,
  audience, sample action, active board, and an exhibit before scrolling.
  Both have no horizontal overflow or console errors.
- The one-click demo loads six populated exhibits with the persistent sample
  label. Reset returns to 0/9 and leaves normal solo storage unchanged.
- The recorded deterministic run reaches **Case solved** with four comparisons
  and five tokens remaining. Win evidence, replay, loss, and restart pass.
- Keyboard, mouse, touch, focus, reduced motion, local-data clearing, route
  titles, legal pages, links, and settings persistence pass.
- `/opt/fleet/lib/verify-url.sh`: pass — HTTPS 200, correct title and language,
  one h1, main landmark, alt text, labelled buttons, and no console errors.
- Playwright Axe across every public route and the controls dialog: no serious
  or critical issues.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1,302 ms, CLS 0, TBT 91 ms.
- The registered phone-class active-play measurement passes at 50 fps or
  better. No offline or update behavior is promised.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: public room backend unavailable or lost after restart | Resolved at the deployment cause. The stable static origin now proxies the owned backend, and both release and full live suites pass after restart. |
| Verification 1–2: unknown routes returned HTTP 200 | Remains resolved. The designed page returns HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Remains resolved. The case-rules claim passes all 20 distinct exhibit sets and rules. |
| Verification 2: six public claims lacked registered tests | Remains resolved. All 17 registered claim commands pass independently. |

## Offer and remaining dependency

The researched offer is unchanged: **$6 USD once** for 19 additional curated
cases, making 20 total. It is not a subscription. Public metadata is copied to
`/work/.evidence/billing-offer.json`; the verb-first 82-character catalog copy
is copied to `/work/.evidence/catalog-description.txt`.

Checkout registration remains an external billing-operator dependency. The
product still says purchases cannot begin until registration is complete.
Recorded fixtures verify license grant and revocation behavior; no checkout or
paid activation is claimed as live-tested. The free case and real two-player
mode work without a purchase.

No AI feature was added because the brief explicitly excludes AI tutoring and
the deterministic deduction loop does not need model inference. The existing
original generated archive art remains on-thesis; no new image generation was
needed for this routing repair.
