# Handoff

## Outcome

**PASS — the live repair is complete.** Orderly Chaos is a five-minute browser
deduction game for adults and teens. Players order six museum exhibits using
limited comparisons, either solo or in a real asynchronous two-player room.

Live URL: <https://orderly-chaos.sociobot.in>

The live implementation is `6635570ff1846153c8ff095d3700707134dd8cbd`.
The repair documentation report is
`e3e5c6dab012528b4d66487514b3a4b4be7c71f2`; this handoff revision indexes
that report. The live container reports the implementation SHA from `/health`.

## Repair completed

The public hostname had been routed to a Static Web App fallback while the
product's healthy Rust/SQLite container was serving elsewhere. This made room
creation return HTTP 405, made `/health` return HTML, and sent unknown URLs as
HTTP 200.

The product was redeployed with its documented container command. The public
hostname now reaches the product-owned Axum service. It keeps the existing
`sf-orderly-chaos-data` volume mounted at `/data` and remains fixed at one
minimum and one maximum replica.

- `POST /api/rooms` returns JSON from the authoritative room service.
- `/health` returns HTTP 200 JSON with `status: "ok"` and the live build SHA.
- An unknown URL returns the designed HTML page with HTTP 404.
- A new `npm run verify:live` runtime contract checks those three outcomes
  against the HTTPS hostname before release acceptance.
- A browser regression check proves that a request without that browser's room
  access cannot read an existing room.

See [`.factory/verification-2.md`](verification-2.md) for the repair evidence
and the disposition of the earlier failed verification.

## Verification

From the documented clean setup, `npm ci` completed with zero audit
vulnerabilities. `npm test` passed with 5 deterministic game tests, 3
Rust/SQLite tests, and 17 browser scenarios. `npm run build` passed and wrote
`dist/`; the initial JavaScript remains 10.87 KB gzip and CSS 3.95 KB gzip.

Every exact command in `.factory/claims.json` was run separately and passed:
the deterministic win, restart, local persistence, demo isolation, settings,
privacy, two independent browsers, 24-hour room expiry timestamp, case-pack
fixture, and 50 fps render check. No declared claim is untested.

The final 17-scenario browser suite passed against the HTTPS origin. It covers
the delivery contract, room-access isolation, deterministic win, fresh
desktop/phone layout, and every declared claim. Two independent browsers
created, joined, solved, and read the same room; that state also survived an
owned-app restart. The live rate-limit recovery scenario observed HTTP 429
with `Retry-After: 1`.

`/opt/fleet/lib/verify-url.sh` passed on the final HTTPS root: title,
`lang=en`, one `<h1>`, one `<main>`, image alt text, labelled buttons, and no
console errors. Playwright Axe found no serious or critical issues across all
public routes. Fresh desktop and 390 px phone browsers showed the game before
scrolling with this title, audience, and first action:

- Job: “Solve an ordering puzzle with limited comparisons.”
- Audience: curious adults and teens seeking a five-minute deduction game.
- First action: “Try it with sample data.”

The final deterministic demo run reached the real **Case solved** screen.
Evidence in `/work/.evidence/` contains only screenshots and status results;
it contains no credentials, room access values, or cookies.

## Paid offer and known gap

The researched offer remains unchanged: a $6 USD one-time complete case pack
with 19 paid cases, for 20 total. There is no subscription. The free case
remains playable. Checkout registration is still an external dependency of
the separate billing operator, so the UI honestly says purchases are pending
and does not claim activation or checkout success. Public metadata remains in
`.factory/billing-offer.json` and `/work/.evidence/billing-offer.json`.

The research success measures (first-run solve rate and a second-case attempt
rate) need user research. The product does not claim those results have been
measured.

## How to run and deploy

```sh
npm ci
npm test
npm run build
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh orderly-chaos /work/repo Dockerfile 8080
npm run verify:live
```

Use the container deployment, not a static-only deployment: real rooms require
the product-owned Rust service and its durable SQLite mount.
