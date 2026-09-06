# Verification 7 — FAIL

**Verdict: FAIL.** There is **1 major finding**. There are **0 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate reviewed: `7883cfb0a065fc6523bc93ce54c4f404871e0cf7`
- Documentation revision: `8b798354ca5f7e6f16901ce120dbcb0c9e359f1a`
- Verification date: 2026-09-06 UTC
- Evidence directory: `/work/.evidence/orderly-chaos-verify-7/`

The live root references `index-BXpheQqk.js` and `index-APhct1t_.css`, which match a clean production build at the documentation revision. The only files after `7883cfb` are documentation, so the deployed product code is the candidate. The footer correctly identifies the later documentation build as `8b79835`. The linked product backend reports its inherited revision `27713d6…`; its live behavior was rechecked below.

## First screen and demo

Fresh 1440 x 900 desktop and 390 x 844 phone contexts both showed the game itself, an exhibit, and the first action before scrolling, with no horizontal overflow or console errors.

- Job: **Solve an ordering puzzle with limited comparisons.**
- Audience: curious adults and teens who want a five-minute deduction game.
- First action: **Try it with sample data**; it says the complete sample does not change saved play.

`/demo` immediately showed six named exhibits, `0/9`, and the persistent **Demo — Sample data. Nothing is saved to your real game** banner with Reset demo and Start for real. The full live suite confirmed a changed demo resets to the seeded state and does not change normal solo storage.

## Finding

### F-1 — Major: `room-token-hash` is missing the required claim tag

The privacy page publicly says that the room service stores hashed room access tokens in SQLite. Its declared command exists and passes:

```sh
npm run test:server -- claim_room_token_hash_room_access_is_hashed_at_rest
```

That Rust test creates a room through the production handler and verifies that the stored value is a 64-character SHA-256 hash rather than the returned access value. However, the repository has **zero** occurrences of the required `@claim:room-token-hash` tag. The test is named `claim_room_token_hash_room_access_is_hashed_at_rest`, not tagged in the contract's required form.

The claims contract requires every public claim to have exactly one test tagged `@claim:<id>`. This is an incomplete declared claim, even though its current behavioral command passes. Add one runner-recognized `@claim:room-token-hash` tag to the exact test and retain the command mapping, then independently rerun the claim audit.

## Claims

All 20 exact commands in `.factory/claims.json` were executed separately after `npm ci`; all behavioral commands passed. The 19 claims below have exactly one required tag. `room-token-hash` has passing behavior but fails the tag audit described in F-1.

| Claim IDs | Exact-command result | Tag audit |
| --- | --- | --- |
| complete-run; five-minute-run; free-case-loop; restart-reset | Pass | Pass |
| progress-persistence; demo-isolation; start-real-cleanup; settings-persist | Pass | Pass |
| solo-local-privacy; no-tracking-cookies; clear-browser-data; control-inputs | Pass | Pass |
| two-player-shared; room-expiry; two-player-limit | Pass | Pass |
| room-token-hash | Pass | **Fail — F-1** |
| case-pack; case-rules; license-revocation; steady-render | Pass | Pass |

Untested public claims: **0**. The `room-token-hash` test itself passed; the finding is its missing mandatory tag, not an assertion that hashing failed.

## Runtime, game, and backend checks

- Clean setup: `npm ci` passed with 0 reported vulnerabilities. `npm test` passed (6 unit, 4 Rust/SQLite, and 27 Playwright tests). `npm run build` passed and produced `dist/` (JS 11.72 KB gzip; CSS 4.19 KB gzip).
- The production full browser suite passed **27/27**. It covered deterministic demo completion, free-case win/loss/replay, restart, persistence, reset, keyboard/mouse/touch, settings, reduced motion, legal routes, links, 404, privacy clearing, and public-route accessibility.
- A deterministic live run reached the actual **Case solved** end screen; the free run also reached **Case lost**, with replay and restart resetting state. The measured phone-class active-play frame rate was 60 fps.
- Two genuinely independent browser contexts created and joined the same room. One solved it and the other read the authoritative shared result. An unauthorised room read returned 401; a third join returned 409. Rooms were measured at 86,400 seconds.
- `npm run verify:live` passed **2/2**. It restarted the owned product revision, waited for health recovery, re-read the solved room, and created a fresh room after recovery. The normal/invalid/boundary/recovery test also observed rate limiting with HTTP 429 and `Retry-After: 1` while health stayed available.
- `GET /health` and `/api/health` returned JSON 200. An unknown URL returned the designed page with HTTP 404; this expected 404 is not a defect.

## Accessibility, privacy, and site checks

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, title, `lang=en`, one `h1`, a main landmark, image alt text, labelled controls, and no console errors.
- Playwright Axe checks in the live full suite found no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, `/license`, and the controls dialog. The repaired 404 skip link focused correctly at phone width, measured 66 px high, and did not overlap the wordmark.
- All visible links, buttons, and inputs passed the 44 CSS px phone-target test on every public route. Reduced motion made exhibit transitions effectively instant (`1e-06s`).
- Privacy tests passed for first-party-only solo requests, no analytics or advertising cookies, complete browser-data clearing, demo isolation, and hashed SQLite storage behavior. The final item remains contract-incomplete solely because of F-1's missing tag.
- All discovered internal links returned 200. Route titles and one-h1 structure passed. No offline or update behavior is promised.

## Performance

The successful mobile Lighthouse retry recorded **100 performance, 100 accessibility, 100 best practices, and 100 SEO**. LCP was 1,211 ms, CLS 0, and total blocking time 52 ms. The first attempt could not locate Chrome until the documented Playwright Chromium executable was supplied; the retry used that executable successfully.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: public room backend unavailable or lost after restart | Resolved; independent clients, restart persistence, health, recovery, and a new room all passed live. |
| Verification 1–2: unknown routes returned HTTP 200 | Resolved; the designed missing page now returns HTTP 404. |
| Verification 2: cases lacked distinct inference rules | Resolved; the `case-rules` claim passes all 20 curated cases. |
| Verification 2: six public claims lacked registered tests | Resolved. |
| Verification 6: undersized mobile targets | Resolved; all public-route controls passed the 44 px browser measurement. |
| Verification 6: 404 skip-link overlap/default focus | Resolved; focus is designed and does not overlap at desktop or phone width. |
| Verification 6: three privacy claims lacked tests | Behaviorally resolved, but `room-token-hash` has the new tag-completeness defect in F-1. |

## Offer and checkout

The public offer remains **$6 USD once** for 19 additional cases, 20 total, with no subscription. The permanent free case works. Public billing metadata is present and contains no credentials. Checkout registration is still an external operator dependency: the purchase control is disabled and says **Checkout registration pending**. Recorded license fixtures passed; this verification does not claim a live checkout or paid activation passed.

## Evidence

`/work/.evidence/orderly-chaos-verify-7/` contains the URL verifier's desktop and mobile screenshots, its status-only JSON, and the successful Lighthouse JSON. It contains no credentials, cookie values, room codes, access values, or license values.

