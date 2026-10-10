#!/usr/bin/env bash
set -Eeuo pipefail

# Toolkit runs this prepare hook as the deploy user while holding the release lock.
: "${TOOLKIT_RUNTIME_DIR:?Run through toolkit release deploy}"
: "${TOOLKIT_ENV_FILE:?Run through toolkit release deploy}"
container=portfolio-postgres
dumps="$HOME/portfolio/dumps"
docker info >/dev/null
if ! docker inspect "$container" >/dev/null 2>&1; then
  if docker volume inspect portfolio-postgres-volume >/dev/null 2>&1; then
    echo 'Existing CMS database has no container. Recover it before migrating.' >&2
    exit 1
  fi
  echo 'First CMS deployment: no existing database to dump.'
  exit 0
fi
[[ "$(docker inspect -f '{{.State.Running}}' "$container")" == true ]] || {
  echo 'Existing CMS database must be running for the migration dump.' >&2; exit 1;
}
[[ "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$container")" == portfolio ]] || {
  echo 'CMS database belongs to a different Compose project.' >&2; exit 1;
}
umask 077
mkdir -p "$dumps"
chmod 700 "$dumps"
target="$dumps/portfolio-$(date -u +%Y%m%dT%H%M%S)-$$.dump"
trap 'rm -f -- "$target.partial"' EXIT
docker exec "$container" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$target.partial"
[[ -s "$target.partial" ]] || { echo 'Empty CMS migration dump' >&2; exit 1; }
mv -- "$target.partial" "$target"
echo 'CMS migration dump complete. Recovery dumps are retained without automatic pruning.'
