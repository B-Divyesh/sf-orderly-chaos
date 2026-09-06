# Handoff

## Outcome

**PASS — the public multiplayer service survives an owned revision restart.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Deployed implementation: `a1f64ae39dc18764310169be498ee7622e6dc0e4`
- Verification documentation revision: recorded in the report-only follow-up commit
- Verification report: `.factory/verification-5.md`

The public CNAME had pointed at a stale static host. The owned Rust/SQLite
container was healthy at its direct endpoint, so the code and durable database
were not the cause. Deploying the committed product container restored the
public hostname to the product runtime. The active revision is healthy, uses
one replica, and retains the existing `/data` Azure Files mount.

The repair also makes regression coverage stricter. `npm run verify:live` now
restarts the owned active revision and proves all four observable outcomes:
health JSON, a persisted shared-room result, a newly created room, and a real
HTTP 404 for an unknown route.

The phone layout now keeps the active case and exhibit cards in the first
390 × 844 px screen. The title, audience, sample action, real-case action, and
sample-storage explanation remain before the interactive board.

## Verification completed

- Fresh `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; `dist/` produced. Initial JavaScript is 11.72 KB gzip
  and CSS is 4.13 KB gzip.
- All 17 exact commands in `.factory/claims.json`: pass individually against
  the documented local Rust/SQLite server.
- `npm run verify:live`: pass — 2 restart-enabled public routing checks.
- `LIVE_RESTART=1 BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e`:
  pass — 23 checks, including two independent browser clients, persisted room
  state after restart, room expiry, third-player rejection, access isolation,
  429 with `Retry-After`, and a fresh post-restart room creation.
- Fresh desktop and phone browser contexts: pass. Both first screens show the
  game, the job, audience, and **Try it with sample data** action. The 390 ×
  844 phone view also shows active exhibit cards before scrolling. There is no
  horizontal overflow or console error.
- Demo: pass. `/demo` opens six populated exhibits with the persistent demo
  label, `0/9` comparisons, Reset demo, and Start for real. The isolated
  reset and normal-solo-data boundary passed in the live suite.
- Deterministic run: pass. The live sample reached the real **Case solved**
  screen and displayed replay; live loss and replay paths also passed.
- `/opt/fleet/lib/verify-url.sh`: pass — HTTPS 200, title, `lang=en`, one h1,
  main landmark, alt text, labelled buttons, and no console errors.
- Live Playwright Axe checks: 0 serious or critical violations across public
  routes and the controls dialog. Keyboard, touch, mouse, focus, reduced
  motion, privacy clearing, route titles, legal pages, links, and 404 checks
  passed.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1,427 ms, CLS 0, TBT 51 ms.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–4 F-1: live shared rooms unavailable after routing/restart | Resolved. Public health JSON, room creation, two-browser sharing, durable post-restart result, and a fresh post-restart room all pass. |
| Verification 1–2 F-2: unknown route returned HTTP 200 | Remains resolved. Public unknown routes return the designed HTML page with HTTP 404. |
| Verification 2 F-3: per-case inference rule missing | Remains resolved. The `case-rules` claim passes all 20 distinct exhibit-set and rule assertions. |
| Verification 2 F-4: public claims absent from the registry | Remains resolved. The registry has 17 claims and every exact command passed independently. |

## Evidence

Status-only evidence is in `/work/.evidence/orderly-chaos-repair-5/`:

- `live-desktop-first-screen.png` and `live-phone-first-screen.png`
- `live-phone-390x844-first-screen.png`
- `live-demo-populated.png` and `live-win-screen.png`
- `verify-url.json` and `lighthouse.json`

`/work/.evidence/catalog-description.txt` is an exact copy of the compliant,
verb-first catalog description. Evidence contains no credentials, cookies,
room codes, player tokens, or license values.

## Known gap and next step

The complete $6 USD one-time case pack remains intact: 19 additional curated
cases, 20 total, and no subscription. Sociobot checkout registration is still
an external billing-operator dependency. The interface and terms accurately
say that checkout cannot begin until that registration exists; no checkout or
paid activation is claimed as complete. The free case and real multiplayer
remain fully usable without it.
