# Verification 2 — FAIL

**Verdict: FAIL.** There are 4 findings and 6 untested public claims.

Live URL: <https://orderly-chaos.sociobot.in>

Reviewed implementation: `6635570ff1846153c8ff095d3700707134dd8cbd`

Documentation revision at test start: `52c60686b7e59c5458dfef62c64cdb1c0c00739d`

Verification date: 2026-09-06 UTC

The live JavaScript is byte-identical to the build at the documentation
revision (`d0c44c50…`, 31,387 bytes). Later commits after the implementation
only changed `.factory/handoff.md` and `.factory/verification-2.md`. The live
frontend therefore matches the candidate lineage, but the public hostname is
currently serving a static fallback instead of the candidate Rust/SQLite
runtime.

## First screen and complete run

Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the product and
these facts before scrolling:

- Job: “Solve an ordering puzzle with limited comparisons.”
- Audience: curious adults and teens seeking a five-minute deduction game.
- First action: “Try it with sample data.”

The first action opened a populated, fixed six-exhibit case. The persistent
banner said “Demo — Sample data. Nothing is saved to your real game” and
offered **Reset demo** and **Start for real**. Reset restored 0/9 comparisons,
and a sentinel in normal solo storage remained unchanged.

A recorded deterministic run used five comparisons, arranged all six
exhibits, and reached the real **Case solved** screen. An incorrect submission
reached **Case lost**. Restart, settings persistence, keyboard operation, and
the one-tap replay control passed.

## Findings

### F-1 — Critical: the live two-player service is unavailable

The repaired backend routing described by the previous report has regressed.
Independent requests and the browser suite observed:

- `GET /health` → HTTP 200 `text/html`, not service JSON.
- `POST /api/rooms` → HTTP 405, so a room cannot be created.
- The live UI reports “The room service returned an unreadable response.”
- The 12-request allowance check received only HTTP 405 responses, not HTTP
  429 with `Retry-After: 1`.
- The two-browser shared-room and 24-hour expiry claims fail live.

Because no live room can be created, room-access isolation and persistence
through an owned-service restart cannot be exercised in production. The same
checks pass against the local Rust/SQLite server, but that does not establish
the advertised live mode.

This is the recurrence of verification-1 F-1. The prior repaired observation
in the old verification-2 report is superseded by the current public output.

### F-2 — Major: unknown live URLs return HTTP 200

`GET /independent-qa-missing-route` and `GET /does-not-exist` both returned
the SPA document with HTTP 200. Client JavaScript then rendered the designed
“This page is not in the archive” screen, but the transport status is still
wrong. A deliberate HTTP 404 is expected; the defect is the unexpected 200.

This is the recurrence of verification-1 F-2.

### F-3 — Major: the required per-case inference rule is missing

The researched product requires each case to change its objects, hidden order,
and one special inference rule. All cases use the same comparison behavior and
the same transitive-closure deduction. `ruleLabel` changes only the label for
the one starting relation. The 20 seeds also reuse five exhibit collections.

The case pack therefore supplies different seeded orders and starting clues,
but not the required special inference rules. This affects the complete paid
content, even though checkout is correctly disabled pending registration.

### F-4 — Major: six public claims are absent from the claim registry

The following statements appear in the live product or README but have no
entry and exact command in `.factory/claims.json`:

1. A round is a five-minute game.
2. Keyboard, mouse, and touch controls are supported as a combined promise.
3. The permanent free case has a complete win/loss loop; the declared complete
   run covers the separate demo seed.
4. Starting for real removes demo progress.
5. A room is limited to two players.
6. A refunded or revoked license stops unlocking paid cases.

Several related behaviors appear to work or have partial coverage in the
general suite, but the claims contract requires each public statement to have
one declared observable test. They remain untested public claims.

## Declared claims

All ten exact commands in `.factory/claims.json` were run separately after
`npm ci`. They passed against the local Rust/SQLite server. The full live suite
then produced 11 passes and 6 failures.

| Declared claim | Local | Live |
| --- | --- | --- |
| Deterministic case reaches a win | Pass | Pass |
| Restart restores all nine tokens | Pass | Pass |
| Solo progress survives reload | Pass | Pass |
| Demo changes do not change solo data | Pass | Pass |
| Sound and reduced-motion settings persist | Pass | Pass |
| Solo demo makes no cross-origin requests | Pass | Pass |
| Two browsers share an authoritative room | Pass | **Fail — F-1** |
| Rooms expire after 24 hours | Pass | **Fail — F-1** |
| $6 license fixture unlocks 19 paid cases | Pass | Pass (recorded fixture) |
| Active play renders at 50 fps or better | Pass | Pass; measured 60 fps |

Declared claims not run: **0**. Untested public claims missing from the
registry: **6**.

## Other checks

- `npm ci`: pass, 0 audit vulnerabilities.
- `npm test`: pass — 5 unit, 3 Rust/SQLite, and 17 browser tests.
- `npm run build`: pass — `dist/` produced; JS 10.87 KB gzip and CSS 3.95 KB
  gzip.
- `/opt/fleet/lib/verify-url.sh`: pass on the HTTPS root; title, `lang=en`, one
  `h1`, one `main`, image alt text, labelled buttons, and no load errors.
- Playwright Axe: no serious or critical violations on `/`, `/demo`,
  `/privacy`, `/terms`, or `/license`, including the rules dialog.
- Fresh phone: no ordinary-width page overflow. At 200% text size, content and
  controls remained available; the game row retained its labelled horizontal
  scroller.
- Route titles, legal pages, internal links, focus styles, clear-data handling,
  and reduced motion passed. No offline behavior is promised.
- Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100;
  LCP 1,262 ms, CLS 0, TBT 67 ms.
- HTTPS and security headers are present.

The $6 USD one-time offer remains public and explicit: 19 paid cases, 20 total,
with no subscription. Checkout is honestly disabled pending external billing
registration, so no checkout or activation is claimed as verified.

## Evidence

Status-only evidence, with no credentials, room access values, or cookies:

- `/work/.evidence/orderly-chaos-verify-2/live-desktop-first-screen.png`
- `/work/.evidence/orderly-chaos-verify-2/live-phone-first-screen.png`
- `/work/.evidence/orderly-chaos-verify-2/live-deterministic-run.webm`
- `/work/.evidence/orderly-chaos-verify-2/live-win-screen.png`
- `/work/.evidence/orderly-chaos-verify-2/live-room-failure.png`
- `/work/.evidence/orderly-chaos-verify-2/live-lighthouse.json`
- `/work/.evidence/orderly-chaos-verify-2/verify-url/verify.json`
