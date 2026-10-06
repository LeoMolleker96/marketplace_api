# Marketplace API

Backend for the Flutter marketplace app (`../marketplace_app`). Node.js + TypeScript, hexagonal architecture.

> Why things are built the way they are: see [DECISIONS.md](DECISIONS.md).

## Prerequisites

- Node.js **v26** or newer and npm **11** or newer
- **Docker Desktop** (for the PostgreSQL database). Install it from <https://www.docker.com/products/docker-desktop> with the **WSL 2** option enabled, then start it.

```bash
node -v
npm -v
docker --version
docker compose version
```

> **Windows PowerShell:** if `npm` fails with *"running scripts is disabled on this system"*, either use `npm.cmd` instead of `npm` (e.g. `npm.cmd run dev`), or allow local scripts for your user once (then reopen the terminal):
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

## Install

```bash
npm install
```

## Environment variables

Create a `.env` file in the project root (it is git-ignored, never commit it) with:

| Variable | Example | Used for |
| --- | --- | --- |
| `POSTGRES_USER` | `marketplace` | Database user created by Docker |
| `POSTGRES_PASSWORD` | *(choose one)* | That user's password |
| `POSTGRES_DB` | `marketplace` | Database name created by Docker |
| `DATABASE_URL` | `postgresql://marketplace:<password>@localhost:5432/marketplace` | How the API connects to the database. Must match the three values above. |
| `JWT_SECRET` | *(a random string of 32+ characters)* | Signs login tokens. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` |

The app refuses to start if `DATABASE_URL` or `JWT_SECRET` is missing.

## Database (PostgreSQL in Docker)

Start the database (in the background):

```bash
docker compose up -d
```

Check that it is running:

```bash
docker compose ps
```

Create or update the tables (apply the migrations in `drizzle/`). Run this after the first start and whenever new migrations are added:

```bash
npm run db:migrate
```

Run the tests that need the database (the normal `npm test` skips them):

```bash
npm run test:db
```

Open a SQL prompt inside it (`\dt` lists tables, `\q` quits):

```bash
docker compose exec db psql -U marketplace -d marketplace
```

| Command | What it does |
| --- | --- |
| `docker compose up -d` | Start the database |
| `docker compose stop` | Stop it (data is kept) |
| `docker compose down` | Remove the container (data is kept in the volume) |
| `docker compose down -v` | Remove everything **including all data** (clean reset) |
| `docker compose logs db` | Show the database logs |

## Run

**Development** (auto-restarts when you save a file):

```bash
npm run dev
```

**Production** (compile to JavaScript, then run it):

```bash
npm run build
npm start
```

The server listens on <http://localhost:3000>.

## Verify it works

```bash
curl -i http://localhost:3000/health
```

Expected: `HTTP/1.1 200 OK` with body `{"status":"ok"}`. Any other path returns `404`.

Sign up and log in. Both need the database running and migrated (see "Database" above). Send the body as JSON, with the `Content-Type` header.

Create an account:

```bash
curl -i -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d '{"email":"ana@example.com","password":"secret123"}'
```

Log in:

```bash
curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"ana@example.com","password":"secret123"}'
```

| Request | Response |
| --- | --- |
| Signup with a new email | `201` with `{"token":"eyJ..."}` (a JWT valid for 1 hour) |
| Signup with an email that already exists | `409` with `{"error":"Email is already registered"}` |
| Login with the right email + password | `200` with `{"token":"eyJ..."}` (a JWT valid for 1 hour) |
| Login with an unknown email or wrong password | `401` with `{"error":"Invalid email or password"}` |
| Missing/invalid email or missing password | `400` with e.g. `{"error":"Email is required"}` |
| Malformed JSON | `400` with `{"error":"Bad Request"}` |

> From the Flutter app on an **Android emulator**, `localhost` is the emulator itself. Use `http://10.0.2.2:3000` to reach your computer. On the iOS simulator, `localhost` works.

## Check the code (run after every change)

```bash
npm run check
```

This runs type checking, lint, and tests, and stops at the first failure.

## All scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run `src/index.ts` with auto-restart on save (loads `.env`) |
| `npm run build` | Compile `src/` (TypeScript) to `dist/` (JavaScript) |
| `npm start` | Run the compiled build (`dist/index.js`), loading `.env` if it exists |
| `npm run typecheck` | Check types without producing files |
| `npm run lint` | Find code problems with ESLint |
| `npm run lint:fix` | Fix the lint problems that can be fixed automatically |
| `npm test` | Run all tests (`src/**/*.test.ts`), skipping the ones that need the database |
| `npm run test:db` | Run all tests, including the database ones (needs the database running) |
| `npm run check` | `typecheck` + `lint` + `test` |
| `npm run db:generate` | After changing `schema.ts`: write a new SQL migration in `drizzle/` |
| `npm run db:migrate` | Apply pending migrations to the database |

## Keeping dependencies safe

```bash
npm audit
npm outdated
```

`npm outdated` lists TypeScript as outdated on purpose: it is pinned to 6.0.x (see [DECISIONS.md, D-009](DECISIONS.md#d-009-typescript-pinned-to-60x)).
