#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Dumps the CMS database before a cms deploy, because the cms runs pending
# Payload migrations when it starts. Keeps the last 3 dumps in
# ~/portfolio/dumps. These are the only copies of the data (no backups by
# decision), so they live on the same VPS and only guard against a bad
# migration, not against losing the machine.
#
# Restore:
#   docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < <dump>
# ==============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly CONTAINER="portfolio-postgres"
readonly DUMPS_DIR="$HOME/portfolio/dumps"
readonly KEEP=3

source "$SCRIPT_DIR/../lib.sh"

if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo false)" != "true" ]]; then
    log_warning "$CONTAINER is not running, skipping pre-migration dump (first deploy?)"
    exit 0
fi

mkdir -p "$DUMPS_DIR"
chmod 700 "$DUMPS_DIR"

target="$DUMPS_DIR/portfolio-$(date -u +%Y%m%dT%H%M%SZ).dump"
log "Dumping $CONTAINER to $target"
docker exec "$CONTAINER" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$target.partial"
mv "$target.partial" "$target"
chmod 600 "$target"
log_success "Dump written ($(du -h "$target" | cut -f1))"

find "$DUMPS_DIR" -maxdepth 1 -name 'portfolio-*.dump' -printf '%T@\t%p\n' | sort -rn | tail -n +$((KEEP + 1)) | cut -f2- | while read -r old; do
    log "Removing old dump: $(basename "$old")"
    rm -f "$old"
done
