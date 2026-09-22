SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.PHONY: install dev down logs migrate verify build

# Dependencies

install:
	pnpm install

# Development

dev:
	docker compose -f docker-compose.local.yml up -d postgres
	pnpm turbo run dev

down:
	docker compose -f docker-compose.local.yml down --remove-orphans

logs:
	docker compose -f docker-compose.local.yml logs -f

migrate:
	pnpm --filter @portfolio/cms run migrate

# Quality

verify:
	pnpm verify

# Build

build:
	pnpm build
