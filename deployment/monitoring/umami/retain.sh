#!/usr/bin/env bash
# Umami retention purge: runs retention.sql from the current monitoring snapshot inside the
# Umami database container.
#
# Scheduled as the `umami-retention` job in deployment/toolkit.conf (run `deployment/toolkit job
# umami-retention`). The toolkit runs it as root from /opt/toolkit/portfolio/ under the repository
# lock (environment monitoring) with TOOLKIT_REPOSITORY, TOOLKIT_DEPLOY_USER, TOOLKIT_DEPLOY_HOME
# and TOOLKIT_REPO_ROOT set; it takes no locks and no arguments itself.
#
# The SQL is read from the snapshot only after its metadata and inventory hash check out, so a
# tampered or legacy snapshot is refused. Database credentials stay inside the container.
#
# Exit codes: 0 success, 1 failure, 2 usage error.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=deployment/vendor/toolkit/log.sh
source "$here/../../vendor/toolkit/log.sh"

(($# == 0)) || die 2 'takes no arguments; run it with: deployment/toolkit job umami-retention'
((EUID == 0)) || die 2 'must run as root through the toolkit job runner'
: "${TOOLKIT_DEPLOY_HOME:?run through deployment/toolkit job umami-retention}"

root="$TOOLKIT_DEPLOY_HOME/portfolio/versions/monitoring"
[[ -L "$root/current" ]] || die 'monitoring current snapshot missing; deploy monitoring first'
release="$(realpath -e "$root/current")"
[[ "$(dirname -- "$release")" == "$root" && -f "$release/.toolkit-release.json" && ! -L "$release/.toolkit-release.json" && -f "$release/.toolkit-inventory.json" ]] ||
  die 'legacy or corrupt monitoring snapshot; stage a new snapshot'

python3 - "$release" <<'PY'
import hashlib, json, sys
from pathlib import Path
release=Path(sys.argv[1])
document=json.loads((release/'.toolkit-release.json').read_text())
if document.get('schema_version') != 1 or document.get('repository') != 'portfolio' or document.get('environment') != 'monitoring' or document.get('project') != 'portfolio-monitoring' or document.get('release_id') != release.name or not document.get('resolved_images'):
    raise SystemExit('invalid monitoring snapshot metadata')
inventory=json.loads((release/'.toolkit-inventory.json').read_text())
for name in ['.toolkit-release.json','monitoring/umami/retention.sql']:
    path=release/name
    if path.is_symlink() or inventory.get(name) != {'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}:
        raise SystemExit('monitoring snapshot inventory mismatch')
PY

log_info "purging Umami data older than retention from snapshot ${release##*/}"
docker exec -i portfolio-umami-postgres sh -c 'exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <"$release/monitoring/umami/retention.sql"
log_ok 'Umami retention applied'
