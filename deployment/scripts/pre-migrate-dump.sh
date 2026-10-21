#!/usr/bin/env bash
# Release prepare hook: dump the running CMS database before a migration starts.
# Toolkit runs it as the deploy user, from the release snapshot, while holding the release lock.
# Exit codes: 0 success or first deployment, 1 failure.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=../vendor/toolkit/log.sh
source "$here/../vendor/toolkit/log.sh"

: "${TOOLKIT_RUNTIME_DIR:?run through deployment/toolkit release deploy}"
: "${TOOLKIT_ENV_FILE:?run through deployment/toolkit release deploy}"
container=portfolio-postgres
dumps="$HOME/portfolio/dumps"
docker info >/dev/null
if ! docker inspect "$container" >/dev/null 2>&1; then
  if docker volume inspect portfolio-postgres-volume >/dev/null 2>&1; then
    die 'existing CMS database has no container; recover it before migrating'
  fi
  log_info 'first CMS deployment: no existing database to dump'
  exit 0
fi
[[ "$(docker inspect -f '{{.State.Running}}' "$container")" == true ]] ||
  die 'existing CMS database must be running for the migration dump'
[[ "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$container")" == portfolio ]] ||
  die 'CMS database belongs to a different Compose project'
umask 077
mkdir -p "$dumps"
chmod 700 "$dumps"
target="$dumps/portfolio-$(date -u +%Y%m%dT%H%M%S)-$$.dump"
trap 'rm -f -- "$target.partial"' EXIT
docker exec "$container" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' >"$target.partial"
[[ -s "$target.partial" ]] || die 'empty CMS migration dump'
mv -- "$target.partial" "$target"
log_ok 'CMS migration dump complete; recovery dumps are retained without automatic pruning'
