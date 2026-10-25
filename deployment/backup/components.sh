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
# Umami analytics live in Infrastructure's shared monitoring stack and are backed up there.
BACKUP_COMPONENTS=(cms-postgres cms-uploads)

# CMS content. Custom-format dump, so the drill and a restore use pg_restore.
BACKUP_EXT["cms-postgres"]=pgdump
BACKUP_MIN_BYTES["cms-postgres"]=10000
BACKUP_DRILL["cms-postgres"]="postgres deployment/production/docker-compose.production.yml"

# CMS media (/media/<file> on the site). Files are write-once, so nothing is paused.
# An empty tar is 10240 bytes, so the floor sits above it.
BACKUP_EXT["cms-uploads"]=tar
BACKUP_MIN_BYTES["cms-uploads"]=12000
BACKUP_DRILL["cms-uploads"]="archive"

# Exactly one running container with this name that belongs to the expected Compose project.
_running_container() {
  local name="$1" project="$2" running label
  running="$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null)" || {
    echo "container $name does not exist" >&2
    return 1
  }
  [[ "$running" == true ]] || {
    echo "container $name is not running" >&2
    return 1
  }
  label="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$name")"
  [[ "$label" == "$project" ]] || {
    echo "container $name belongs to Compose project '$label', expected '$project'" >&2
    return 1
  }
}

# Credentials stay inside the container environment.
produce_cms_postgres() {
  _running_container portfolio-postgres portfolio || return 1
  docker exec portfolio-postgres sh -ceu 'exec pg_dump -Fc --compress=0 --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}

produce_cms_uploads() {
  _running_container portfolio-cms portfolio || return 1
  docker exec portfolio-cms tar -C /data/media -cf - .
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
