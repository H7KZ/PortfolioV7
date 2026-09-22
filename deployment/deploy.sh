#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script Name: deploy.sh
# Description: Deploys the portfolio Docker Compose stack for one environment.
#              Adapted from Ohlídáme's deployment/deploy.sh.
#
#              production:  web + cms + postgres (the one global CMS lives here)
#              development: web only, reading the production CMS
#
# Usage:       ./deploy.sh <project_name> <environment> [service]
# Example:     ./deploy.sh portfolio production
#              ./deploy.sh portfolio production cms
#              ./deploy.sh portfolio-dev development web
#
# Required Environment Variables:
#   IMAGE_REGISTRY      Container registry (e.g., ghcr.io)
#   IMAGE_PREFIX        Image name prefix (e.g., h7kz/portfoliov7)
#   WEB_IMAGE_TAG       Required when web is deployed
#   CMS_IMAGE_TAG       Required when cms is deployed (production only)
#
# Before the cms starts (it runs pending Payload migrations on boot), the
# database is dumped by scripts/pre-migrate-dump.sh. Only the last 3 dumps
# are kept. There are no other backups: accepted risk, see docs/PLAN.md.
# ==============================================================================

readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly VERSIONS_BASE="$HOME/portfolio/versions"

source "$SCRIPT_DIR/lib.sh"

usage() {
    cat << EOF
Usage: $SCRIPT_NAME <project_name> <environment> [service]

Arguments:
    project_name    Docker Compose project name (portfolio, portfolio-dev)
    environment     production | development
    service         (optional) web | cms (cms is production only)

Required Environment Variables:
    IMAGE_REGISTRY, IMAGE_PREFIX
    WEB_IMAGE_TAG   when web is deployed
    CMS_IMAGE_TAG   when cms is deployed
EOF
    exit 1
}

services_for() {
    case "$1" in
        production)  echo "web cms" ;;
        development) echo "web" ;;
        *) log_error "Unknown environment: '$1'. Valid values: production, development"; exit 1 ;;
    esac
}

tag_var_for() {
    case "$1" in
        web) echo "WEB_IMAGE_TAG" ;;
        cms) echo "CMS_IMAGE_TAG" ;;
    esac
}

validate_environment_vars() {
    local environment="$1" service="$2"
    local missing=()
    local allowed
    allowed="$(services_for "$environment")"

    [[ -z "${IMAGE_REGISTRY:-}" ]] && missing+=("IMAGE_REGISTRY")
    [[ -z "${IMAGE_PREFIX:-}" ]] && missing+=("IMAGE_PREFIX")

    local targets="$allowed"
    if [[ -n "$service" ]]; then
        if [[ " $allowed " != *" $service "* ]]; then
            log_error "Service '$service' is not part of $environment. Valid values: $allowed"
            exit 1
        fi
        targets="$service"
    fi

    local target var
    for target in $targets; do
        var="$(tag_var_for "$target")"
        [[ -z "${!var:-}" ]] && missing+=("$var")
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing[*]}"
        exit 1
    fi
}

cleanup_on_error() {
    log_error "Deployment failed."
    exit 1
}

cleanup_old_versions() {
    local environment="$1"
    local versions_dir="$VERSIONS_BASE/$environment"
    local current_link="$VERSIONS_BASE/$environment/current"

    [[ -d "$versions_dir" ]] || return 0

    local current_target
    current_target=$(readlink -f "$current_link" 2>/dev/null || echo "")

    local all_versions=()
    while IFS= read -r -d '' dir; do
        all_versions+=("$dir")
    done < <(find "$versions_dir" -maxdepth 1 -mindepth 1 -type d -printf '%T@\t%p\0' | sort -z | cut -z -f2-)

    local total=${#all_versions[@]}
    local kept=0
    local deleted=0

    for dir in "${all_versions[@]}"; do
        [[ "$dir" == "$current_target" ]] && { kept=$((kept + 1)); continue; }

        local age_days
        age_days=$(( ($(date +%s) - $(stat -c %Y "$dir")) / 86400 ))

        if [[ $age_days -gt 7 ]] && [[ $((total - deleted)) -gt 3 ]]; then
            log "Removing old version: $(basename "$dir") (${age_days}d old)"
            rm -rf "$dir"
            deleted=$((deleted + 1))
        else
            kept=$((kept + 1))
        fi
    done

    log "Version cleanup: removed $deleted, kept $kept"
}

main() {
    [[ $# -lt 2 ]] && usage

    local project_name="$1"
    local environment="$2"
    local service="${3:-}"

    trap cleanup_on_error ERR

    local app_compose_file="$SCRIPT_DIR/$environment/docker-compose.$environment.yml"
    local networks_config="$SCRIPT_DIR/$environment/networks.yml"
    local volumes_config="$SCRIPT_DIR/$environment/volumes.yml"
    local env_file="$SCRIPT_DIR/$environment/.env"

    validate_environment_vars "$environment" "$service"
    validate_files "$app_compose_file" "$networks_config" "$volumes_config" "$env_file"

    log "=========================================="
    log "Starting Deployment"
    log "=========================================="
    log "Project:     $project_name"
    log "Environment: $environment"
    log "Service:     ${service:-all}"
    log "Registry:    $IMAGE_REGISTRY/$IMAGE_PREFIX"
    log "Tags:        web=${WEB_IMAGE_TAG:-} cms=${CMS_IMAGE_TAG:-}"
    log "=========================================="

    create_networks "$networks_config"
    create_volumes "$volumes_config"

    local compose=(docker compose -p "$project_name" --env-file "$env_file" -f "$networks_config" -f "$volumes_config" -f "$app_compose_file")

    if [[ -z "$service" || "$service" == "cms" ]] && [[ "$environment" == "production" ]]; then
        bash "$SCRIPT_DIR/scripts/pre-migrate-dump.sh"
    fi

    if [[ -n "$service" ]]; then
        # web deploys alone: its cms dependency may belong to another deploy and must not
        # be recreated with a floating tag. cms deploys with postgres, a pinned image.
        local deps_flag="--no-deps"
        [[ "$service" == "cms" ]] && deps_flag=""

        log "Pulling image for $service..."
        "${compose[@]}" pull "portfolio-$service"

        log "Deploying $service..."
        "${compose[@]}" up $deps_flag -d --wait "portfolio-$service"
    else
        log "Pulling images..."
        "${compose[@]}" pull

        log "Deploying stack..."
        "${compose[@]}" up --remove-orphans -d --wait
    fi

    trap - ERR

    cleanup_old_versions "$environment" || true

    log_success "=========================================="
    log_success "Deployment Complete"
    log_success "=========================================="
    log "Logs:   docker compose -p $project_name logs -f"
    log "Status: docker compose -p $project_name ps"
}

main "$@"
