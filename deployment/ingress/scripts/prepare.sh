#!/usr/bin/env bash
# Release prepare hook: render Traefik's static config and the private credentials.
# Toolkit runs it as the deploy user, from the release snapshot, before Compose is resolved.
# Staging only: it touches neither Docker nor the host. Usage: run through
# `deployment/toolkit release deploy ingress`. Exit codes: 0 success, 1 failure.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
exec python3 -B "$here/prepare.py"
