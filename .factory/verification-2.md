# Verification 2 — PASS

**Verdict: PASS.** The two findings in
[`.factory/verification-1.md`](verification-1.md) are repaired. There are no
untested declared claims.

Live URL: <https://orderly-chaos.sociobot.in>  
Live implementation: `6635570ff1846153c8ff095d3700707134dd8cbd`  
Container image: `sha256:324f576e9ae8d2ce86d0727109136d0b5cf60925815cd101f2436b45e93fef57`  
Active revision: `sf-orderly-chaos--0000004`

## Finding disposition

### F-1 — resolved: real two-player backend

The public hostname now resolves to the product-owned Rust/Axum container
rather than the Static Web App fallback. The live runtime contract observed:

- `GET /health` → HTTP 200 JSON with `status: "ok"` and the implementation
  build SHA.
- `POST /api/rooms` → HTTP 200 JSON from the room service.
- Two isolated browser contexts created and joined one room, one completed the
  case, and the other read the server-validated solved result.
- The shared result survived an actual restart of `sf-orderly-chaos`.
- The room expiry claim validated a server expiry exactly 24 hours after
  creation within the test tolerance.
- A live burst produced HTTP 429 and `Retry-After: 1`, followed by a healthy
  response.
- A browser without room access received HTTP 401 when attempting to read an
  existing room.

The deployment retained the existing Azure Files state volume at `/data` and
the one-replica bound required by the SQLite `unix-none` configuration.

### F-2 — resolved: deliberate HTTP 404

`GET /not-a-product-route` now returns the designed archive page with HTTP
404. The runtime contract and the route/browser check both assert the status,
not merely the client-side page appearance.

## Commands and results

Fresh local setup:

```sh
npm ci
npm test
npm run build
```

Passed with 5 unit tests, 3 Rust/SQLite tests, and 17 Playwright scenarios.
Each of the ten exact claim commands in `.factory/claims.json` was then run
separately and passed.

Live after the repair:

```sh
npm run verify:live
BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e
LIVE_RESTART=1 BASE_URL=https://orderly-chaos.sociobot.in npm run test:e2e -- --grep @claim:two-player-shared
/opt/fleet/lib/verify-url.sh https://orderly-chaos.sociobot.in /work/.evidence/orderly-chaos-repair-2-url
```

The full live 16-scenario run passed after the routing repair. The final
revision passed the focused delivery contract, access-isolation, and complete
run checks. The Playwright Axe coverage in the suite found no serious or
critical issues. Fresh desktop and 390 px phone screenshots showed no
horizontal overflow or console errors; the title, audience sentence, and
sample action were all visible before scrolling.

## Evidence

- `/work/.evidence/orderly-chaos-repair-2-url/verify.json`
- `/work/.evidence/repair-final-desktop-first-screen.png`
- `/work/.evidence/repair-final-phone-first-screen.png`
- `/work/.evidence/live-win-screen.png`

Evidence records outcomes only and excludes credentials, room access values,
and cookies.
