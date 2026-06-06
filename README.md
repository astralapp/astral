<h1 align="center">Astral</h1>

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
`storage/database.sqlite` (persisted in the `app-storage` volume). Redis, the
queue worker, and the scheduler still run. Use the `-sqlite` variants of the
make targets (e.g. `make migrate-sqlite`, `make logs-sqlite`, `make shell-sqlite`).

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

### 📨 Mail

Local development uses the `log` mailer, so outgoing mail is written to
`storage/logs` instead of being sent. For production, configure the `MAIL_*`
variables in `.env`.
