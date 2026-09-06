# Handoff

## Outcome

**FAIL — verification 6 found 3 findings and 3 untested public claims.**

- Live URL: <https://orderly-chaos.sociobot.in>
- Implementation candidate: `27713d6d1ff7870bea61eff169daa0405f0f3986`
- Documentation baseline reviewed: `54ba1e8b4c90a34f08f3f3bf5f810b0a2d4235d0`
- Report: `.factory/verification-6.md`
- Evidence: `/work/.evidence/orderly-chaos-verify-6/`

The implementation and its repaired deployment topology pass their functional
checks. The live JavaScript is byte-identical to the clean candidate build,
and health reports the full candidate SHA. The report-only verdict is FAIL
because acceptance requires zero findings and zero untested public claims.

## Findings to address

1. **Major:** make every mobile link target at least 44 × 44 CSS px. The main
   nav, wordmark, footer links, legal contact link, restore link, and 404 links
   currently measure 16–27.9 px high.
2. **Minor:** hide the 404 skip link until keyboard focus, prevent its box from
   overlapping the wordmark, and give 404 controls the same designed 3 px
   focus treatment as the main app.
3. **Major:** register exact claim tests for the public statements about no
   analytics/tracking/advertising cookies, complete browser-data removal, and
   hashed room-token storage. The complete removal action passed an independent
   manual check, but the claims contract requires a declared command.

Do not change the established offer or claim checkout activation. The offer is
still $6 USD once for 19 additional cases, 20 total, with no subscription.
Checkout registration remains external and pending.

## Verification completed

- Clean `npm ci`: pass; 0 reported vulnerabilities.
- `npm test`: pass — 6 Vitest, 3 Rust/SQLite, and 23 Playwright checks.
- `npm run build`: pass; `dist/` produced. Initial JavaScript is 11,673 bytes
  gzip and CSS is 4,144 bytes gzip.
- All 17 declared claim commands: pass independently.
- Full live suite with an owned revision restart: 23/23 pass.
- Two real isolated clients share authoritative results. The room result
  survives restart, and a new room works after recovery.
- Health and linked health: 200 JSON. Expiry: 86,400 seconds. Unauthorised
  room read: 401. Third join: 409. Burst recovery: 429 with `Retry-After: 1`.
- Invalid room codes produce a specific validation message, and the game
  remains usable after backend rate limiting.
- Deterministic demo: six populated exhibits, persistent sample label, isolated
  reset from `1/9` to `0/9`, win with four comparisons and five tokens left,
  loss, replay, and restart.
- Fresh desktop and phone first screens show the job, audience, action, board,
  and an exhibit before scrolling, without overflow or console errors.
- Keyboard, dialog focus, reduced motion, settings, route titles, legal pages,
  links, security headers, and deliberate HTTP 404 behavior pass apart from
  the reported manual accessibility defects.
- URL verifier: pass. Automated Axe: no serious or critical violations.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1,298 ms, CLS 0, TBT 139 ms.
- Phone-class active play measured 60 fps.
- No offline/update behavior is promised. No service worker is registered.

## Earlier findings

The previous backend availability and restart-routing findings are resolved.
The earlier incorrect 404 transport status, missing per-case inference rules,
and six previously unregistered claims remain resolved. Verification 6 F-2 is
a new 404 presentation issue; verification 6 F-3 identifies different privacy
claims from those listed in verification 2.

## How to verify

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Run every exact command in `.factory/claims.json` separately from a clean
checkout. Then measure all visible `a`, `button`, and `input` boxes in a fresh
390 × 844 touch context and inspect a real unknown URL at desktop and phone
widths. The repaired version must have zero targets below 44 px, no 404 header
overlap, the normal focus treatment on 404 controls, and one exact registered
test for each public privacy claim.

Evidence is status-only and contains no credentials, cookie values, room
codes, player access values, or license values.
