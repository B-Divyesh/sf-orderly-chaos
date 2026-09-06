# Verification 3 — FAIL

**Verdict: FAIL.** There is **1 critical finding** and **0 untested public
claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Reviewed implementation: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Documentation revision: `cdcaea200273a99f70d9fb6a3a6f4c91d7064b34`
- Verification date: 2026-09-06 UTC

The live JavaScript asset is byte-identical to the production build from the
reviewed implementation. The live host is nevertheless serving the static
frontend for the backend routes instead of the product Rust/SQLite runtime.

## First screen and solo run

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed the game before
scrolling. The first screen states:

- Job: “Solve an ordering puzzle with limited comparisons.”
- Audience: curious adults and teens who want a five-minute deduction game.
- First action: “Try it with sample data.”

The action opened the populated six-exhibit demo. Its persistent label says
“Demo — Sample data. Nothing is saved to your real game.” The reset and
Start-for-real isolation checks passed. A scripted deterministic live run used
the real comparison and movement controls and reached **Case solved**; the
end-screen screenshot is retained as status-only evidence.

The $6 USD one-time pack remains accurately described as 19 additional cases,
20 total, and no subscription. Checkout registration is still pending and was
not represented as a tested checkout or activation.

## Finding

### F-1 — Critical: live shared-room service is unavailable

The public host does not expose the required authoritative Rust/SQLite room
service.

- `GET /health` returns the designed HTML 404 (HTTP 404), not health JSON.
- `POST /api/rooms` returns HTTP 405 rather than creating a room.
- Two independent fresh browser clients cannot create/join a room, so they
  cannot share a server-validated result.
- The expiry and two-player-boundary claim paths fail at room creation.
- Twelve create attempts return 405 rather than reaching the required 429 with
  `Retry-After: 1`.

This makes the advertised real asynchronous two-player mode non-functional.
Because no public room can be created, tenant/access isolation and persistence
through a service restart also cannot be established. Route the live product
subdomain, including `/health` and `/api/*`, to the owned product container
with its SQLite `/data` mount, then rerun the live room, expiry, isolation,
restart-persistence, and rate-limit checks.

## Claim commands

After `npm ci`, every exact command in `.factory/claims.json` was run against
the documented local Rust test server. All 17 passed. The first sequential run
encountered a Playwright trace-artifact filesystem race only for
`two-player-shared`; its exact command was rerun alone and passed. This is not
an untested claim.

| Claim ID | Local exact command | Live disposition |
| --- | --- | --- |
| complete-run | Pass | Pass |
| five-minute-run | Pass | Pass |
| free-case-loop | Pass | Pass |
| restart-reset | Pass | Pass |
| progress-persistence | Pass | Pass |
| demo-isolation | Pass | Pass |
| start-real-cleanup | Pass | Pass |
| settings-persist | Pass | Pass |
| solo-local-privacy | Pass | Pass |
| control-inputs | Pass | Pass |
| two-player-shared | Pass | **Fail — F-1** |
| room-expiry | Pass | **Fail — F-1** |
| two-player-limit | Pass | **Fail — F-1** |
| case-pack | Pass | Pass with recorded fixture; no live checkout claimed |
| case-rules | Pass | Pass |
| license-revocation | Pass | Pass with recorded fixture |
| steady-render | Pass | Pass (at least 50 fps test profile) |

Untested declared claims: **0**. The live 23-scenario suite had **17 passed,
6 failed**; all six failures arise from F-1 (the three room claims plus
health/routing, unauthorised room access setup, and rate-limit recovery).

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1 F-1 / verification 2 F-1: live room backend unavailable | **Recurred as F-1.** Current direct and browser checks show 404/405 responses. |
| Verification 1 F-2 / verification 2 F-2: unknown route returned 200 | Resolved. A fresh unknown URL returns the designed page with HTTP 404. |
| Verification 2 F-3: per-case inference rule missing | Resolved. The `case-rules` command passed all 20 exhibit-set/rule and deduction assertions. |
| Verification 2 F-4: six public claims missing from registry | Resolved. The registry has 17 claims and every exact command was exercised. |

## Other checks

- Final local `npm test`: **32 passed** (6 Vitest, 3 Rust/SQLite, 23
  Playwright); `npm run build` produced `dist/`.
- Initial bundle: 11.71 KB JavaScript gzip and 3.98 KB CSS gzip.
- Live `verify-url.sh`: passed — HTTPS 200, title, `lang=en`, one `h1`, one
  `main`, image alt text, labelled buttons, and no console errors.
- Live Playwright Axe checks on public routes and the rules dialog: 0 serious
  or critical violations. Keyboard, visible focus, reduced motion, privacy
  clear-data, legal-route titles, links, and phone layout passed.
- Live mobile Lighthouse: 97 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 2.0 s, CLS 0, TBT 0 ms.
- Live deliberate 404 presentation passed. It is expected behavior and is not
  a defect.

## Evidence

Status-only evidence is in `/work/.evidence/orderly-chaos-verify-3/`,
including fresh desktop, phone, and populated-demo views; the completed run
end screen; URL-verifier JSON; and Lighthouse JSON. The report and evidence do
not retain credentials, room codes, access values, or cookies.
