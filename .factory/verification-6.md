# Verification 6 — FAIL

**Verdict: FAIL.** There are **3 findings**: 2 major and 1 minor. There
are **3 untested public claims**.

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate: `27713d6d1ff7870bea61eff169daa0405f0f3986`
- Documentation baseline reviewed: `54ba1e8b4c90a34f08f3f3bf5f810b0a2d4235d0`
- Verification date: 2026-09-06 UTC
- Evidence: `/work/.evidence/orderly-chaos-verify-6/`

The live JavaScript is byte-identical to the clean production build from the
candidate source (`fea13917d8efca844dc59df12fc182dde58dcb8dd9414473a642258978deeeb7`).
The live backend health response also reports the full candidate SHA. Later
commits only changed documentation and deployment tooling.

## First screen and complete run

Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the playable
board and an exhibit before scrolling, with no horizontal overflow or console
errors.

- Job: **“Solve an ordering puzzle with limited comparisons.”**
- Audience: curious adults and teens who want a five-minute deduction game.
- First action: **“Try it with sample data.”** The adjacent note explains that
  the sample does not change the saved game.
- Facts: solo progress stays in the browser, rooms expire after 24 hours, and
  the 19-case pack costs $6 once.

The one-click sample opened six named exhibits at `0/9`. The persistent banner
said **“Demo — Sample data. Nothing is saved to your real game”** and provided
**Reset demo** and **Start for real**. A comparison changed the counter to
`1/9`; reset restored `0/9` and left seeded normal solo data unchanged.

A deterministic live run reached **Case solved** with four comparisons and
five tokens remaining. The end screen showed the complete order and **Play
this case again**. The separate free-case run reached both the win and loss
screens, and replay and restart reset passed.

## Findings

### F-1 — Major: touch targets are below the required 44 px minimum

Fresh 390 px phone measurements found undersized targets on every public
route. The main navigation links are only 16 px high, the wordmark is 26.8 px
high, and footer links are 24.8 px high. The designed 404 links are 21–27.9 px
high. These links remain usable, but they do not meet the attached
accessibility and site-structure contracts requiring 44 × 44 CSS px touch
targets.

Evidence: `touch-targets.json`.

### F-2 — Minor: the designed 404 skip link overlaps the wordmark

The 404 stylesheet leaves **Skip to main content** permanently positioned at
`top: 1rem; left: 1rem`. Its 211.7 px box overlaps the wordmark at both 1440 px
desktop and 390 px phone widths. The 404 page also falls back to the browser's
1 px `outline: auto` instead of the product's designed 3 px focus treatment.
The return path works and the response correctly uses HTTP 404, so this is a
layout and focus-treatment defect rather than a broken 404 route.

Evidence: `404-overlap.json`, `sf-orderly-chaos-404-desktop.png`, and
`sf-orderly-chaos-404-phone.png`.

### F-3 — Major: three public privacy claims lack exact registered tests

All 17 declared claim commands pass, but the live copy makes three additional
claims that are absent from `.factory/claims.json` or only partially checked
by an untagged general test:

1. No analytics, tracking, or advertising cookies are used. The registered
   privacy test checks cross-origin requests and credential fields, but it
   does not inspect cookies or same-origin tracking.
2. **Clear saved browser data** removes solo progress, demo progress,
   settings, room access, and the saved license. The general browser test only
   seeds and asserts the settings key; no registered claim covers the full
   action. An independent manual check of all documented keys passed, but it
   is not the required claim command.
3. Room access tokens are stored as hashes in SQLite. Access isolation passes,
   but no declared test verifies the stated at-rest representation.

These are not reported as false behavior. They are untested public claims
under the claims contract, which requires one exact registered command for
each statement.

## Declared claims

Every exact command from `.factory/claims.json` was run separately after a
fresh `npm ci` in a clean checkout. All 17 passed.

| Claim | Clean command | Live disposition |
| --- | --- | --- |
| complete-run | Pass | Pass |
| five-minute-run | Pass | Pass |
| free-case-loop | Pass | Pass |
| restart-reset | Pass | Pass |
| progress-persistence | Pass | Pass |
| demo-isolation | Pass | Pass |
| start-real-cleanup | Pass | Pass |
| settings-persist | Pass | Pass |
| solo-local-privacy | Pass | Pass within its declared scope |
| control-inputs | Pass | Pass |
| two-player-shared | Pass | Pass, including restart |
| room-expiry | Pass | Pass; 86,400 seconds |
| two-player-limit | Pass | Pass; third join returned 409 |
| case-pack | Pass | Pass with recorded fixture |
| case-rules | Pass | Pass for all 20 cases |
| license-revocation | Pass | Pass with recorded fixture |
| steady-render | Pass | Pass; measured 60 fps |

Declared commands skipped: **0**. Untested public claims outside the registry:
**3**.

## Backend and multiplayer

- Two independent browser contexts created and joined one room. Player one
  solved the case; player two read the server-validated result.
- The owned active product revision was restarted. Health recovered, the
  solved shared result remained readable, and a new room was created.
- `/health` and `/api/health` return 200 JSON. `/health` reports build
  `27713d6d1ff7870bea61eff169daa0405f0f3986`.
- Room expiry measured 86,400 seconds. An unauthorised read returned 401, and
  a third join returned 409.
- A three-character room code produced the expected five-character validation
  message, and solo play remained available.
- A 12-request burst produced 429 responses with `Retry-After: 1`; health
  remained available.
- The deliberate unknown URL returned the designed HTML with HTTP 404. This
  expected 404 is not a defect.

## Other checks

- Fresh `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; `dist/` produced. Initial JavaScript is 11,673 bytes
  gzip and CSS is 4,144 bytes gzip.
- Full restart-enabled live suite: 23/23 pass.
- `/opt/fleet/lib/verify-url.sh`: pass — HTTPS 200, title, `lang=en`, one h1,
  main landmark, alt text, labelled buttons, and no console errors.
- Playwright Axe across all public routes and the controls dialog found no
  serious or critical automated violations. Manual target and 404 checks
  produced F-1 and F-2.
- Keyboard comparison and reordering work. The skip link reaches `#main`, the
  settings dialog receives focus and returns it on close, and the normal app
  uses a 3 px focus outline.
- Reduced motion changes transitions to effectively instant. Sound and motion
  settings survive reload.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1,298 ms, CLS 0, TBT 139 ms.
- Route titles, legal pages, sitemap entries, security headers, first-party
  assets, and every discovered link respond as intended.
- No offline or update behavior is promised, and no service worker is
  registered.
- AI assistance is not a missed feature: the brief excludes AI tutoring, and
  deterministic deduction does not benefit from runtime model inference.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1–5: public room backend unavailable or lost after restart | **Resolved.** The linked backend passes the two-client flow, restart persistence, recovery, and new-room check. |
| Verification 1–2: unknown routes returned HTTP 200 | **Resolved.** The designed missing page returns HTTP 404. F-2 is a separate visual/focus defect. |
| Verification 2: cases lacked distinct inference rules | **Resolved.** The case-rules claim passes 20 distinct exhibit sets and rules. |
| Verification 2: six public claims lacked registered tests | **Resolved for those six claims.** F-3 covers three different privacy statements found in this review. |

No earlier report listed a separate minor finding.

## Offer and checkout status

The public offer remains complete and consistent: **$6 USD once** for 19
additional cases, making 20 total, with **no subscription**. The free case
remains available. Public operator metadata is present in
`.factory/billing-offer.json` and contains no credential.

Checkout registration remains an external dependency. The live control is
disabled and says **Checkout registration pending**. License grant and
revocation use recorded fixtures. This verification does not claim that live
checkout or paid activation passed.

Evidence is status-only and contains no credentials, cookie values, room
codes, player access values, or license values.
