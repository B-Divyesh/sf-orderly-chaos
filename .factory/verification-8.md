# Repair 8 verification

**Result: repair checks pass.** This is the implementation team's verification
of the verification-7 finding; a later independent review remains the final
acceptance authority.

- Runtime implementation: `a3897cc9677644cfa59b997b0a71c15e245015c7`
- Verification-7 documentation baseline: `7a446638fec79f3ae5203c424c21add05626407f`
- Live URL: <https://orderly-chaos.sociobot.in>

## Closed finding

Verification 7 found that `room-token-hash` had a passing Rust behavior test
but lacked the required `@claim:room-token-hash` marker. The marker now sits
immediately on the exact Tokio test selected by the declared command:

```sh
npm run test:server -- claim_room_token_hash_room_access_is_hashed_at_rest
```

That test creates a room through the production handler and proves that the
stored SQLite value is different from the returned access value, equals its
SHA-256 value, and is a 64-character hexadecimal hash. The command passed.
The 20-ID tag audit found exactly one required marker per declared claim.

## Checks

- Clean `npm ci`, all 20 separately run declared claim commands, `npm test`,
  and `npm run build` passed.
- The local full suite passed 6 core tests, 4 Rust/SQLite tests, and 27
  browser checks.
- Image-only deployment passed after its one-replica, `/data` topology
  preflight. The public health JSON reports the implementation SHA.
- Restart-enabled `npm run verify:live` passed 2/2.
- The full public HTTPS suite passed 27/27 after deployment.
- The URL verifier passed, including title, language, `main`, image alt text,
  labelled controls, and no console errors. Playwright's Axe integration in
  the live suite found no serious or critical issues.
- Fresh desktop and phone views showed the title **Solve an ordering puzzle
  with limited comparisons**, the audience line, **Try it with sample data**,
  and the active game board before scrolling. Neither view overflowed or
  produced console errors.

## Known dependency

Checkout remains pending external billing registration. The public $6 USD
one-time case-pack offer and free case are unchanged; no live checkout or paid
activation is claimed here.

## Evidence

Status-only URL verification and fresh desktop/phone screenshots are in
`/work/.evidence/orderly-chaos-repair-8/`. The evidence contains no room
codes, access values, cookie values, licenses, or credentials.
