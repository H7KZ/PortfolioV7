#!/usr/bin/env bash
# Analytics retention: run the current monitoring snapshot's retention SQL against Umami's database.
# Declared as the umami-retention job in deployment/toolkit.conf; `deployment/toolkit job
# umami-retention` runs it as root from the installed control copy, under the portfolio repository
# lock, with TOOLKIT_DEPLOY_USER and TOOLKIT_DEPLOY_HOME set.
# Exit codes: 0 success, 1 failure, 2 usage error.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=../vendor/toolkit/log.sh
source "$here/../vendor/toolkit/log.sh"

(($# == 0)) || die 2 'usage: retention.sh (no arguments; run through deployment/toolkit job umami-retention)'
[[ "$EUID" == 0 ]] || die 'run the retention job as root through deployment/toolkit job'
: "${TOOLKIT_DEPLOY_USER:?run through deployment/toolkit job umami-retention}"
: "${TOOLKIT_DEPLOY_HOME:?run through deployment/toolkit job umami-retention}"

log_step 'Run analytics retention'
exec runuser -u "$TOOLKIT_DEPLOY_USER" -- \
  python3 "$here/retention.py" "$TOOLKIT_DEPLOY_HOME/portfolio/versions/monitoring"
