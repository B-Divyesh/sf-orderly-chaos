# Verification 8 — PASS

**Verdict: PASS.** There are **0 findings** and **0 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate reviewed: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Documentation baseline reviewed: `c581a57f5d19947b1e4fe594ff13a10dd2c0f939`
- Verification date: 2026-09-06 UTC
- Evidence directory: `/work/.evidence/orderly-chaos-verify-8/`

The live backend health response reports the implementation candidate above.
The live JavaScript and CSS are byte-identical to the clean production build.
All commits after the implementation candidate only changed factory reports.

## First screen, sample, and complete run

Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the game board
and an exhibit before scrolling, with no horizontal overflow or console
errors.

- Job: **Solve an ordering puzzle with limited comparisons.**
- Audience: curious adults and teens who want a five-minute deduction game
  without a long rules lesson.
- First action: **Try it with sample data.** The adjacent sentence says the
  complete sample does not change the saved game.
- Facts: solo progress stays in the browser, rooms expire after 24 hours, and
  the complete 19-case pack costs $6 once.

The one-click sample opened six named exhibits, a placement rule, known-order
deductions, and `0/9` comparisons. Its persistent banner said **Demo — Sample
data. Nothing is saved to your real game** and offered **Reset demo** and
**Start for real**. After play, reset restored `0/9`; a normal-storage sentinel
was unchanged.

A recorded deterministic live run used the real compare and move controls and
reached **Case solved** with four comparisons and five tokens remaining. The
end screen showed the complete six-exhibit order and **Play this case again**.
The live suite separately reached **Case lost**, then exercised replay and
restart reset.

## Claims

All 20 exact commands in `.factory/claims.json` were run separately after a
fresh `npm ci`. Every command passed. A source audit found each of the 20
declared IDs tagged exactly once, including `@claim:room-token-hash` on the
production-handler Rust test.

| Claim IDs | Exact command | Live disposition |
| --- | --- | --- |
| complete-run; five-minute-run; free-case-loop | Pass | Pass; win, loss, timing, and replay exercised |
| restart-reset; progress-persistence | Pass | Pass |
| demo-isolation; start-real-cleanup | Pass | Pass |
| settings-persist; control-inputs | Pass | Pass |
| solo-local-privacy; no-tracking-cookies; clear-browser-data | Pass | Pass |
| two-player-shared; room-expiry; two-player-limit | Pass | Pass with independent clients and authoritative state |
| room-token-hash | Pass | Pass; tag audit and handler-level SQLite assertion |
| case-pack; case-rules; license-revocation | Pass | Pass with recorded billing fixtures where required |
| steady-render | Pass | Pass; live phone-class measurement was 60 fps |

The live page and README claim audit found no missing registry entries, false
claims, or incomplete commands. Untested public claims: **0**.

## Multiplayer and backend

- Two independent browser contexts created and joined one room. Player one
  solved the case; player two read the server-validated result.
- An unauthorised room read returned 401. A third join returned 409. Room
  expiry measured 86,400 seconds.
- Invalid short input produced the five-character guidance. A request burst
  produced HTTP 429 with `Retry-After: 1`, while health remained available.
- `npm run verify:live` passed 2/2. It restarted only the owned
  `sf-orderly-chaos` revision, waited for health recovery, re-read the solved
  room from SQLite-backed state, and created a new room.
- `/health` and `/api/health` returned JSON 200. The public health build is
  `a3897cc9677644cfa59b997b0a71c15e245015c7`.
- An unknown URL returned the designed page with HTTP 404. This deliberate
  404 is expected and is not a defect.

## Accessibility, privacy, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, a descriptive title,
  `lang=en`, one `h1`, one `main`, image alt text, labelled buttons, and no
  console errors.
- Playwright Axe found no serious or critical violations on `/`, `/demo`,
  `/privacy`, `/terms`, `/license`, or the controls dialog.
- Every visible link, button, and input met the 44 CSS px phone target. The
  skip link, keyboard comparison and arrow reordering, dialog focus return,
  route-change focus, browser back navigation, and designed focus treatment
  passed.
- Reduced motion changed transitions to effectively instant (`1e-06s`). At
  200% text size, all content and controls remained present; the exhibit row
  retained its labelled horizontal scroller.
- Demo isolation, first-party-only solo requests, absence of analytics and
  advertising cookies, complete browser-data clearing, and hashed room access
  storage passed. No credentials, access values, or cookie values were logged.
- Route titles, one-heading structure, legal pages, metadata assets, internal
  links, and the styled 404 return path passed. Offline and update behavior is
  not promised, and no service worker is registered.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1,261 ms, CLS 0, and total blocking time 56 ms.
- The production build is 11.72 KB gzip JavaScript and 4.19 KB gzip CSS,
  comfortably within the product budgets.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: room backend unavailable or lost after restart | Resolved; independent clients, restart persistence, health recovery, and a new room all passed live. |
| Verification 1–2: unknown routes returned HTTP 200 | Resolved; the designed missing page returns HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved; all 20 distinct exhibit sets and rules pass the claim test. |
| Verification 2: six public claims lacked registered tests | Resolved; the registry and exact commands cover them. |
| Verification 6: undersized phone targets | Resolved; every public-route target passed the 44 px measurement. |
| Verification 6: 404 skip-link overlap and default focus | Resolved; desktop and phone focus checks pass without overlap. |
| Verification 6: three privacy claims lacked tests | Resolved; all three have passing declared tests. |
| Verification 7: `room-token-hash` lacked its required tag | Resolved; the tag occurs exactly once and its exact Rust command passes. |

## Offer and external dependency

The complete public offer remains **$6 USD once** for 19 additional curated
cases, making 20 total, with **no subscription**. The permanent free case is
fully playable. `.factory/billing-offer.json` contains public offer metadata
only.

Checkout registration remains an accurately disclosed external dependency.
The purchase button is disabled and says **Checkout registration pending**.
Recorded license grant and revocation fixtures passed. This verification does
not claim that a live checkout or paid activation passed.

## Evidence

Status-only evidence includes fresh desktop and phone screenshots, a populated
demo screenshot, a deterministic-run video, the win screen, claim and suite
logs, restart results, URL-verifier output, manual accessibility results, live
frame metrics, and Lighthouse JSON. It contains no credentials, room codes,
room access values, license values, or cookies.
