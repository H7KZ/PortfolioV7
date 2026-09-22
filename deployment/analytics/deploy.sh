#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Deploys the portfolio-analytics stack (Umami). Traefik (Infrastructure) must
# already run. Called by .github/workflows/deploy-analytics.yml.
#
# Required env:
#   UMAMI_DB_NAME, UMAMI_DB_USER, UMAMI_DB_PASSWORD, UMAMI_APP_SECRET
#   SITE_DOMAIN, UMAMI_DOMAIN
#
# First deploy: log in to https://$UMAMI_DOMAIN as admin / umami, change the
# password, add the website for $SITE_DOMAIN and set its id as the
# UMAMI_WEBSITE_ID variable on the production GitHub Environment.
# ==============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly STACK_NAME="portfolio-analytics"

source "$SCRIPT_DIR/../lib.sh"

require() {
    local missing=()
    for name in "$@"; do [[ -n "${!name:-}" ]] || missing+=("$name"); done
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required env: ${missing[*]}"
        exit 1
    fi
}

main() {
    require UMAMI_DB_NAME UMAMI_DB_USER UMAMI_DB_PASSWORD UMAMI_APP_SECRET SITE_DOMAIN UMAMI_DOMAIN
    export UMAMI_DB_NAME UMAMI_DB_USER UMAMI_DB_PASSWORD UMAMI_APP_SECRET SITE_DOMAIN UMAMI_DOMAIN

    local compose=(docker compose -p "$STACK_NAME" -f "$SCRIPT_DIR/networks.yml" -f "$SCRIPT_DIR/volumes.yml" -f "$SCRIPT_DIR/docker-compose.analytics.yml")

    log "=========================================="
    log "Deploying $STACK_NAME"
    log "=========================================="

    validate_files "$SCRIPT_DIR/docker-compose.analytics.yml" "$SCRIPT_DIR/networks.yml" "$SCRIPT_DIR/volumes.yml"
    create_networks "$SCRIPT_DIR/networks.yml"
    create_volumes "$SCRIPT_DIR/volumes.yml"

    "${compose[@]}" pull --quiet
    "${compose[@]}" up -d --remove-orphans --wait portfolio-umami-postgres
    "${compose[@]}" up -d --remove-orphans

    local ready=false
    for _ in $(seq 1 60); do
        if docker exec portfolio-umami wget -qO /dev/null http://127.0.0.1:3000/api/heartbeat 2>/dev/null; then
            ready=true
            break
        fi
        sleep 5
    done
    if [[ "$ready" != true ]]; then
        log_warning "Umami heartbeat not answering yet, check: docker logs portfolio-umami"
    fi

    log_success "=========================================="
    log_success "$STACK_NAME deployed"
    log_success "=========================================="
    log "Dashboard: https://$UMAMI_DOMAIN"
    log "Tracker:   https://$SITE_DOMAIN/stats/stats.js"
}

main
