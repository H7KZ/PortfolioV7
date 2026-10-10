#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
source "$SCRIPT_DIR/release-common.sh"
(($# == 5)) || { echo 'usage: deploy.sh <production|development|monitoring> <archive> <checksum> <manifest> <dotenv>' >&2; exit 2; }
environment="$1"
validate_target "$environment"
require_toolkit
install -d -m 0700 "$HOME/portfolio/versions/$environment"
args=(release deploy --repository portfolio --environment "$environment"
  --root "$HOME/portfolio/versions/$environment" --user "$(id -un)")
for option in archive checksum manifest env-file; do
  shift
  [[ "$1" == /* && -f "$1" && ! -L "$1" ]] || { echo "Invalid $option file" >&2; exit 1; }
  args+=("--$option" "$1")
done
[[ -z "${DOCKER_CONFIG:-}" ]] || args+=(--registry-config "$DOCKER_CONFIG")
exec sudo -n /usr/local/bin/toolkit "${args[@]}"
