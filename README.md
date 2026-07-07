<h1 align="center">Astral</h1>

<p align="center">
  <a href="https://github.com/astralapp/astral/actions/workflows/ci.yml"><img src="https://github.com/astralapp/astral/actions/workflows/ci.yml/badge.svg?branch=next" alt="CI status"></a>
</p>

## 🐳 Quick Start (Local, Docker)

**Prerequisites:** Docker (Desktop, or Engine + Compose v2) and `make`.

```bash
make setup
```

`make setup` creates `.env` from `.env.example`, builds the images, and starts
the stack. On first boot the app container automatically generates the
`APP_KEY` and runs migrations — no extra steps needed. The first run pulls and
builds images, so give it a few minutes; run `make logs` to follow progress.

### 🔑 GitHub OAuth (required to sign in)

Astral authenticates entirely through GitHub — there is no password login, so
you need a GitHub OAuth app to get past the login screen:

1. Create one at **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Homepage URL** to `http://localhost:8080` and **Authorization
   callback URL** to `http://localhost:8080/auth/github/callback`.
3. Add the credentials to `.env`:

   ```bash
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   GITHUB_CLIENT_CALLBACK_URL=http://localhost:8080/auth/github/callback
   ```

(If you change `APP_PORT`, update these URLs to match.)

### 💚 Sponsor-gating (off by default)

Astral can gate power-user features (unlimited tags, notes, and smart filters)
behind a GitHub sponsorship — a holdover from the hosted service. It ships
**off** (`CHECK_FOR_SPONSORSHIP=false`), so on a personal instance every account
gets everything with no sponsorship check at login.

Only turn it on if you run a public, multi-user instance and want those features
gated behind sponsoring you: set `CHECK_FOR_SPONSORSHIP=true` and point
`GITHUB_SPONSOREE_LOGIN` at your own GitHub login.

### 🌐 Services

- App: http://localhost:8080
- Vite dev server: http://localhost:5173

### 🔌 Ports & conflicts

Published ports are fixed bindings — Docker does **not** auto-pick a free port,
so if one is already taken, `make up` fails with `address already in use`. You
don't need to stop your other containers; just remap the conflicting port in
`.env` (no compose edits required):

| Service   | Variable             | Default | Exposed in |
| --------- | -------------------- | ------- | ---------- |
| App (web) | `APP_PORT`           | `8080`  | dev + prod |
| Vite      | `VITE_PORT`          | `5173`  | dev        |
| MySQL     | `FORWARD_DB_PORT`    | `3306`  | dev        |
| Redis     | `FORWARD_REDIS_PORT` | `6379`  | dev        |

For example, set `APP_PORT=8090` then run `make up`. These affect only the
**host-side** port — containers still reach each other internally on the default
ports, so remapping `FORWARD_DB_PORT` just changes how you'd connect a GUI
client from your machine.

To connect a database client in dev: host `127.0.0.1`, port `FORWARD_DB_PORT`
(default `3306`), database `astral`, user `astral`, password `secret`.

### ⚡ Useful commands

```bash
make help                  # List all available targets
make logs                  # Tail logs for the stack
make ps                    # Show running containers
make shell                 # Open a shell in the app container
make artisan cmd="about"   # Run a one-off artisan command
make migrate               # Run database migrations
make seed                  # Run database seeders
make test                  # Run the test suite
make restart               # Restart the stack
make down                  # Stop the stack
```

To wipe the database and caches and start completely fresh, tear the stack down
along with its volumes:

```bash
docker compose -f compose.yml -f compose.dev.yml down -v
```

### 🗃️ SQLite mode

For a lighter local stack without MySQL:

```bash
make setup-sqlite
```

In SQLite mode the MySQL service is disabled and the app uses
`storage/database.sqlite`. Redis, the queue worker, and the scheduler still run.
Use the `-sqlite` variants of the make targets (e.g. `make migrate-sqlite`,
`make logs-sqlite`, `make shell-sqlite`).

In dev, `storage/` is bind-mounted from the host, so the database file lives at
`storage/database.sqlite` on your machine (gitignored). Point any SQLite GUI
client — [TablePlus](https://tableplus.com),
[DB Browser for SQLite](https://sqlitebrowser.org), or
[DBeaver](https://dbeaver.io) — at that file; edits sync straight to the running
app. (In production SQLite mode there's no host mount, so the file is persisted
in the `app-storage` volume instead.)

## 🤖 AI tooling (Claude Code & Codex)

This repo is set up for [Laravel Boost](https://github.com/laravel/boost)-powered
AI assistance with **Claude Code** and **Codex** out of the box.

**Committed vs. generated.** To keep the repo clean, Boost's generated files
(`CLAUDE.md`, `AGENTS.md`, and the per-agent skill copies) are gitignored and
regenerated locally. Only the _sources_ are committed: agent/skill selection in
`boost.json`, custom guidelines in `.ai/guidelines/`, custom skills in
`.ai/skills/`, and the MCP config (`.mcp.json`, `.codex/config.toml`).

**First-time setup.** With the dev stack running, generate the guidelines and
skills for your agents:

```bash
make boost
```

This runs `php artisan boost:update` in the app container and writes `CLAUDE.md`,
`AGENTS.md`, and the skill files locally. Re-run it after pulling dependency
changes (e.g. a framework bump) so the guidelines stay in sync. Don't commit the
generated files.

**MCP server.** The Laravel Boost MCP server is pre-wired for both agents via the
committed `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex). It runs
inside the app container, so **the dev stack must be up** for the MCP tools to
connect.

**Personal tooling.** Editor settings and personal agent skills (the `impeccable`
design skill, `.claude/launch.json`, etc.) are intentionally gitignored and not
part of the repo — only the shared `.claude/settings.json` is committed.

## 🏠 Self-Hosting

The production stack lives in `compose.yml` and builds two images: the PHP-FPM
app image (also used for the `queue` and `scheduler` workers) and a
self-contained nginx `web` image with the compiled frontend assets baked in — so
it deploys from a bare clone with no host build step or source mounts.

```bash
make prod-up        # Build and start the production stack
make prod-migrate   # Run migrations (after each deploy)
```

Production baseline in `.env`:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain`
- A strong `APP_KEY` — generate one with
  `docker compose -f compose.yml run --rm app php artisan key:generate --show`
  and paste it into `.env`
- Point your GitHub OAuth app's callback URL at
  `https://your-domain/auth/github/callback` and set the matching `GITHUB_*` vars
- Terminate HTTPS at your reverse proxy / load balancer
- Back up the MySQL data and the `app-storage` volume

The `queue` and `scheduler` workers run automatically as part of the stack,
both using the app image. The bundled Redis backs cache, sessions, and the
queue by default. Unlike dev, the production stack does not expose the MySQL or
Redis ports to the host.

### 🪶 SQLite (self-host)

```bash
make prod-up-sqlite
make prod-migrate-sqlite
```

- The SQLite database lives at `storage/database.sqlite` inside the
  `app-storage` volume — include that volume in your backup strategy.
- SQLite is great for small-to-medium installs; move to MySQL when you need
  heavier concurrent writes.

## 🧩 Browser Extension

[**Astral for GitHub**](https://github.com/astralapp/astral-browser-extension) is
a companion browser extension that lets you view and manage a repository's Astral
tags **inline on GitHub.com**. It adds a **Tags** button to the repo header (next
to Star / Watch / Fork); clicking it opens a popover to view the repo's tags, add
or remove existing ones with autocomplete, and create new tags on the fly. Built
with [WXT](https://wxt.dev) + Vue 3 + Tailwind CSS v4 — Chromium-first (Chrome,
Edge, Brave, Arc), with Firefox as a follow-up.

It talks to Astral's token-authed JSON API (`/api/v1/...`) using a Sanctum
personal access token you generate in Astral's settings, so your self-hosted
instance already has everything the extension needs.

- **Install:** _coming soon to the Chrome Web Store_ — [placeholder](https://chromewebstore.google.com/)
- **Source & dev setup:** [astralapp/astral-browser-extension](https://github.com/astralapp/astral-browser-extension)

## 📜 License

Astral is open source under the [GNU Affero General Public License v3.0](LICENSE)
(AGPL-3.0-or-later). You're free to self-host, modify, and redistribute it. If
you run a modified version as a network service, AGPL §13 requires you to offer
your users the corresponding source of your modifications.
