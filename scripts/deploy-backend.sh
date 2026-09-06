#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$REPO_DIR"

APP_NAME=sf-orderly-chaos
RESOURCE_GROUP=sociobot
REGISTRY=sociobotregistry
SOURCE_SHA=$(git rev-parse HEAD)

[[ "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "A committed Git revision is required." >&2; exit 2; }

TOPOLOGY=$(az containerapp show --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" \
  --query '[properties.template.scale.minReplicas, properties.template.scale.maxReplicas, properties.template.volumes[?name==`data`].storageName | [0], properties.template.containers[0].volumeMounts[?mountPath==`/data`].volumeName | [0]]' -o tsv)
[[ "$TOPOLOGY" == $'1\n1\nsf-orderly-chaos-data\ndata' ]] || {
  echo "The backend does not have the required one-replica /data topology." >&2
  exit 1
}
if [[ "${1:-}" == "--check" ]]; then
  echo "The backend has the required one-replica /data topology."
  exit 0
fi
git diff --quiet && git diff --cached --quiet || { echo "Commit tracked changes before deployment." >&2; exit 2; }

TAG="$APP_NAME:${SOURCE_SHA:0:12}"
az acr build --registry "$REGISTRY" --image "$TAG" --file Dockerfile \
  --build-arg "BUILD_SHA=$SOURCE_SHA" .
IMAGE=$(bash /opt/fleet/lib/resolve-image.sh "$REGISTRY.azurecr.io/$TAG" "$REGISTRY")

# Updating only the image preserves the existing environment, probes, volume,
# replica bounds, linked-backend authorization, and public static hostname.
az containerapp update --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" \
  --image "$IMAGE" --output none

for attempt in $(seq 1 30); do
  LIVE_BUILD=$(curl -fsS --max-time 20 https://orderly-chaos.sociobot.in/api/health 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("build", ""))' 2>/dev/null || true)
  if [[ "$LIVE_BUILD" == "$SOURCE_SHA" ]]; then
    printf 'Backend %s is live through the linked product API.\n' "${SOURCE_SHA:0:12}"
    exit 0
  fi
  sleep 5
done

echo "The new backend revision did not become public within 150 seconds." >&2
exit 1
