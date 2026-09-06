# Verification 5 — PASS

**Verdict: PASS.** There are **0 current product findings** and **0 untested
declared claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Deployed implementation: `d18376d0d0e4c18e1981b9f000bc8412cb9560c4`
- Verification documentation revision: `74bc9d21e07c477a16700767a80436681af5bbd4`
- Verification date: 2026-09-06 UTC

## Repair verified

The owned product container served `/health` as JSON while the public hostname
served a stale static host. The public CNAME was restored by deploying the
committed product container with its existing durable `/data` mount and
one-replica SQLite bound. The healthy public runtime now returns:

- `GET /health` → HTTP 200 JSON with implementation build `d18376d`
- `POST /api/rooms` → HTTP 200 JSON
- `GET /not-a-product-route` → designed HTML, HTTP 404

`npm run verify:live` passed after an owned revision restart. It confirmed the
health body, a solved room persisted across restart, a second room could be
created after recovery, and the deliberate 404 remained correct. The full
restart-enabled live browser suite then passed all 23 checks.

## Product checks

- Fresh 1440 × 900 desktop and fresh 390 px phone contexts showed the playable
  game first. The h1 names the job: “Solve an ordering puzzle with limited
  comparisons.” The audience and sample action are visible before scrolling.
- The one-click `/demo` route showed six exhibits, its persistent sample label,
  Reset demo, Start for real, and `0/9` comparisons. The full live suite
  proved reset and demo isolation from normal browser data.
- A deterministic live run reached the real win screen. Loss, replay, restart,
  settings, keyboard, pointer, touch, reduced motion, privacy clearing, legal
  routes, links, and the designed 404 passed.
- Two independent browser contexts created and joined a room, then one player
  solved it and the other read the authoritative server result. Expiry,
  two-player boundary, unauthorised access, rate-limit recovery, and persisted
  restart state passed.
- No offline claim is made. Solo play remains local-first; the two-player mode
  uses only the product-owned server.

## Quality checks

- Fresh `npm ci`: pass, 0 reported vulnerabilities.
- `npm test`: pass — 32 checks total (6 Vitest, 3 Rust/SQLite, 23 Playwright).
- `npm run build`: pass; `dist/` produced, with 11.71 KB gzip JavaScript and
  3.98 KB gzip CSS.
- All 17 exact claim commands ran independently and passed.
- `/opt/fleet/lib/verify-url.sh`: pass with no console errors.
- Live Playwright Axe: 0 serious or critical issues across public routes and
  the controls dialog.
- Mobile Lighthouse: performance 99, accessibility 100, best practices 100,
  SEO 100; LCP 1,425 ms, CLS 0, TBT 95 ms.

## Earlier review disposition

| Finding | Disposition |
| --- | --- |
| Verification 1–4 F-1, static routing replaced room service | Resolved by restoring the public product hostname to the healthy owned container. Restart recovery is now part of `verify:live`. |
| Verification 1–2 F-2, HTTP 200 on missing route | Resolved and rechecked: designed 404 is HTTP 404. |
| Verification 2 F-3, cases lacked distinct inference rules | Resolved; the 20-case rule claim passes. |
| Verification 2 F-4, claims missing tests | Resolved; all 17 registered public claims passed separately. |

## Paid content and evidence

The researched paid deliverable remains $6 USD once for 19 additional curated
cases (20 total), with no subscription. Checkout registration remains an
external dependency and is honestly unavailable; no purchase or entitlement
claim is made.

Status-only evidence is in `/work/.evidence/orderly-chaos-repair-5/`. The
catalog description copy is at `/work/.evidence/catalog-description.txt`.
Neither contains credentials, cookie values, room codes, player tokens, or
license values.
