# Review 1 — PASS

**Verdict: PASS.** There are **0 findings** and **0 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate reviewed: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Documentation baseline reviewed: `6f988d3e8926e512752d19dc2af0bca24a168f59`
- Review date: 2026-09-06 UTC
- Evidence directory: `/work/.evidence/orderly-chaos-review-1/`

The live health response reports the implementation candidate above. Commits
after that candidate only change factory reports. A production build using the
live documentation build label (`c581a57`) produced JavaScript and CSS that
were byte-identical to the live assets.

The separately named input
`factory-evidence/orderly-chaos-verify-8/qa-report.md` was not present in this
checkout or the supplied evidence directory. The complete repository report
`.factory/verification-8.md` was read, and every required product check was
run again from a clean install. The missing input is an evidence-packaging
limitation, not a product finding.

## First screen, sample, and complete run

Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the game board
and an exhibit before scrolling. Neither view had page overflow at its normal
width or a console error.

- Job: **Solve an ordering puzzle with limited comparisons.**
- Audience: curious adults and teens who want a five-minute deduction game
  without a long rules lesson.
- First action: **Try it with sample data.** The adjacent sentence says the
  complete sample does not change the saved game.
- Facts: solo progress stays in the browser, rooms expire after 24 hours, and
  the 19-case pack costs $6 once.

The one-click sample opened a populated six-exhibit case with a placement
rule, known-order deductions, movement controls, and `0/9` comparisons. Its
persistent banner said **Demo — Sample data. Nothing is saved to your real
game** and offered **Reset demo** and **Start for real**. A changed sample
reset to `0/9`; normal solo storage was unchanged. Starting for real removed
demo progress and opened a clean free case.

A fresh recorded live run used the real comparison and movement controls and
reached **Case solved** with four comparisons and five tokens left. The end
screen showed the complete six-exhibit order and **Play this case again**.
The live suite also reached **Case lost**, replayed, and confirmed restart
reset. Evidence includes `live-deterministic-run.webm`,
`live-demo-populated.png`, and `live-win-screen.png`.

## Claims and clean quality gates

After a fresh `npm ci`, all 20 exact commands in `.factory/claims.json` were
run separately. All 20 passed. Each declared ID has exactly one required
`@claim:<id>` marker, including the production-handler SQLite test for
`room-token-hash`.

| Claim group | Result |
| --- | --- |
| Complete run, five-minute run, free win/loss/replay | Pass |
| Restart, progress, demo isolation, start-for-real cleanup | Pass |
| Settings and keyboard/mouse/touch controls | Pass |
| Solo privacy, no tracking cookies, clear browser data | Pass |
| Shared two-player room, 24-hour expiry, two-player limit | Pass |
| Hashed room access storage | Pass |
| $6 case pack, 20 distinct case rules, license revocation | Pass with recorded billing fixtures |
| Phone-class active rendering at 50 fps or better | Pass; fresh live measurement was 60 fps |

The live page, legal routes, billing metadata, and README were cross-checked
against the registry. No missing, false, incomplete, or untested public claim
was found. Untested public claims: **0**.

The documented clean gates passed:

- `npm ci`: pass, with 0 reported vulnerabilities.
- `npm test`: pass — 6 core, 4 Rust/SQLite, and 27 browser tests.
- `npm run build`: pass; `dist/` produced.
- Initial JavaScript: 11.72 KB gzip; CSS: 4.19 KB gzip.
- Full live browser suite: 27/27 pass.

## Multiplayer and backend

- Two independent browser contexts created and joined one room. Player one
  solved the case; player two read the authoritative shared result.
- An unauthorised room read returned 401. A third join returned 409. Room
  expiry measured 86,400 seconds.
- Invalid short room input produced five-character guidance. A request burst
  produced HTTP 429 with `Retry-After: 1`; health remained available.
- `npm run verify:live` passed 2/2. It restarted only the owned
  `sf-orderly-chaos` revision, waited for health, re-read the solved room from
  persistent state, and created a new room.
- `/health` and `/api/health` returned JSON 200. An unknown URL returned the
  designed page with HTTP 404. That deliberate 404 is expected.

No room codes, access values, cookie values, or license values were retained
in evidence or this report.

## Accessibility, privacy, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, descriptive title,
  `lang=en`, one `h1`, one `main`, image alt text, labelled buttons, and no
  console errors.
- Live Playwright Axe checks found no serious or critical issue on `/`,
  `/demo`, `/privacy`, `/terms`, `/license`, or the controls dialog.
- The skip link, keyboard comparison and arrow reordering, native dialog
  focus and focus return, route-change focus, clean back navigation, and
  designed focus rings passed. Every visible link, button, and input met the
  44 CSS px phone target minimum.
- Reduced motion changed transitions to effectively instant (`1e-06s`). At
  200% text size, the content and controls remained present; the exhibit row
  retained its labelled horizontal scroller.
- Demo isolation, first-party-only solo requests, no analytics or advertising
  cookies, complete browser-data clearing, and hashed SQLite room access
  storage passed.
- Route titles, one-heading structure, legal pages, metadata, internal links,
  security headers, and the styled 404 return path passed. Offline and update
  behavior is not promised, and no service worker is registered.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1,211 ms, CLS 0, total blocking time 29 ms.
- The deterministic deduction loop does not need runtime AI, and the brief
  explicitly excludes AI tutoring. There is no missed AI feature.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: room backend unavailable or lost after restart | Resolved; independent clients, owned restart persistence, health recovery, and new-room creation passed live. |
| Verification 1–2: unknown routes returned HTTP 200 | Resolved; the designed missing page returns HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved; all 20 distinct exhibit sets and rules pass. |
| Verification 2: six public claims lacked registered tests | Resolved; the registry and exact commands cover them. |
| Verification 6: undersized phone targets | Resolved; every public-route target passed the 44 px measurement. |
| Verification 6: 404 skip-link overlap and default focus | Resolved; desktop and phone focus checks pass without overlap. |
| Verification 6: three privacy claims lacked tests | Resolved; all three have passing declared tests. |
| Verification 7: `room-token-hash` lacked its required tag | Resolved; the tag occurs exactly once and its exact command passes. |

## Offer and external dependency

The complete public offer remains **$6 USD once** for 19 additional curated
cases, making 20 total, with **no subscription**. The permanent free case is
complete. `.factory/billing-offer.json` contains public offer metadata only.

Checkout registration remains an accurately disclosed external dependency.
The purchase control is disabled and says **Checkout registration pending**.
Recorded license grant, invalid-license, and revocation paths passed. This
review does not claim that a live checkout or paid activation passed.

## Evidence

Status-only evidence in `/work/.evidence/orderly-chaos-review-1/` includes
fresh desktop and phone first screens, the populated demo, the deterministic
run video and win screen, the 200% text view, URL-verifier output, and mobile
Lighthouse JSON. It contains no credentials, room access values, license
values, or cookie values.
