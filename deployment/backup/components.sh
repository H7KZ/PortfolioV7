#!/usr/bin/env bash
# Backup component list, sourced by `deployment/toolkit backup` (as root on the VPS, as a normal
# user for `backup check` and `backup drill` on a GitHub runner).
#
# Each component is one object: produce_<name with _> writes the plaintext to stdout and exits
# non-zero on any failure; the toolkit compresses, encrypts and uploads it. Nothing runs at source
# time. https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md
# shellcheck disable=SC2034 # arrays are read by the toolkit

declare -gA BACKUP_EXT BACKUP_PAUSE BACKUP_MIN_BYTES BACKUP_DRILL

# Capture order: databases first, files last.
BACKUP_COMPONENTS=(cms-postgres umami-postgres cms-uploads)

# CMS content. Custom-format dump, so the drill and a restore use pg_restore.
BACKUP_EXT["cms-postgres"]=pgdump
BACKUP_MIN_BYTES["cms-postgres"]=10000
BACKUP_DRILL["cms-postgres"]="postgres deployment/production/docker-compose.production.yml"

# Umami analytics (13-month retention). Aggregate traffic; the schema is small.
BACKUP_EXT["umami-postgres"]=pgdump
BACKUP_MIN_BYTES["umami-postgres"]=8000
BACKUP_DRILL["umami-postgres"]="postgres deployment/monitoring/docker-compose.monitoring.yml"

# CMS media (/media/<file> on the site). Files are write-once, so nothing is paused.
# The floor applies to the compressed, encrypted object: an empty tar comes out near 300 bytes, a
# real media set far above, so an emptied volume fails the run.
BACKUP_EXT["cms-uploads"]=tar
BACKUP_MIN_BYTES["cms-uploads"]=1024
BACKUP_DRILL["cms-uploads"]="archive"

# Exactly one running container for a Compose project/service, found by label (names are not fixed).
_container() {
  local ids
  ids="$(docker ps --filter "label=com.docker.compose.project=$1" --filter "label=com.docker.compose.service=$2" --format '{{.ID}}')"
  [[ -n "$ids" && "$ids" != *$'
'* ]] || {
    echo "expected exactly one running container for $1/$2" >&2
    return 1
  }
  printf '%s
' "$ids"
}

# Credentials stay inside the container environment.
produce_cms_postgres() {
  local id
  id="$(_container portfolio postgres)" || return 1
  docker exec "$id" sh -ceu 'exec pg_dump -Fc --compress=0 --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}

produce_umami_postgres() {
  local id
  id="$(_container portfolio-monitoring umami-db)" || return 1
  docker exec "$id" sh -ceu 'exec pg_dump -Fc --compress=0 --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}

produce_cms_uploads() {
  local id
  id="$(_container portfolio cms)" || return 1
  docker exec "$id" tar -C /data/media -cf - .
}

# Extra drill checks: the restored database holds the application's own bookkeeping table.
# Called with the throwaway container; the restore database is named `restored`.
_drill_has_table() {
  local found
  found="$(docker exec "$1" psql -U postgres -d restored -XAtc "SELECT to_regclass('public.$2') IS NOT NULL")" || return 1
  [[ "$found" == t ]] || {
    echo "restored database has no table $2" >&2
    return 1
  }
}

drill_check_cms_postgres() { _drill_has_table "$1" payload_migrations; }
drill_check_umami_postgres() { _drill_has_table "$1" website; }
