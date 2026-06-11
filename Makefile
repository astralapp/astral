COMPOSE_DEV = docker compose -f compose.yml -f compose.dev.yml
COMPOSE_DEV_SQLITE = docker compose -f compose.yml -f compose.dev.yml -f compose.sqlite.yml
COMPOSE_PROD = docker compose -f compose.yml
COMPOSE_PROD_SQLITE = docker compose -f compose.yml -f compose.sqlite.yml

.PHONY: help setup setup-sqlite up down restart build logs ps shell shell-vite pnpm key migrate seed test pint artisan \
	shell-vite-sqlite pnpm-sqlite \
	up-sqlite down-sqlite restart-sqlite build-sqlite logs-sqlite ps-sqlite shell-sqlite \
	key-sqlite migrate-sqlite seed-sqlite test-sqlite artisan-sqlite \
	prod-up prod-down prod-restart prod-build prod-logs prod-ps prod-migrate \
	prod-up-sqlite prod-down-sqlite prod-restart-sqlite prod-build-sqlite prod-logs-sqlite prod-ps-sqlite prod-migrate-sqlite

help:
	@echo "Astral Make targets:"
	@echo "  make setup          First-run: create .env, build & start dev stack (MySQL)"
	@echo "  make setup-sqlite   First-run: create .env, build & start dev stack (SQLite)"
	@echo "  make up             Start local dev stack"
	@echo "  make up-sqlite      Start local dev stack (SQLite mode)"
	@echo "  make down           Stop local dev stack"
	@echo "  make down-sqlite    Stop local dev stack (SQLite mode)"
	@echo "  make restart        Restart local dev stack"
	@echo "  make restart-sqlite Restart local dev stack (SQLite mode)"
	@echo "  make build          Rebuild local dev stack"
	@echo "  make build-sqlite   Rebuild local dev stack (SQLite mode)"
	@echo "  make logs           Tail logs for local dev stack"
	@echo "  make logs-sqlite    Tail logs for local dev stack (SQLite mode)"
	@echo "  make ps             Show local dev containers"
	@echo "  make ps-sqlite      Show local dev containers (SQLite mode)"
	@echo "  make shell          Open shell in app container"
	@echo "  make shell-sqlite   Open shell in app container (SQLite mode)"
	@echo "  make key            Generate Laravel app key"
	@echo "  make key-sqlite     Generate Laravel app key (SQLite mode)"
	@echo "  make migrate        Run database migrations"
	@echo "  make migrate-sqlite Run database migrations (SQLite mode)"
	@echo "  make seed           Seed database"
	@echo "  make seed-sqlite    Seed database (SQLite mode)"
	@echo "  make test           Run test suite"
	@echo "  make test-sqlite    Run test suite (SQLite mode)"
	@echo "  make pint           Run Laravel Pint"
	@echo "  make artisan cmd=\"about\""
	@echo "  make artisan-sqlite cmd=\"about\""
	@echo "  make shell-vite     Open shell in vite (Node/pnpm) container"
	@echo "  make pnpm cmd=\"run lint\"   Run pnpm in the vite container"
	@echo "  make pnpm-sqlite cmd=\"run lint\""
	@echo "  make prod-up        Start production stack"
	@echo "  make prod-up-sqlite Start production stack (SQLite mode)"
	@echo "  make prod-down      Stop production stack"
	@echo "  make prod-down-sqlite Stop production stack (SQLite mode)"
	@echo "  make prod-build     Rebuild production stack"
	@echo "  make prod-build-sqlite Rebuild production stack (SQLite mode)"
	@echo "  make prod-logs      Tail production logs"
	@echo "  make prod-logs-sqlite Tail production logs (SQLite mode)"
	@echo "  make prod-ps        Show production containers"
	@echo "  make prod-ps-sqlite Show production containers (SQLite mode)"
	@echo "  make prod-migrate   Run production migrations with --force"
	@echo "  make prod-migrate-sqlite Run production migrations with --force (SQLite mode)"

setup:
	@[ -f .env ] || (cp .env.example .env && echo "Created .env from .env.example")
	$(COMPOSE_DEV) up --build -d
	@echo ""
	@echo "Astral is starting. The app key and migrations run automatically on first boot."
	@app_port=$$(grep -E '^APP_PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2 | tr -d ' '); echo "  App:  http://localhost:$${app_port:-8080}"
	@vite_port=$$(grep -E '^VITE_PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2 | tr -d ' '); echo "  Vite: http://localhost:$${vite_port:-5173}"
	@echo "Set GITHUB_CLIENT_ID/SECRET in .env to sign in (GitHub OAuth). Run 'make logs' to follow startup."

setup-sqlite:
	@[ -f .env ] || (cp .env.example .env && echo "Created .env from .env.example")
	$(COMPOSE_DEV_SQLITE) up --build -d
	@echo ""
	@echo "Astral (SQLite) is starting. The app key and migrations run automatically on first boot."
	@app_port=$$(grep -E '^APP_PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2 | tr -d ' '); echo "  App:  http://localhost:$${app_port:-8080}"
	@vite_port=$$(grep -E '^VITE_PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2 | tr -d ' '); echo "  Vite: http://localhost:$${vite_port:-5173}"
	@echo "Set GITHUB_CLIENT_ID/SECRET in .env to sign in (GitHub OAuth). Run 'make logs-sqlite' to follow startup."

up:
	$(COMPOSE_DEV) up --build -d

down:
	$(COMPOSE_DEV) down

up-sqlite:
	$(COMPOSE_DEV_SQLITE) up --build -d

down-sqlite:
	$(COMPOSE_DEV_SQLITE) down

restart:
	$(COMPOSE_DEV) down
	$(COMPOSE_DEV) up --build -d

restart-sqlite:
	$(COMPOSE_DEV_SQLITE) down
	$(COMPOSE_DEV_SQLITE) up --build -d

build:
	$(COMPOSE_DEV) up --build -d

build-sqlite:
	$(COMPOSE_DEV_SQLITE) up --build -d

logs:
	$(COMPOSE_DEV) logs -f

logs-sqlite:
	$(COMPOSE_DEV_SQLITE) logs -f

ps:
	$(COMPOSE_DEV) ps

ps-sqlite:
	$(COMPOSE_DEV_SQLITE) ps

shell:
	$(COMPOSE_DEV) exec app sh

shell-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app sh

key:
	$(COMPOSE_DEV) exec app php artisan key:generate

key-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app php artisan key:generate

migrate:
	$(COMPOSE_DEV) exec app php artisan migrate

migrate-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app php artisan migrate

seed:
	$(COMPOSE_DEV) exec app php artisan db:seed

seed-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app php artisan db:seed

test:
	$(COMPOSE_DEV) exec app php artisan test --compact

test-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app php artisan test --compact

pint:
	$(COMPOSE_DEV) exec app vendor/bin/pint --format agent

artisan:
	$(COMPOSE_DEV) exec app php artisan $(cmd)

artisan-sqlite:
	$(COMPOSE_DEV_SQLITE) exec app php artisan $(cmd)

# Node/pnpm live in the vite container (the app container is PHP-only). The Vite
# dev server already runs there as the main process — these are for one-off
# pnpm commands (lint, format, adding packages, etc.).
shell-vite:
	$(COMPOSE_DEV) exec vite sh

shell-vite-sqlite:
	$(COMPOSE_DEV_SQLITE) exec vite sh

pnpm:
	$(COMPOSE_DEV) exec vite pnpm $(cmd)

pnpm-sqlite:
	$(COMPOSE_DEV_SQLITE) exec vite pnpm $(cmd)

prod-up:
	$(COMPOSE_PROD) up --build -d

prod-up-sqlite:
	$(COMPOSE_PROD_SQLITE) up --build -d

prod-down:
	$(COMPOSE_PROD) down

prod-down-sqlite:
	$(COMPOSE_PROD_SQLITE) down

prod-restart:
	$(COMPOSE_PROD) down
	$(COMPOSE_PROD) up --build -d

prod-restart-sqlite:
	$(COMPOSE_PROD_SQLITE) down
	$(COMPOSE_PROD_SQLITE) up --build -d

prod-build:
	$(COMPOSE_PROD) up --build -d

prod-build-sqlite:
	$(COMPOSE_PROD_SQLITE) up --build -d

prod-logs:
	$(COMPOSE_PROD) logs -f

prod-logs-sqlite:
	$(COMPOSE_PROD_SQLITE) logs -f

prod-ps:
	$(COMPOSE_PROD) ps

prod-ps-sqlite:
	$(COMPOSE_PROD_SQLITE) ps

prod-migrate:
	$(COMPOSE_PROD) exec app php artisan migrate --force

prod-migrate-sqlite:
	$(COMPOSE_PROD_SQLITE) exec app php artisan migrate --force
