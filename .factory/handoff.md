# Handoff

## Outcome

**PASS — all four repair findings are resolved on the live product.** Orderly
Chaos now serves its Rust/SQLite runtime at
<https://orderly-chaos.sociobot.in>, returns a real 404 for unknown routes,
uses a working placement rule in every case, and declares an outcome test for
every public claim identified by verification 2.

- Deployed source SHA: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Core inference and regression commit: `77dad5a`
- Claims and product documentation commit: `e5a80f8`
- Live revision: `sf-orderly-chaos--0000006`
- Container image: `sha256:de1fe5c66bedce0dd16673097a250e6e8caac6d819e75c758a48288b32b2a855`

## Repairs

- The product hostname now points to the owned `sf-orderly-chaos` container.
  `/health` returns JSON, `POST /api/rooms` creates a room, and unknown paths
  return the designed HTML page with HTTP 404.
- The container retains `sf-orderly-chaos-data` at `/data` and remains fixed
  at one minimum and one maximum replica for SQLite safety.
- All 20 curated cases now have distinct exhibit sets and seed-specific
  placement rules. The solver enumerates orders consistent with the case rule,
  free clue, and comparisons, then displays only relations shared by every
  remaining order.
- Six missing public promises now have dedicated tests: the five-minute sample,
  free-case win/loss loop, keyboard/mouse/touch input, demo cleanup, the
  two-player boundary, and revoked-license behavior. The case-rule behavior
  also has its own declared claim. There are 17 declared claims in total.
- The static-host configuration now has an explicit catch-all 404 as a fallback
  safeguard. Authoritative rooms still require the container runtime.
- The missing-page heading now uses direct language: “This page was not found.”

## Verification

From the documented clean setup:

- `npm ci` passed with zero audit vulnerabilities.
- `npm test` passed: 6 Vitest tests, 3 Rust/SQLite tests, and 23 Playwright
  scenarios.
- `npm run build` produced `dist/`; initial JavaScript is 11.72 KB gzip and CSS
  is 3.98 KB gzip.
- Every exact command in `.factory/claims.json` was run separately and passed.

Against the final HTTPS deployment:

- The full 23-scenario Playwright suite passed.
- Two isolated browser clients created and joined one room. One solved it and
  the other read the server-validated result. The result remained after an
  actual restart of the owned app revision.
- Room expiry, access isolation, the two-player limit, and live 429 with
  `Retry-After: 1` all passed.
- A deterministic run reached **Case solved**; a wrong submission reached
  **Case lost**; replay and restart passed.
- Fresh 1440×900 and 390×844 browsers showed the job, audience, sample action,
  and game before scrolling, with no horizontal overflow or console errors.
- The demo loaded six exhibits, kept its sample-data label visible, reset to
  0/9 comparisons, and did not change normal game storage.
- `/opt/fleet/lib/verify-url.sh` passed with the expected title, `lang=en`, one
  `h1`, one `main`, alt text, labelled controls, and no console errors.
- Playwright Axe found no serious or critical issues on all public routes and
  the rules dialog.
- Mobile Lighthouse scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1,426 ms, CLS was 0, and TBT was 52 ms.
- Active play measured 60 fps in the phone-class browser profile.

Evidence is under `/work/.evidence/orderly-chaos-repair-3/`, including fresh
desktop and phone views, the populated demo, the completed end screen, a run
recording, URL-verifier output, and Lighthouse JSON. It contains no
credentials, room access values, or cookies.

## Paid offer and remaining dependencies

The researched offer is unchanged: $6 USD once for 19 additional cases, 20
total, with no subscription. The permanent free case remains playable. Public
metadata is in `.factory/billing-offer.json` and copied to
`/work/.evidence/billing-offer.json`.

Checkout registration is still owned by the separate billing operator. The UI
continues to say registration is pending; no live checkout or paid activation
is claimed. Tests use recorded valid and revoked verification responses.

The research targets for first-run completion and second-case attempts still
need user research and are not presented as achieved. The external work-order
metadata still labels deployment as static; future releases must use the
documented container command or multiplayer will be removed from the public
origin again.

## Run and deploy

```sh
npm ci
npm test
npm run build
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh orderly-chaos /work/repo Dockerfile 8080
npm run verify:live
```
