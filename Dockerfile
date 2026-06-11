# syntax=docker/dockerfile:1

# 1. PHP dependencies (production only)
FROM composer:2 AS composer_deps

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# 1b. Dev dependencies — only used by the frontend build stage, which runs
#     `php artisan typescript:transform` to generate the TypeScript types the
#     Vue components reference (App.Data.*). Not shipped in the final image.
FROM composer:2 AS composer_dev

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts

# 2. Shared PHP base with the runtime extensions (used by the builder and the
#    final app image so both behave identically).
FROM php:8.4-fpm-alpine AS php_base

WORKDIR /var/www/html

RUN apk add --no-cache \
        bash \
        curl \
        git \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        unzip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers \
    && docker-php-ext-install \
        bcmath \
        mbstring \
        pdo_mysql \
        pcntl \
        zip \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# pdo_sqlite / sqlite3 ship enabled by default in the official PHP image,
# so SQLite mode works without extra extensions.

# su-exec lets the entrypoint drop the queue/scheduler to www-data (separate
# layer so the extension build above stays cached).
RUN apk add --no-cache su-exec

COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# 3. Frontend assets. Hybridly's Vite plugin shells out to `php artisan
#    hybridly:config`, so the build needs PHP + vendor + app code as well as
#    Node. We add the pinned Node (matching .nvmrc) onto the PHP base.
FROM php_base AS frontend_assets

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# libstdc++ is required by the Node binary copied from the node image.
RUN apk add --no-cache libstdc++
COPY --from=node:24.13.1-alpine /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24.13.1-alpine /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && corepack enable

COPY --from=composer_dev /var/www/html/vendor ./vendor
COPY . .

# Generate resources/types/generated.d.ts (App.Data.* types) before building.
# --force because APP_ENV defaults to production when no .env is present.
RUN php artisan typescript:transform --force

RUN pnpm install --frozen-lockfile \
    && pnpm run build

# 4. Application image (php-fpm) — runs the app, queue, and scheduler roles
FROM php_base AS app

# composer is used by the entrypoint in local dev (when the bind-mounted source
# shadows the baked vendor and dependencies must be (re)installed).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY --from=composer_deps /var/www/html/vendor ./vendor
COPY . .
COPY --from=frontend_assets /var/www/html/public/build ./public/build

COPY docker-entrypoint.sh /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container \
    && chown -R www-data:www-data storage bootstrap/cache

ENV CONTAINER_ROLE=app

ENTRYPOINT ["/usr/local/bin/start-container"]

# 4b. Development image — the app image plus Node, used for the Vite dev server.
#     Hybridly's Vite plugin shells out to `php artisan`, so the Vite process
#     needs PHP and Node together. Not used in production.
FROM app AS dev

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apk add --no-cache libstdc++
COPY --from=node:24.13.1-alpine /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24.13.1-alpine /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && corepack enable

# 5. Web image (nginx) — self-contained: serves the compiled assets baked in,
#    so it works from a bare clone with no host bind mounts in production.
FROM nginx:1.27-alpine AS web

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public
COPY --from=frontend_assets /var/www/html/public/build /var/www/html/public/build
