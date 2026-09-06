# Handoff

## Outcome

Built and deployed Orderly Chaos as a complete browser deduction game. A player
orders six museum exhibits from lightest to heaviest using one free clue and
nine comparison tokens. A run has active play, correct and incorrect end
screens, efficiency feedback, replay, restart, saved progress, sound settings,
and reduced motion.

The deployed product supports solo play and real asynchronous two-player rooms.
Two independent browsers receive separate access tokens, solve the same seeded
case, and read server-validated results from authoritative SQLite state. Room
codes expire after 24 hours.

Live URL: <https://orderly-chaos.sociobot.in>

## Implementation and deployment

- Live implementation SHA: `07733f527a5263ccc4846d731d7202c4c6fee464`
- Initial complete-build SHA: `1f8bc8fbbe1d1114ca83ed0aaff17eda78ddd0ea`
- Live revision: `sf-orderly-chaos--0000002`
- Container image digest: `sha256:183eb16ed0f023bb788f31c3d9faa774fa22b1f729a010b11d0a3bb969e5d5d7`
- Runtime: Rust/axum serving the Vite bundle and room API on port 8080
- State: `/data/orderly-chaos.sqlite3` on `sf-orderly-chaos-data`
- Scale: one minimum and one maximum replica
- Health: `/health` returns status `ok` and the live implementation SHA

The work order initially classified deployment as static. The required
authoritative two-player mode cannot work in a static-only bundle, so the
product uses the permitted product-owned Rust/SQLite service. The free solo and
demo paths remain browser-local.

Azure Files does not provide SQLite-compatible byte-range locks. The production
`/data` connection therefore uses SQLite's `unix-none` VFS and is safe only
under the enforced one-replica bound. Local and test databases retain normal
SQLite locking. Startup also retries transient database access errors.

## Paid offer

The researched offer is preserved as a $6 USD one-time complete case pack. The
free case remains playable; a valid license unlocks 19 more curated cases, for
20 total. The product implements return-token storage, daily verification,
revocation handling, and manual license restore through the Sociobot API.

The separate billing operator has not registered checkout: the public checkout
endpoint returned HTTP 404 on 2026-09-06. The UI therefore says checkout
registration is pending and does not present a dead purchase link. Public offer
metadata is in `.factory/billing-offer.json` and
`/work/.evidence/billing-offer.json`. No checkout or paid activation is claimed
as production-tested.

## Verification

From a fresh clone of the implementation commit:

1. `npm ci` — passed with zero audit vulnerabilities.
2. `npm test` — passed: 5 deterministic game tests, 3 Rust/SQLite tests, and 15
   Playwright browser scenarios.
3. `npm run build` — passed and produced `dist/`.
4. Every command in `.factory/claims.json` ran separately and passed.

Browser coverage includes a deterministic win, a real loss, replay, confirmed
restart, reload persistence, demo reset/isolation, keyboard and arrow controls,
touch layout, settings persistence, reduced motion, dialogs, browser-data
clearing, invalid and boundary room inputs, designed 404, route titles, link
crawl, security headers, and console-error checks.

Production checks on 2026-09-06:

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, correct title and language,
  one `h1`, one `main`, alt text present, and no console errors.
- The complete 15-test Playwright suite passed against the HTTPS origin.
- The two-player test used two isolated browser contexts, not a bot or mock.
- The shared room and solved result remained after an actual live revision
  restart.
- A parallel live API burst returned HTTP 429 with `Retry-After: 1`.
- `/`, `/demo`, `/privacy`, `/terms`, and `/license` return 200. The deliberate
  unknown route returns the designed 404 with HTTP 404.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.6 s, CLS 0, total blocking time 60 ms.
- Live mobile Lighthouse: performance 94, accessibility 100, best practices
  100, SEO 100; LCP 1.4 s, CLS 0, total blocking time 280 ms.
- Live 390×844 active play measured 60 fps over 2.5 seconds.
- Initial JavaScript is 10.87 KB gzip; CSS is 3.95 KB gzip; the mobile hero is
  42 KB WebP.

Evidence is under `/work/.evidence/`: live desktop and phone first screens,
the completed win screen, URL verification output, and local/live Lighthouse
JSON reports. Screenshots and reports contain no credentials, license values,
room access tokens, or cookies.

## Design and privacy

The original “surreal balance archive” visual system, palette, spacing, motion,
and generated-art prompt are recorded in `.factory/design.md`. The accepted
source image and provenance sidecar are in `assets/src/`; optimized WebP assets
ship in `public/`. Generated imagery is disclosed in the footer.

Solo and demo storage use separate localStorage namespaces. Room access stays
in sessionStorage; the server stores only token hashes. There are no analytics,
advertising scripts, remote fonts, or runtime AI features.

## Known gap and next step

The billing operator must register the offer from
`/work/.evidence/billing-offer.json`. After registration, verify a real hosted
checkout, return URL, license activation, and revocation, then enable the buy
link. Do not mark that dependency complete based on a redirect alone.

The research success measures (first-run solve rate and second-case attempt
rate) need user testing; the product makes no claim that those targets have
already been met.
