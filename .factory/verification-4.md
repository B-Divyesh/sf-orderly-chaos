# Verification 4 — FAIL

**Verdict: FAIL.** There is **1 critical finding** and **0 untested public
claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Reviewed implementation candidate: `906bfe2bebd6049ce75819fa58197b7ebc6df605`
- Documentation revision at review: `46635f26ed590e76da762f4c64027ef78b186b9c`
- Verification date: 2026-09-06 UTC

The later commits after `906bfe2` only update factory documentation. The
production JavaScript asset is byte-identical to the build from the reviewed
implementation (`cac86eda0f6bd6e117527478c03595b2a817d19b02c2e5765a75f23cbef24a14`).

## First screen and game run

Fresh 1440 x 900 desktop and 390 x 844 phone browsers showed the playable game
on the first screen. Before scrolling they stated:

- Job: “Solve an ordering puzzle with limited comparisons.”
- Audience: curious adults and teens who want a five-minute deduction game.
- First action: “Try it with sample data,” which says it opens a complete case
  without changing saved play.

Both views showed the free $6-once, 19-case-pack price, browser-local solo
storage, and 24-hour room-code fact. There was no horizontal overflow or
console error. The one-click demo displayed six populated exhibits and the
persistent “Demo — Sample data. Nothing is saved to your real game” label.
Reset restored the sample to 0/9 comparisons and did not change normal solo
data.

A deterministic live demo run reached the real **Case solved** end screen and
offered replay. The full live suite also passed the loss, replay, restart,
settings, mouse, keyboard, touch, frame-rate, privacy, route, legal, 404, and
accessibility paths that do not depend on the room service.

## Finding

### F-1 — Critical: the room service does not survive a product revision restart

The required authoritative multiplayer service initially worked: two isolated
browser contexts created and joined one room, and the second read the first
player's solved result. The test then restarted the owned active product
revision, as required to verify durable SQLite persistence. The public origin
did not recover the Rust/SQLite runtime after that restart.

Direct checks after recovery time showed:

- `GET /health` → HTTP 404 `text/html`, instead of 200 health JSON.
- `POST /api/rooms` → HTTP 405, rather than creating a room.
- A 12-request create burst returned 405 responses rather than 429 with
  `Retry-After: 1`.
- The designed unknown-route page still returned the correct HTTP 404. This is
  expected behavior and is not a finding.

The post-restart live Playwright suite finished with **17 passed and 6 failed**.
The failures are the shared-room restart-persistence path, room expiry,
two-player boundary, health/API/404 release routing, unauthorised-room setup,
and rate-limit recovery. The failed room setup makes post-restart access
isolation unavailable as well.

This regresses the repair asserted by the previous verification-4 report. A
restart must keep the product hostname routed to the owned container, including
`/health` and `/api/*`, before this product can pass. Rerun two independent
browser clients, room expiry, third-player rejection, unauthorised access,
429/`Retry-After`, and durable-state checks after the recovery.

## Declared claims

After `npm ci`, all 17 exact commands in `.factory/claims.json` passed
individually against the documented clean local Rust/SQLite test server.
`npm test` also passed locally: 6 Vitest tests, 3 Rust/SQLite tests, and 23
Playwright tests. `npm run build` produced `dist/`.

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
| two-player-shared | Pass | **Fail after restart — F-1** |
| room-expiry | Pass | **Fail after restart — F-1** |
| two-player-limit | Pass | **Fail after restart — F-1** |
| case-pack | Pass (recorded fixture) | Pass (recorded fixture; no checkout claimed) |
| case-rules | Pass | Pass |
| license-revocation | Pass (recorded fixture) | Pass (recorded fixture) |
| steady-render | Pass | Pass (at least 50 fps phone-class profile) |

Untested declared claims: **0**. The $6 USD offer remains a one-time purchase
for 19 additional cases, 20 total. Checkout registration remains pending, and
no checkout or live paid activation was claimed.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1/2/3 F-1: live room backend unavailable | **Regressed as F-1 after an owned revision restart.** It works before the restart but is unavailable after recovery. |
| Verification 1/2 F-2: unknown route returned HTTP 200 | Remains resolved. A fresh unknown URL returns the designed page with HTTP 404. |
| Verification 2 F-3: per-case inference rule missing | Remains resolved. The local `case-rules` claim passed all 20 exhibit-set/rule assertions. |
| Verification 2 F-4: public claims missing from the registry | Remains resolved. The registry contains 17 claims, each run individually. |

## Other checks

- Live `npm run verify:live`: **failed**, correctly identifying `/health` as
  HTTP 404 after the restart.
- `/opt/fleet/lib/verify-url.sh` passed the live root: HTTPS 200, title,
  `lang=en`, one `h1`, `main`, image alt text, labelled controls, and no
  console errors.
- Live Playwright Axe checks across public routes and the controls dialog
  passed with no serious or critical issues. Keyboard, visible focus,
  reduced-motion, mobile, local-data clearing, route-title, legal-page, link,
  and designed-404 checks passed.
- The registered active-play measurement passed the 50 fps minimum in the
  phone-class browser profile. No offline claim is made.

## Evidence

Status-only evidence is in `/work/.evidence/orderly-chaos-verify-4/`:

- `live-desktop-first-screen.png`, `live-phone-first-screen.png`, and
  `first-screen-and-demo.json`
- `live-demo-populated.png` and `live-win-screen.png`
- `verify-url/verify.json`

The report and evidence contain no credentials, cookies, room codes, access
values, or license tokens.
