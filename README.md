# Orderly Chaos

Order six museum exhibits from lightest to heaviest with nine comparison
tokens. It is a five-minute browser puzzle for adults and teens, playable solo
or in a real asynchronous two-player room. Keyboard, mouse, and touch controls
are supported.

Play the isolated sample at <https://orderly-chaos.sociobot.in/demo>. Demo
changes do not touch normal solo progress.

## What is included

- One permanent free case with a complete win/loss loop.
- Server-validated rooms for two independent browsers. Rooms expire after 24 hours.
- A $6 USD one-time case pack with 19 more cases, for 20 total.
- A different exhibit set and placement rule in every curated case.
- Browser-local solo progress, sound choice, and reduced-motion choice.

The paid pack uses only the Sociobot checkout and license API. It is not a
subscription. The checkout product must be registered by the separate billing
operator before a purchase can complete.

## Clean setup

Prerequisites: Node.js 22+, npm, Rust stable, and Chromium for Playwright
1.58.2 (the factory image provides it through `PLAYWRIGHT_BROWSERS_PATH`).

```sh
npm ci
npm test
npm run build
```

`npm test` runs deterministic core tests, Rust/SQLite tests, a production
build, and browser tests. The browser suite starts the real Rust server with an
in-memory test database. `npm run build` writes the static bundle to `dist/`.

For local manual play:

```sh
npm run build
ORDERLY_DB_PATH=:memory: PORT=8080 cargo run --locked
```

Then open <http://localhost:8080/demo>.

## Runtime and deployment

The public site uses Azure Static Web Apps for the built frontend. Its linked
backend sends `/api/*` to the product-owned Rust service. The static routing
configuration rewrites public `/health` to `/api/health`, so release checks
exercise the linked service without moving the product CNAME between hosts.

The Rust service owns room state. In production it writes SQLite to
`/data/orderly-chaos.sqlite3`, runs as one replica, and needs only `PORT`.
Its release script updates only the container image, then verifies the new
build through the linked public API:

```sh
./scripts/deploy-backend.sh
```

For the first deployment only, create the backend with the factory container
helper and link it to the existing Standard static site:

```sh
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh orderly-chaos /work/repo Dockerfile 8080
az staticwebapp backends link \
  --resource-group sociobot \
  --name sf-orderly-chaos \
  --backend-resource-id /subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/sociobot/providers/Microsoft.App/containerApps/sf-orderly-chaos
```

Static releases may then keep the product hostname on the static site without
disconnecting two-player rooms. Preserve the backend's `/data` mount and its
one-replica minimum and maximum.

After deployment, verify that the public hostname reaches the linked service.
This checks health JSON, room creation, a deliberate 404, and persisted room
results after one owned revision restart:

```sh
npm run verify:live
```

This outcome check requires health JSON, a successful room creation, and an
HTTP 404 for an unknown URL. It does not print room access values.

## Documentation

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and asset provenance: [`.factory/design.md`](.factory/design.md)
- Testable public claims: [`.factory/claims.json`](.factory/claims.json)
- Demo storage boundary: [`.factory/demo.md`](.factory/demo.md)
- Privacy and terms: `/privacy` and `/terms` on the running product

The code is MIT licensed. Generated archive imagery is original to this
product and disclosed in the footer.
