# Review 2 — PASS

**Verdict: PASS.** There are **0 findings** and **0 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate reviewed: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Documentation baseline reviewed: `82a777280548e3ba11db290507a5fd3c9f2a0aac`
- Live static build label: `c581a57`
- Review date: 2026-09-06 UTC
- Evidence directory: `/work/.evidence/orderly-chaos-review-2/`

The live health response identifies the implementation candidate. Repository
history and a path-scoped diff show that later commits change only factory
reports. A production build with the live static build label produced
JavaScript and CSS that are byte-for-byte identical to the live assets.

## First screen and game loop

Fresh 1440 × 900 desktop and 390 × 844 touch contexts showed the game board
and an exhibit before scrolling. Both had one `h1`, one `main`, no page-width
overflow at normal text size, and no console error.

- Job: **Solve an ordering puzzle with limited comparisons.**
- Audience: curious adults and teens who want a five-minute deduction game
  without a long rules lesson.
- First action: **Try it with sample data.** Its adjacent sentence says the
  sample is complete and does not change the saved game.
- First-screen facts: solo progress stays in the browser, room codes expire
  after 24 hours, and the 19-case pack costs $6 once.

One click opened a populated six-exhibit case with a placement rule, a free
clue, deductions, movement controls, and `0/9` comparisons. The persistent
banner read **Demo — Sample data. Nothing is saved to your real game** and
kept **Reset demo** and **Start for real** available. Spending a comparison
changed the count to `1/9`; reset restored `0/9`. The isolation and
start-for-real tests confirmed that normal solo storage is not changed and
demo storage is removed on exit.

Deterministic runs were completed separately on desktop and phone. Both
reached **Case solved** with four comparisons and five tokens remaining. The
end screen showed the six-exhibit order and **Play this case again**. The live
suite also reached **Case lost**, replayed the case, and confirmed restart
restores active play and all nine tokens. Evidence includes
`live-deterministic-run.webm`, both first screens, both populated samples, and
both win screens.

## Declared claims and clean gates

Starting from the clean supplied checkout, `npm ci` completed with zero
reported vulnerabilities. `npm test` passed 6 unit tests, 4 Rust/SQLite tests,
and 27 browser tests. `npm run build` produced `dist/`. Initial JavaScript is
11.72 KB gzip and CSS is 4.19 KB gzip. The full suite against the live URL
also passed 27/27.

Each exact command in `.factory/claims.json` was then run separately. Every
claim ID has exactly one required `@claim:<id>` marker.

| Claim | Result |
| --- | --- |
| `complete-run` | Pass |
| `five-minute-run` | Pass |
| `free-case-loop` | Pass |
| `restart-reset` | Pass |
| `progress-persistence` | Pass |
| `demo-isolation` | Pass |
| `start-real-cleanup` | Pass |
| `settings-persist` | Pass |
| `solo-local-privacy` | Pass |
| `no-tracking-cookies` | Pass |
| `clear-browser-data` | Pass |
| `control-inputs` | Pass |
| `two-player-shared` | Pass |
| `room-expiry` | Pass |
| `two-player-limit` | Pass |
| `room-token-hash` | Pass |
| `case-pack` | Pass with recorded Sociobot verification fixture |
| `case-rules` | Pass |
| `license-revocation` | Pass with recorded Sociobot verification fixtures |
| `steady-render` | Pass; fresh live phone measurement was 60 fps |

The live page, README, legal copy, and public offer metadata were audited for
additional claims. None was missing from the registry, false, incomplete, or
left untested. Untested public claims: **0**.

## Multiplayer and backend

- Two independent browser contexts created and joined one live room. Player
  one solved; player two read the server-validated solved result.
- A request without that browser's room access returned 401. A third join
  returned 409. Room expiry measured 86,400 seconds.
- Invalid three-character room input produced the five-character correction.
  A request burst produced 429 with `Retry-After: 1`; health stayed available.
- `npm run verify:live` passed 2/2. It restarted only the owned
  `sf-orderly-chaos` revision, waited for health, recovered the solved room
  from persistent state, and created a new room.
- `/health` and `/api/health` returned JSON 200 after restart. A fresh unknown
  URL returned the designed HTML page with HTTP 404. The deliberate 404 is
  expected behavior.

No room codes, room access values, license values, cookies, or credentials
were retained in the report or screenshots.

## Accessibility, privacy, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, descriptive title,
  `lang=en`, one `h1`, one `main`, complete image alt coverage, labelled
  buttons, and zero console errors.
- Playwright Axe found no serious or critical issue on `/`, `/demo`,
  `/privacy`, `/terms`, `/license`, the controls dialog, or the game state.
- The skip link, keyboard comparison, arrow reordering, touch comparison,
  dialog focus containment and return, route and back-navigation focus, and
  designed 3 px focus rings passed. All visible controls met the 44 CSS px
  phone target minimum.
- At 200% text size, the heading, game board, controls, demo reset, and
  start-for-real action remained present and operable. Reduced motion changed
  transitions to effectively instant.
- Demo isolation, first-party-only solo requests, no analytics or advertising
  cookies, browser-data clearing, and hashed SQLite room access passed.
- All internal links and the labelled external factory link returned their
  expected status. Every public route had its own title, one `h1`, one `main`,
  and an unskipped heading outline. Legal pages returned 200. The styled
  missing page returned HTTP 404 and provided a return action.
- Offline and update behavior is not promised. No service worker is
  registered, so no offline claim was inferred.
- Fresh mobile Lighthouse scored 99 performance, 100 accessibility,
  100 best practices, and 100 SEO. LCP was 1,298 ms, CLS was 0, and total
  blocking time was 128 ms.
- The deterministic game does not benefit from a runtime AI feature. The
  researched non-goals explicitly exclude AI tutoring.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: room backend unavailable or lost after restart | Resolved again live with two clients, owned restart persistence, health recovery, and new-room creation. |
| Verification 1–2: unknown routes returned HTTP 200 | Resolved again; the designed missing page returns HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved again; all 20 distinct exhibit sets and placement rules pass. |
| Verification 2: six public claims lacked registered tests | Resolved; all 20 current registry commands pass separately. |
| Verification 6: phone targets were below 44 px | Resolved again on every public route and the 404 page. |
| Verification 6: 404 skip link overlapped and had default focus | Resolved again at desktop and phone widths with a designed 3 px focus ring. |
| Verification 6: three privacy claims lacked exact tests | Resolved; all three exact commands pass. |
| Verification 7: `room-token-hash` lacked the required tag | Resolved; the tag occurs exactly once and the production-handler SQLite test passes. |

## Public offer

The complete offer remains **$6 USD once** for 19 additional curated cases,
making 20 total. It is explicitly not a subscription. The permanent free case
has a complete win, loss, and replay loop. `.factory/billing-offer.json`
contains public offer metadata only.

Checkout registration remains accurately disclosed as pending. The purchase
control is disabled. Recorded license grant and revocation fixtures pass, but
this review does not claim that a live checkout or paid activation passed.

## Findings

None.
