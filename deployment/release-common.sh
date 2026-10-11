#!/usr/bin/env bash

validate_target() {
  case "$1" in production|development|monitoring) ;; *) echo 'Invalid release environment' >&2; exit 2 ;; esac
}

require_toolkit() {
  local actual
  [[ -x /usr/local/bin/toolkit ]] || { echo 'Install and activate a host toolkit first.' >&2; exit 1; }
  actual="$(/usr/local/bin/toolkit version | sed -n 's/^toolkit_version=\([^ ]*\).*/\1/p')"
  [[ "$actual" =~ ^0\.[0-9]+\.[0-9]+$ && "$(printf '%s\n' 0.8.1 "$actual" | sort -V | head -1)" == 0.8.1 ]] || { echo 'Host toolkit snapshot API requires >=0.8.1, <1.0.0' >&2; exit 1; }
}
