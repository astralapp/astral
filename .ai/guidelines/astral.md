# Astral Project Conventions

Astral is a self-hostable GitHub stars organizer built on Laravel + Vue (via Hybridly). These conventions are specific to this repository and complement the generic Laravel guidelines.

## Docker-only workflow

This project runs entirely in Docker — there is **no host PHP, Composer, Node, or pnpm**. Never run `php`, `artisan`, `composer`, `pnpm`, or `vendor/bin/*` directly on the host; run everything through the dev stack instead:

- Artisan: `make artisan cmd="<command>"` (or `docker compose -f compose.yml -f compose.dev.yml exec app php artisan <command>`)
- Tests: `make test`
- Pint, after any PHP change: `make pint`
- A shell in the app container: `make shell`

The app container is PHP-only. Node and pnpm live in a separate `vite` container:

- pnpm: `make pnpm cmd="<args>"` (e.g. `make pnpm cmd="run lint"`, `make pnpm cmd="run format"`)
- Vite shell: `make shell-vite`

The dev stack must be running (`make up`) for these commands — and the Boost MCP server — to work.

## Frontend

- Bundling runs in the `vite` container. If a frontend change isn't reflected, make sure `make up` is running (Vite dev server on `VITE_PORT`, default 5173).
- Lint and format via `make pnpm cmd="run lint"` / `make pnpm cmd="run format"`.

## Product & design context

Before building or changing any UI, read these committed docs — they are the source of truth for product intent and the design system:

- `PRODUCT.md` — who Astral is for, the job-to-be-done, brand voice, and accessibility targets (WCAG 2.1 AA).
- `DESIGN.md` — the design system: color (Signal Green is the only saturated accent), typography (Inter for UI, Orbitron for the wordmark only), elevation, components, and the hard rules / anti-patterns.
