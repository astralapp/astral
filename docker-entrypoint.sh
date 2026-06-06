#!/usr/bin/env sh
set -eu

cd /var/www/html

role="${CONTAINER_ROLE:-app}"

# Escape hatch: `docker compose run app <cmd>` runs an arbitrary command.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

is_local() { [ "${APP_ENV:-production}" = "local" ]; }
app_key_present() { grep -qE '^APP_KEY=base64:' .env 2>/dev/null; }

mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

if [ "${DB_CONNECTION:-mysql}" = "sqlite" ]; then
    sqlite_db_path="${DB_DATABASE:-/var/www/html/storage/database.sqlite}"
    mkdir -p "$(dirname "${sqlite_db_path}")"
    touch "${sqlite_db_path}"
fi

# In local, the app role installs PHP dependencies into the shared volume when
# they are missing (or when only the production set is present — dev tooling
# like Pest is needed for `make test`). Worker roles wait for this below.
if is_local && [ "${role}" = "app" ]; then
    if [ ! -f vendor/autoload.php ] || [ ! -f vendor/bin/pest ]; then
        composer install --no-interaction --prefer-dist
    fi
fi

# Worker roles wait until the app's php-fpm is accepting connections on :9000.
# That only happens after the app role finishes first-boot setup (installing
# dependencies and, in local, generating the key and running migrations), so it
# is a reliable, fresh-per-boot readiness signal — no stale marker files.
if [ "${role}" != "app" ]; then
    waited=0
    until nc -z -w 2 app 9000 2>/dev/null; do
        if [ "${waited}" -ge 180 ]; then
            echo "Timed out waiting for app; starting anyway." >&2
            break
        fi
        echo "Waiting for app to be ready... (${waited}s)"
        sleep 2
        waited=$((waited + 2))
    done
fi

php artisan config:clear >/dev/null 2>&1 || true

# First-run convenience in local: ensure an app key and an up-to-date schema so
# a fresh `make up` is immediately usable. Both are idempotent.
if is_local && [ "${role}" = "app" ]; then
    app_key_present || php artisan key:generate --force || true
    php artisan migrate --force || true
fi

# Compose's env_file injects an empty APP_KEY that shadows the value in .env
# (Dotenv won't override a real env var). Re-export the real key from .env so
# the process actually uses it.
if [ -z "${APP_KEY:-}" ] && app_key_present; then
    APP_KEY="$(grep -E '^APP_KEY=base64:' .env | head -n1 | cut -d '=' -f2-)"
    export APP_KEY
fi

case "${role}" in
    app)
        exec php-fpm -F
        ;;
    queue)
        exec php artisan queue:work --tries=3 --timeout=90
        ;;
    scheduler)
        exec php artisan schedule:work
        ;;
    *)
        echo "Unknown CONTAINER_ROLE: ${role}" >&2
        exit 1
        ;;
esac
