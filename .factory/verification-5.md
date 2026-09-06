# Verification 5 — FAIL

**Verdict: FAIL.** There is **1 critical finding** and **0 untested public
claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Reviewed implementation: `a1f64ae39dc18764310169be498ee7622e6dc0e4`
- Documentation revision at review: `23a60066c267d25afff8ed0bcaed9ddf2fbc5b6d`
- Verification date: 2026-09-06 UTC

The live JavaScript is byte-identical to the fresh production build from the
reviewed implementation lineage (`e4610ff1…`). Commits after `a1f64ae` only
changed factory reports.

## First screen and complete run

Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the playable
board before scrolling, without horizontal overflow or console errors.

- Job: **“Solve an ordering puzzle with limited comparisons.”**
- Audience: curious adults and teens who want a five-minute deduction game.
- First action: **“Try it with sample data,”** with an explanation that the
  sample does not change saved play.
- Phone and desktop also showed the active board and an exhibit before
  scrolling.

The one-click demo opened six populated exhibits at `0/9` comparisons. Its
persistent label said **“Demo — Sample data. Nothing is saved to your real
game”** and included **Reset demo** and **Start for real**. Reset and storage
isolation passed.

A deterministic live run used four comparisons, arranged all six exhibits,
and reached the real **Case solved** screen with five tokens remaining. The
end screen showed the complete order and **Play this case again**. The live
suite also passed loss, replay, restart, settings, keyboard, mouse, touch,
reduced-motion, privacy-clearing, legal, and designed-404 paths.

## Finding

### F-1 — Critical: public multiplayer routing fails after revision restart

Two independent browser contexts successfully created and joined one room,
and the second browser read the first player's server-validated solved result.
The required restart test then restarted only the active owned
`sf-orderly-chaos` revision. The public hostname did not recover the product
runtime within the test's 180-second limit.

Fresh direct checks after the timeout returned:

- `GET /health` → **404 `text/html`**, not 200 health JSON.
- `POST /api/rooms` → **405**, so no new room can be created.
- Twelve room-create requests → 405, not the required 429 with
  `Retry-After: 1`.
- `GET /independent-qa-missing-route` → the designed HTML with **HTTP 404**.
  This is expected and is not a defect.

The owned container itself remains active and healthy with one replica. Its
direct endpoint returns 200 JSON and reports build `a1f64ae`. The failure is
therefore the public hostname reverting to the static host after revision
restart, not a stopped container or a failing application health endpoint.

The restart-enabled live suite finished with **17 passed and 6 failed**. The
six failures were shared-room recovery, room expiry, the third-player limit,
health/API routing, unauthorised-room-access setup, and 429 recovery. The
documented `npm run verify:live` command independently failed both of its
release checks in the same public state.

This is the recurrence of verification 4 F-1. Restore the public product
hostname to the healthy owned runtime and make that routing survive an owned
revision restart. Then repeat two-client sharing, persisted result recovery,
new-room creation, expiry, third-player rejection, access isolation, and
429/`Retry-After` after restart.

## Declared claims

From the clean documented setup, all 17 exact commands in
`.factory/claims.json` were run separately and passed against the local
Rust/SQLite service. No declared claim was skipped.

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
| case-pack | Pass (recorded fixture) | Pass (recorded fixture) |
| case-rules | Pass | Pass |
| license-revocation | Pass (recorded fixture) | Pass (recorded fixture) |
| steady-render | Pass | Pass |

Untested public claims: **0**. Failed live claims are findings, not untested
claims.

## Other checks

- Fresh `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; `dist/` produced. Initial JavaScript is 11.72 KB
  gzip and CSS is 4.13 KB gzip.
- `/opt/fleet/lib/verify-url.sh`: pass — HTTPS 200, `lang=en`, one h1, main
  landmark, image alt text, labelled buttons, and no console errors.
- Live Playwright Axe: 0 serious or critical issues across public routes and
  the controls dialog. Keyboard operation, visible focus, reduced motion,
  mobile layout, and browser-data clearing passed.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best
  practices 100, SEO 100; LCP 1,203 ms, CLS 0, TBT 70 ms.
- All public routes, product assets, the external factory link, route titles,
  legal pages, and the designed 404 responded as intended. No offline or
  update behavior is promised.
- Security headers include CSP, `nosniff`, referrer policy, permissions
  policy, and frame denial.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–4 F-1: public room backend unavailable or lost after restart | **Recurred as F-1 after the required owned revision restart.** |
| Verification 1–2 F-2: unknown route returned HTTP 200 | Remains resolved; the designed missing page returns HTTP 404. |
| Verification 2 F-3: cases lacked distinct inference rules | Remains resolved; the claim passes 20 distinct exhibit sets and rules. |
| Verification 2 F-4: public claims lacked registered tests | Remains resolved; all 17 registered commands ran separately. |

## Paid content and evidence

The complete public offer remains clear: **$6 USD once** for 19 additional
curated cases, 20 total, with **no subscription**. Checkout registration is
still an external billing dependency and the live UI accurately says purchases
cannot begin. No checkout or paid activation is claimed as verified.

Status-only evidence is in
`/work/.evidence/orderly-chaos-verify-5-independent/`, including fresh phone,
desktop, populated-demo, and win-screen images; first-screen results;
Lighthouse JSON; URL verification; and redacted backend status. Evidence and
this report contain no credentials, cookie values, room codes, player tokens,
or license values.
