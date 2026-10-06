# Decisions & Learning Log

This file records **every decision** made in this project and **why**, so it doubles as a study guide. `README.md` only explains how to run the project; everything else lives here.

Each entry follows the same shape:

- **Context**: the situation or problem.
- **Decision**: what we chose.
- **Why**: the reasoning.
- **Alternatives**: what else we could have done.
- **Concepts**: what to learn from it.

When a decision changes, the old entry is not deleted. It is marked *Superseded by D-xxx* so the history stays readable.

## Index

| ID | Decision | Date |
| --- | --- | --- |
| [D-001](#d-001-learning-goals-and-the-no-framework-rule) | Learning goals and the "no framework" rule | 2026-10-05 |
| [D-002](#d-002-nodejs--typescript) | Node.js + TypeScript | 2026-10-05 |
| [D-003](#d-003-es-modules) | ES modules (`"type": "module"`) | 2026-10-05 |
| [D-004](#d-004-typescript-configuration) | TypeScript configuration | 2026-10-05 |
| [D-005](#d-005-tsx-for-development) | `tsx` for development | 2026-10-05 |
| [D-006](#d-006-first-http-server-with-nodehttp) | First HTTP server with `node:http` (*superseded by D-015*) | 2026-10-05 |
| [D-007](#d-007-hexagonal-architecture-ports--adapters) | Hexagonal architecture (Ports & Adapters) | 2026-10-05 |
| [D-008](#d-008-linting-with-eslint--typescript-eslint) | Linting with ESLint + typescript-eslint | 2026-10-05 |
| [D-009](#d-009-typescript-pinned-to-60x) | TypeScript pinned to 6.0.x | 2026-10-05 |
| [D-010](#d-010-testing-with-nodetest) | Testing with `node:test` | 2026-10-05 |
| [D-011](#d-011-npm-run-check-after-every-change) | `npm run check` after every change | 2026-10-05 |
| [D-012](#d-012-package-safety-policy) | Package safety policy | 2026-10-05 |
| [D-013](#d-013-git-ignore-and-secrets) | Git ignore and secrets | 2026-10-05 |
| [D-014](#d-014-documentation-split-readme-vs-decisions) | Documentation split: README vs DECISIONS | 2026-10-05 |
| [D-015](#d-015-express-for-the-http-layer) | Express for the HTTP layer | 2026-10-05 |
| [D-016](#d-016-login-route-post-authlogin) | Login route: `POST /auth/login` | 2026-10-05 |
| [D-017](#d-017-createapp-the-first-http-adapter) | `createApp()`: the first HTTP adapter | 2026-10-05 |
| [D-018](#d-018-login-request-dto-and-validation) | Login request DTO and validation | 2026-10-05 |
| [D-019](#d-019-kiss-keep-it-simple) | KISS: Keep It Simple | 2026-10-05 |
| [D-020](#d-020-drizzle-orm-for-postgresql) | Drizzle ORM for PostgreSQL | 2026-10-05 |
| [D-021](#d-021-local-postgresql-with-docker-compose) | Local PostgreSQL with Docker Compose | 2026-10-05 |
| [D-022](#d-022-user-entity) | `User` entity | 2026-10-05 |
| [D-023](#d-023-userrepository-port-and-drizzle-adapter) | `UserRepository` port and Drizzle adapter | 2026-10-05 |
| [D-024](#d-024-password-hashing-with-argon2id) | Password hashing with Argon2id | 2026-10-05 |
| [D-025](#d-025-feature-first-folder-structure) | Feature-first folder structure | 2026-10-05 |
| [D-026](#d-026-login-use-case-and-jwt-tokens) | Login use case and JWT tokens | 2026-10-05 |
| [D-027](#d-027-signup) | Signup | 2026-10-05 |

---

## D-001: Learning goals and the "no framework" rule

**Context.** This API exists to learn backend development (Node.js + TypeScript) while building a real backend for a Flutter app (where Riverpod is being learned).

**Decision.**
- No architecture-dictating frameworks (NestJS, AdonisJS, LoopBack...).
- Focused, real-world libraries **are allowed** (validation, logging, database, auth...). Each one is proposed first, with the reason and alternatives, and recorded here.

**Why.** Frameworks like NestJS decide the architecture for you (modules, decorators, DI container). That is productive, but it hides *why* things are structured the way they are. Building the architecture by hand teaches the concepts; using real libraries for solved problems (e.g. password hashing) teaches what professional projects actually use.

**Alternatives.** NestJS (fast to build, hides the architecture). Zero dependencies (very educational, but you would re-invent solved problems like validation and hashing, often insecurely).

**Concepts.** Framework vs library: *you call a library; a framework calls you* (inversion of control).

---

## D-002: Node.js + TypeScript

**Context.** We need a runtime and a language.

**Decision.** Node.js v26 with npm 11. TypeScript with `strict` mode.

**Why.** Node runs JavaScript on the server. TypeScript adds static types: many bugs (typos, `undefined` values, wrong arguments) are caught *before* running the code. TypeScript is only a development tool. It compiles to plain JavaScript, which is what Node runs.

**Setup steps (how it was created).**

```bash
mkdir marketplace_api && cd marketplace_api && mkdir src
npm init -y                               # creates package.json
npm install -D typescript @types/node tsx # dev dependencies
```

| Package | Why |
| --- | --- |
| `typescript` | The compiler (`tsc`). Checks types and turns `.ts` into `.js`. |
| `@types/node` | Type definitions for Node's built-in modules (`node:http`, `node:fs`, ...). |
| `tsx` | Runs `.ts` files directly, with watch mode. Development only. |

`-D` means *dev dependency*: needed while developing, not at runtime in production.

**Concepts.** `package.json` (project metadata, scripts, dependencies), `package-lock.json` (the exact installed versions, always committed), dev vs runtime dependencies.

---

## D-003: ES modules

**Context.** Node supports two module systems: **CommonJS** (`require` / `module.exports`, the old one) and **ES modules** (`import` / `export`, the JavaScript standard). `npm init` created `"type": "commonjs"`.

**Decision.** `"type": "module"` in `package.json`, plus `"module": "NodeNext"` in `tsconfig.json`.

**Why.** ES modules are the standard, and modern packages and docs use them. With `commonjs`, TypeScript was silently compiling our `import` statements into `require` calls.

**Consequence to remember.** Local imports must include the **`.js`** extension, even though the file on disk is `.ts`:

```ts
import { Product } from "./product.js"; // correct
import { Product } from "./product";    // error with NodeNext
```

This is because Node (not TypeScript) resolves the import at runtime, and at runtime the file *is* `product.js`.

**Alternatives.** CommonJS (legacy; still common in older codebases).

**Concepts.** Module systems, module resolution.

---

## D-004: TypeScript configuration

**Decision.** `tsconfig.json`:

| Option | Meaning / why |
| --- | --- |
| `target: ES2022` | JavaScript version to emit. Modern Node supports it natively. |
| `module` / `moduleResolution: NodeNext` | Follow Node's real module rules (see D-003). |
| `rootDir: src` / `outDir: dist` | Read from `src/`, write compiled JS to `dist/`. |
| `sourceMap: true` | Generates `.js.map` files so error stack traces from `dist/` point to the original `.ts` lines. |
| `strict: true` | Turns on all strict checks (e.g. `null`/`undefined` must be handled). |
| `noUncheckedIndexedAccess` | `array[0]` is typed `T \| undefined`, because the index might not exist. Prevents a very common crash. |
| `noImplicitOverride` | Overriding a parent method requires the `override` keyword, so renames in a parent class can't silently break children. |
| `noFallthroughCasesInSwitch` | Forgetting `break`/`return` in a `switch` case is an error. |
| `verbatimModuleSyntax` | Type-only imports must be written `import type { X }`. They are removed from the output, and tools like `tsx` (which compile file-by-file) never get confused about what is a type and what is a value. |
| `esModuleInterop` | Smoother imports of older CommonJS packages. |
| `skipLibCheck` | Don't type-check `.d.ts` files in `node_modules` (faster). |
| `types: ["node"]` | Include Node's type definitions. |
| `include: ["src"]` | Only compile files in `src/`. |

**Concepts.** The compiler is configurable: stricter settings = more bugs caught at compile time.

---

## D-005: `tsx` for development

**Decision.** `npm run dev` runs `tsx watch src/index.ts`. Production uses `npm run build` (`tsc -p tsconfig.build.json`) + `npm start` (`node dist/index.js`).

**Why.** `tsx` runs TypeScript directly and restarts on save, which keeps the feedback loop fast. It only *strips* types (it does not check them), which is why we also run `npm run typecheck`. In production, Node runs the plain compiled JavaScript, and TypeScript is not involved at all.

**Alternatives.** Node's built-in type stripping (`node file.ts`) works in recent versions but does not support every TS feature. `ts-node` is older and slower.

---

## D-006: First HTTP server with `node:http`

> **Superseded by [D-015](#d-015-express-for-the-http-layer).** Kept because the concepts below still apply: Express runs on top of `node:http`.

**Context.** First step: a server that answers a health check.

**Decision.** `src/index.ts` uses Node's built-in `node:http`, with routing done by hand. `GET /health` returns `{"status":"ok"}`, and anything else returns `404`.

**Concepts shown.**
- **`node:http`**: Node's built-in HTTP module. Express, Fastify and others are built on top of it.
- **`createServer(callback)`**: the callback runs once for **every** request.
- **`req`** (request): method (`GET`, `POST`...), URL, headers, body (a *stream*).
- **`res`** (response): status code, headers, body.
- **Status codes**: `200` OK, `404` Not Found.
- **`Content-Type: application/json`**: tells the client how to parse the body (Flutter's `jsonDecode` expects JSON).
- **Routing by hand**: the `if` checks on method + URL are the simplest router.

**Note.** Node types `req.method` and `req.url` as `string | undefined`, because the same class is used for client responses. The linter caught that we were logging them without handling `undefined` (see D-008).

**Open decision (resolved in D-015).** Whether to keep `node:http` or adopt an HTTP library for the HTTP adapter.

---

## D-007: Hexagonal architecture (Ports & Adapters)

**Context.** We want to learn clean architecture: business rules that don't depend on HTTP, databases or libraries.

**Decision.** Hexagonal architecture. Dependencies point inward only: `adapters -> application -> domain`.

```
src/
├── domain/          # entities + value objects: pure business rules
├── application/
│   ├── ports/in/    # what the app offers (use case interfaces)
│   ├── ports/out/   # what the app needs (e.g. ProductRepository)
│   └── services/    # use cases; depend only on ports
├── adapters/
│   ├── in/http/     # driving adapters: HTTP -> use cases
│   └── out/persistence/ # driven adapters: implement "out" ports (DB, memory)
├── config/          # env vars
└── index.ts         # composition root: wires adapters to ports
```

**Why.**
- The business logic can be **tested without a server or a database**, using in-memory fakes of the ports.
- Infrastructure can be swapped (in-memory -> PostgreSQL, Express -> Fastify) without touching business rules.
- Each folder has one clear responsibility, which makes it easy to know where code goes.

**Alternatives.** Layered architecture (controller/service/repository, simpler but the service often depends on the DB directly). Feature folders (group by feature; can be combined with hexagonal later). Onion / Clean Architecture (Uncle Bob) are close relatives with the same "dependencies point inward" idea.

**Concepts.** Dependency inversion (depend on interfaces, not implementations), ports (interfaces), adapters (implementations), composition root, constructor injection.

**Status.** The layers are kept, but the folder layout is now **feature-first** (D-025): this tree lives inside each `src/features/<feature>/`.

---

## D-008: Linting with ESLint + typescript-eslint

**Context.** The TypeScript compiler checks *types*, but not patterns like "you forgot to `await` this promise" or "you're putting `undefined` in a string".

**Decision.** ESLint 10 + `typescript-eslint` 8, configured in `eslint.config.js` (ESLint's "flat config" format):

| Config block | Why |
| --- | --- |
| `eslint.configs.recommended` | ESLint's core recommended rules. |
| `tseslint.configs.strictTypeChecked` | The strictest typescript-eslint preset. "TypeChecked" means rules use type information from `tsconfig.json`, so they can detect floating promises, unsafe `any`, unnecessary conditions, etc. |
| `tseslint.configs.stylisticTypeChecked` | Consistent style (e.g. prefer `??` over `\|\|` for defaults). |
| `projectService: true` | Lets ESLint find the right `tsconfig.json` for each file. |
| `disableTypeChecked` for `*.js` | Config files like `eslint.config.js` aren't in `tsconfig.json`, so type-aware rules can't run on them. |

Custom rules (for `src/**/*.ts`), enforcing conventions from `CLAUDE.md`:

| Rule | Why |
| --- | --- |
| `restrict-template-expressions` with `allowNumber: true` | The strict preset forbids numbers in template strings, which is overly strict (`` `port ${PORT}` `` is fine). `undefined`, objects, etc. are still rejected. |
| `explicit-module-boundary-types` | Exported functions must declare their return type. This makes the public API explicit and makes errors show up where the function is written. |
| `no-restricted-exports` (default exports) | Named exports only: consistent names across files, better auto-import and refactoring. |
| `no-restricted-imports` (`node:` prefix) | `import "node:http"`, not `"http"`. It makes clear it's a built-in, and a malicious npm package called `http` can never be picked up instead. |
| `no-floating-promises` with `allowForKnownSafeCalls` for `node:test` | In `node:test`, `describe`/`it` return promises that the runner tracks itself, so the rule would flag every test. This official option exempts only those four functions. Every other un-awaited promise is still an error, which is better than disabling the rule in test files. |

The first lint run immediately found a real issue in `src/index.ts`: logging `req.method`/`req.url` without handling `undefined`.

**Alternatives.** Oxlint (very fast, supports TS 7, fewer rules, less common). Biome (linter + formatter in one, fewer type-aware rules). We chose ESLint because it is the industry standard.

**Concepts.** Static analysis, type-aware linting.

---

## D-009: TypeScript pinned to 6.0.x

**Context.** TypeScript 7 (a rewrite of the compiler in Go, about 10x faster) was installed. `typescript-eslint` 8.71 only supports `typescript >=4.8.4 <6.1.0`, because it uses the old compiler's JavaScript API, which TS 7 doesn't provide yet.

**Decision.** `"typescript": "~6.0.3"`. The `~` allows patch updates (6.0.4) but not 6.1, which the linter wouldn't support yet.

**Why.** Type-aware linting (D-008) is worth more for learning than compile speed on a small project. TS 6 and 7 accept the same language, so nothing we write changes. `npm outdated` will show TypeScript as outdated. That is intentional.

**Revisit when.** `npm view typescript-eslint peerDependencies` allows TypeScript 7.

**Alternatives.** Keep TS 7 and use Oxlint + `oxlint-tsgolint` for type-aware linting.

---

## D-010: Testing with `node:test`

**Decision.** Node's built-in test runner (`node:test` + `node:assert/strict`), run through `tsx` so it understands TypeScript: `npm test` = `tsx --test "src/**/*.test.ts"`. Test files live next to the code (`x.ts` -> `x.test.ts`).

**Why.** It ships with Node (no extra dependency) and has everything we need: `describe`/`it`, hooks, mocks, and coverage. Learning it also makes Jest/Vitest easy to pick up later (they share the same ideas).

**Test strategy per layer** (where hexagonal architecture pays off):
- Domain: plain unit tests.
- Application services: test with hand-written in-memory fakes of the "out" ports, so no database is needed.
- Adapters: test against the real thing where cheap (real HTTP server on a random port, real in-memory/SQLite repository).

**Alternatives.** Vitest (popular, fast, nice output; an extra dependency). Jest (very common, but slower and awkward with ES modules).

**Status.** First tests added with D-017 and D-018.

**Tests are not shipped.** `npm run build` uses `tsconfig.build.json`, which extends `tsconfig.json` and excludes `*.test.ts`, so `dist/` contains only production code. `tsconfig.json` still includes tests, so `typecheck` and `lint` cover them too.

---

## D-011: `npm run check` after every change

**Decision.** `npm run check` runs `typecheck`, then `lint`, then `test`, and stops at the first failure. It is run after every iteration, and the results are reported.

**Why.** A fast, single command that answers "is the project healthy?" makes it a habit, and it is exactly what a CI pipeline (e.g. GitHub Actions) would run on every push.

---

## D-012: Package safety policy

**Decision.**
- Before adding a package: check maintenance (recent releases), popularity, license, known vulnerabilities, TypeScript types. Propose it with alternatives before installing.
- Install the latest stable version. After every install, run `npm audit` and `npm outdated`.
- Never `npm audit fix --force` without understanding it (it may install breaking major versions).
- Remove unused packages (`npm uninstall`, `npm prune`).

**What happened on 2026-10-05.**
- `node_modules` contained about 100 *extraneous* packages (installed but not listed in `package.json`, e.g. express, vitest, argon2, pino, drizzle), probably left over from an earlier experiment. `npm prune` removed them. Extraneous packages are dangerous because code could import them "by accident" and it would work locally but break on a fresh `npm install`.
- Upgraded/installed: `eslint@10.12.0`, `@eslint/js@10.0.1`, `typescript-eslint@8.71.0`, `typescript@6.0.3` (see D-009). `@types/node@26.6.4` and `tsx@4.23.15` were already the latest.
- `npm audit`: **0 vulnerabilities**.
- npm 11 **blocks dependency install scripts** unless approved (`allowScripts`). It blocked `esbuild`'s `postinstall` (esbuild is used by `tsx`). We left it blocked: `tsx` works without it because esbuild's binary comes from a platform-specific package (`@esbuild/win32-x64`). Install scripts run arbitrary code on your machine, and they are a common way supply-chain attacks spread, so blocking by default is a good safety net.

**Concepts.** Supply-chain security, semver ranges (`^1.2.3` allows minor+patch updates, `~1.2.3` allows patch only), lockfiles.

---

## D-013: Git ignore and secrets

**Decision.** `.gitignore` excludes `node_modules/`, `dist/`, `.env` and `.env.*` (but allows `.env.example`), logs, coverage, local database files, and editor files.

**Why.** `node_modules` and `dist` are generated (`npm install`, `npm run build`). `.env` holds secrets (DB passwords, JWT keys) and must **never** be committed. Once a secret is in git history, consider it leaked and rotate it.

---

## D-014: Documentation split: README vs DECISIONS

**Decision.**
- `README.md`: only how to install, run and verify the project.
- `DECISIONS.md` (this file): every decision, explanation and concept.
- `CLAUDE.md`: the rules for the AI assistant working on this project.
- Code: TSDoc on every export; short "why" comments inline.

**Why.** A README is read by someone who wants to *run* the project. Mixing a long history into it hides the essential commands. This file can then grow freely as a study guide.

---

## D-015: Express for the HTTP layer

**Context.** With `node:http` we would have to write routing, JSON body parsing, URL parameters (`/products/:id`) and error handling ourselves. Supersedes D-006.

**Decision.** Use **Express 5** (`express@5.2.1`, runtime dependency) with **`@types/express`** (dev dependency, because Express is written in JavaScript and its types are maintained separately by the community in DefinitelyTyped).

**Why.**
- It is the most widely used Node.js HTTP library, so most tutorials, jobs and existing codebases use it.
- It is a *library-like* framework: it handles HTTP and routing but does **not** dictate the architecture, so it fits D-001 (unlike NestJS).
- Express 5 (unlike 4) catches errors thrown in `async` route handlers automatically and passes them to the error middleware.
- Checked on install: MIT license, actively maintained (released this month), `npm audit` 0 vulnerabilities, no install scripts.

**How it is used (in `src/index.ts`, same behavior as before).**

| Piece | Concept |
| --- | --- |
| `express()` | Creates the app: an ordered list of **middleware**. |
| `app.disable("x-powered-by")` | Security: don't advertise which library we run. |
| Logging middleware `(req, res, next)` | A middleware does something, then calls `next()` to pass the request on. |
| `app.get("/health", ...)` | A route: middleware that only runs for a given method + path. |
| 404 middleware (at the end) | Runs only if no route responded. Returns JSON instead of Express's default HTML page. |
| Error middleware `(err, req, res, next)` | Express recognizes it by its **4 parameters**. It logs the error server-side and returns a generic 500, because Express's default handler would send the stack trace to the client in development. |

**Order matters.** Middleware runs in registration order, so the 404 handler must come after all routes, and the error handler goes last.

**Alternatives.**
- `node:http` alone (D-006): very educational, but means re-inventing routing and body parsing.
- **Fastify**: faster, with built-in JSON schema validation and first-class TypeScript. Less common than Express.
- **Hono**: modern, small, runs on many runtimes (Node, Bun, edge). Newer, smaller ecosystem.

**Architecture rule.** Express is infrastructure. It may appear only in HTTP adapters (`adapters/in/http`) and the composition root (`index.ts`), never in `domain/` or `application/`. Route handlers should only translate HTTP <-> use cases.

**Status.** The Express app moved to `src/adapters/in/http/create-app.ts` and is tested (see D-017).

---

## D-016: Login route: `POST /auth/login`

**Context.** The Flutter app needs a login endpoint. Only the route was requested, with no login logic yet.

**Decision.** `POST /auth/login` in `src/index.ts`, answering **`501 Not Implemented`** with `{"error":"Not implemented"}`.

**Why.**
- **POST, not GET**: credentials go in the request *body*. A GET would put them in the URL, and URLs are stored in server logs, proxies and browser history.
- **`/auth/` prefix**: groups authentication routes (later: register, logout, refresh token) under one path.
- **501**: the honest status for "this endpoint exists but has no implementation". Returning `200` with fake data would hide that it isn't built.

**Concepts.** HTTP methods and their meaning, status codes. A `GET /auth/login` returns `404` because Express matches on method **and** path.

**Status.** Done: the route now runs the login use case and returns a token (D-026). The notes below are history.

**Pending (placeholder).** Reading and validating the body is done (D-018). Real login still needs a `User` entity, a login use case, a user repository port, password hashing, and issuing a token. Until then, a valid body still gets `501`.

---

## D-017: `createApp()`: the first HTTP adapter

**Context.** `src/index.ts` built the Express app *and* started listening on port 3000 as soon as it was imported. A test can't import it without starting a real server on a fixed port.

**Decision.**
- `src/adapters/in/http/create-app.ts` exports `createApp()`, which **builds** the Express app (middleware, routes, 404, error handler) and returns it without listening.
- `src/index.ts` (the composition root) only calls `createApp()` and `listen(PORT)`.
- `src/adapters/in/http/create-app.test.ts` tests the app through real HTTP.

**Why.** Separating *building* from *starting* is what makes the app testable. It's also the first real hexagonal piece: a **driving (inbound) adapter**, which translates HTTP into calls into the application.

**How the adapter is tested.** Each test calls `withServer()`:
1. `createApp().listen(0, "127.0.0.1")`: port **0** asks the OS for any free port, so tests never collide with each other or with `npm run dev`.
2. Real requests are sent with `fetch` (built into Node).
3. The server is always closed in `finally`, even if the test fails.

Each test gets its own server, so tests share no state. Faking `req`/`res` objects would be faster, but would not prove what the Flutter app actually receives (status, headers, JSON).

**Also changed.**
- **Startup errors:** in Express 5, `app.listen(port, callback)` passes startup errors (e.g. port already in use) to the callback. `index.ts` now re-throws them so the process crashes visibly instead of running without serving anything.
- **Client errors:** the error handler now answers client errors with their own status instead of 500, for example malformed JSON -> `400 {"error":"Bad Request"}` and body too large -> `413 {"error":"Payload Too Large"}`. Only the standard status name is sent (`STATUS_CODES` from `node:http`), never the parser's internal message.

**Alternatives.** `supertest` (popular library for testing Express apps without managing ports). We don't need it: `listen(0)` + `fetch` is a few lines and has no dependency.

**Concepts.** Composition root, driving adapter, testing with a real server, ephemeral ports.

---

## D-018: Login request DTO and validation

**Context.** `POST /auth/login` must read a JSON body containing an email and a plain-text password.

**Decision.**
- `express.json()` middleware parses JSON bodies (only when `Content-Type: application/json`).
- `src/adapters/in/http/login-request.dto.ts` defines the class `LoginRequestDto { email, password }`. Its **constructor checks the fields** and throws a `ValidationError` on the first problem.
- `src/adapters/in/http/validation-error.ts` defines `ValidationError`, a custom error class for invalid client data.
- The route just does `new LoginRequestDto(req.body)`. If it throws, Express passes the error to the error handler, which answers `400 { "error": "<message>" }`.

**Why a constructor?** The object can only exist if it is valid. Once you have a `LoginRequestDto`, you never need to check it again, and its fields are `readonly` so they can't be changed into something invalid later.

**Why a custom error class?** The error handler must tell *bad input* (the client's fault, `400`) apart from *bugs* (our fault, `500`). `err instanceof ValidationError` makes that distinction. Any other error still becomes a generic `500`. The same class can be reused by future DTOs.

**Do we need a DTO? Yes.** The DTO is the contract between the Flutter app and the API: it states exactly what the login route accepts. It lives in the HTTP adapter because it is an HTTP concern. When the login use case exists, the handler will pass the email and password to it, so the business logic never depends on the HTTP request.

**Validation rules (only the ones the owner asked for).**

| Check | Message |
| --- | --- |
| body is not an object (e.g. missing, or sent without `Content-Type: application/json`) | `Body must be a JSON object` |
| `email` missing, empty, or not a string | `Email is required` |
| `email` doesn't match `x@y.z` (no spaces) | `Email must be valid` |
| `password` missing, empty, or not a string | `Password is required` |

**Kept simple on purpose.** A first version returned typed result objects (`ParseResult`), listed every issue at once, trimmed the email, and had max lengths. The owner asked for simpler, readable code, so that was removed. The rule is to add checks only when they are asked for.

**Concepts.** DTOs, validating input at the boundary, treating client data as `unknown` until it is checked.

**Alternatives.** A validation library like **zod**. It could be proposed later if there are many DTOs.

---

## D-019: KISS: Keep It Simple

**Context.** The first login validation used a generic `ParseResult<T>` type, a `FieldResult` type, and several helper functions. It worked, but it was hard to read for what it did.

**Decision.** KISS is the guiding principle of the project (see `CLAUDE.md`). Code must be simple to read: direct code, plain types, and no helpers unless they are reused or clearly improve readability. Simple doesn't mean careless: correctness, security, performance and best practices still apply.

**Why.** Code is read far more often than it is written. When learning, every extra abstraction is one more thing to understand before you see what the code actually does. Complexity should be added only when a real need appears, not in advance (this is also called YAGNI: "You Aren't Gonna Need It").

**Example.** The login DTO went from about 100 lines with 2 custom types and 4 helpers to a class whose constructor does a handful of `if` + `throw` checks.

---

## D-020: Drizzle ORM for PostgreSQL

**Context.** The app needs a PostgreSQL database. We compared the options used in real projects (npm weekly downloads, October 2026):

| Package | Downloads/week | Typical use |
| --- | --- | --- |
| `pg` | 73M | The standard driver. Used directly, and underneath most of the others. |
| Drizzle | 31M | Fastest-growing choice for new TypeScript projects |
| Prisma | 22M | Very common ORM in TypeScript startups |
| Kysely | 23M | Type-safe query builder |
| TypeORM / Knex / Sequelize | 7M / 7M / 3M | Older and enterprise codebases (TypeORM is common with NestJS) |

**Decision.**
- `drizzle-orm@0.45.3`: the ORM. Tables are defined in TypeScript, and queries look like SQL.
- `pg@8.23.1`: the driver Drizzle uses to talk to PostgreSQL (the standard one, with a connection `Pool`).
- `drizzle-kit@0.31.11` (dev): the CLI for **migrations** (versioned SQL files that create or change tables).
- `@types/pg@8.23.1` (dev): TypeScript types for `pg`.

**Why.**
- Modern and widely used in new projects, so it's real-world.
- Its queries still look like SQL, so you still learn SQL.
- It fits hexagonal architecture: the schema and queries live only in `adapters/out/persistence`. The domain never imports Drizzle.

**Alternatives.**
- `pg` alone: most fundamental, but no type safety and no migrations.
- Prisma: very common, but it hides SQL behind its own schema language and generated code.
- Kysely: you have to write table types by hand.

**Trade-off.** Drizzle is still pre-1.0 (0.45), so breaking changes are possible between versions.

**Security note (pending owner decision).** `npm audit` reports **4 moderate** issues. They all come from one old esbuild (`0.18.20`), pulled in by `drizzle-kit` through `@esbuild-kit/esm-loader`, even in its latest stable version.
- The advisory (GHSA-67mh-4wv8-2f99) is about esbuild's **development web server**. drizzle-kit only uses esbuild to read TypeScript config files and never starts that server.
- It's a dev dependency, so it is never part of the production build.
- `npm audit fix --force` would *downgrade* drizzle-kit to 0.18.1. That is a breaking change, so we did **not** run it.

**Install scripts.** The esbuild install scripts stay blocked by npm (D-012). `drizzle-kit --version` works without them.

**Status.** Packages installed only: no schema, config, or connection code yet. PostgreSQL runs locally in Docker (D-021).

---

## D-021: Local PostgreSQL with Docker Compose

**Context.** Drizzle needs a running PostgreSQL server. We could run it locally (Docker or native install) or in the cloud (Neon, Supabase...).

**Decision.** For development, PostgreSQL 18 runs locally in Docker, defined in `docker-compose.yml`. A cloud database (Neon preferred over Supabase) will be used later for deployment.

**Why.**
- **Tests** need a database that can be wiped freely and that doesn't depend on the internet (rule in `CLAUDE.md`).
- **Speed:** a local database answers in about a millisecond, while a cloud one adds network latency to every query.
- **Works offline** and has no free-tier limits.
- **Real-world practice:** teams run the database locally with `docker compose up` and use a hosted database for staging and production.
- **Easy to switch:** the app connects through `DATABASE_URL`, so moving to the cloud is a `.env` change, not a code change.

**`docker-compose.yml` explained.**

| Line | Meaning |
| --- | --- |
| `image: postgres:18-alpine` | Official PostgreSQL 18 image on Alpine, a very small Linux base. |
| `environment: POSTGRES_USER: ${POSTGRES_USER}` ... | On the first start, the image creates this user, password and database. Compose reads the `${...}` values from `.env`, so no secrets are in the file. |
| `ports: "127.0.0.1:5432:5432"` | Maps port 5432 on your PC to 5432 in the container, which is why `DATABASE_URL` uses `localhost:5432`. `127.0.0.1` keeps other devices on your network out. |
| `volumes: postgres-data:/var/lib/postgresql` | Stores the data in a named Docker volume, so it survives restarts. PostgreSQL 18 images expect the volume at `/var/lib/postgresql` (older versions used `.../data`). |

**Concepts.** Image (a packaged program), container (a running image), port mapping, volume (persistent storage outside the container), Docker Compose (containers described in a file).

**Alternatives.**
- Native Windows installer: no Docker needed, but it runs as a permanent Windows service and is harder to reset.
- Neon / Supabase: nothing to install, but slower, needs the internet, and isn't suitable for tests.

**Note.** The user, password and database are only created on the **first** start, while the volume is empty. If you change them in `.env` later, run `docker compose down -v` (this deletes all data) and start again.

---

## D-022: `User` entity

**Context.** We're building the full login flow before connecting the database. The first piece is the domain: who logs in.

**Decision.** `src/domain/entities/user.ts`: a `User` class with `id`, `email` and `passwordHash`, all `readonly`. Only the fields login needs.

**Why.**
- **An entity** is a domain object with an **identity**: two users with the same email at different times are told apart by `id`. That's the difference from a value object like `Money`, which is defined only by its value.
- **It lives in `domain/`** and imports nothing: no Express, no Drizzle, no Node APIs. It's the center of the hexagon, and everything else depends on it, never the other way around.
- **`passwordHash`, never the password.** Hashing is one-way, so a database leak doesn't reveal passwords. Creating and checking hashes needs a crypto library, which is infrastructure. It will live behind a port, not in the entity.
- **The `id` is passed in**, not generated inside, because generating ids needs Node APIs (`crypto.randomUUID`) that the domain must not import.
- **No validation in the constructor yet.** None was asked for, and the HTTP DTO already validates the login input (KISS, D-019).

**Concepts.** Entity vs value object, domain layer independence.

---

## D-023: `UserRepository` port and Drizzle adapter

**Context.** Login needs to find a user by email in the database.

**Decision.**

| File | Role |
| --- | --- |
| `src/application/ports/out/user-repository.ts` | **Port**: the `UserRepository` interface with `findByEmail(email): Promise<User \| undefined>`. |
| `src/adapters/out/persistence/schema.ts` | The `users` table in Drizzle: `id` (uuid, primary key), `email` (unique), `password_hash`. |
| `src/adapters/out/persistence/drizzle-user-repository.ts` | **Adapter**: `DrizzleUserRepository implements UserRepository`. It runs the query and turns the row into a `User`. |
| `drizzle.config.ts` | Config for `drizzle-kit`: where the schema is, where migrations go, and how to connect (`DATABASE_URL` from `.env`, loaded with Node's built-in `process.loadEnvFile()`). |
| `drizzle/0000_create_users.sql` | The first **migration**, generated by `npm run db:generate`. |

**Why a port and an adapter?**
- The use case will depend on the `UserRepository` **interface** only. In tests it gets a fake; in production it gets `DrizzleUserRepository`. Swapping databases means writing a new adapter, with no change to business code.
- The adapter is the only place that knows about tables and columns (`password_hash` in SQL vs `passwordHash` in the entity). It translates rows into domain entities.

**Why `email` is unique.** Login finds a user by email, so two users with the same email would make login ambiguous. The database enforces this, so it holds even if application code has a bug.

**SQL injection.** `eq(users.email, email)` sends the email as a **parameter** (`$1`), separately from the SQL text. Even if someone types SQL into the email field, the database treats it as plain data.

**Migrations.** A migration is a versioned SQL file that changes the database structure. Flow: edit `schema.ts` → `npm run db:generate` (writes the SQL, no database needed) → review the SQL → `npm run db:migrate` (applies it). Migration files are committed, so every machine builds the same tables.

**Testing the adapter.**
- It's tested against a **real PostgreSQL**, because a fake can't prove the SQL is right.
- The test applies the migrations first, and each test inserts and deletes its own row.
- `npm test` doesn't load `.env`, so the suite is **skipped** there, which keeps `npm run check` working without Docker. `npm run test:db` loads `.env` (`tsx --env-file=.env`) and runs it.

**Lint.** `drizzle.config.ts` is outside `src/`, so outside `tsconfig.json`. `projectService.allowDefaultProject` lets ESLint type-check it. drizzle-kit requires a default export there, and the no-default-export rule only applies to `src/`.

**Status.** Files moved to `src/features/auth/...` (D-025). **Verified on 2026-10-06** against PostgreSQL 18 in Docker: `npm run db:migrate` created the table, and `npm run test:db` passed all 39 tests, including the 3 repository tests (find, not found, save). The adapter isn't wired into `index.ts` yet.

**Concepts.** Driven port and adapter, ORM schema, migrations, parameterized queries, integration tests.

---

## D-024: Password hashing with Argon2id

**Context.** Login must check the password the user typed against the stored `passwordHash`.

**Key idea: there is no "dehashing".** A hash is one-way. To check a password, the library hashes the typed password again using the same **salt** (a random value saved inside the stored hash) and compares the results. Because of the salt, hashing the same password twice gives different hashes. That's why the check can't be a database query like `WHERE password_hash = hash(input)`.

**Decision.**
- `@node-rs/argon2@2.2.1` (runtime dependency), using its default settings: Argon2id, `m=19456` (19 MiB of memory), `t=2` (iterations), `p=1` (parallelism). These are exactly OWASP's recommended minimum.
- `src/application/ports/out/password-hasher.ts`: the **port**, `PasswordHasher.verify(password, hash): Promise<boolean>`.
- `src/adapters/out/security/argon2-password-hasher.ts`: the **adapter**, `Argon2PasswordHasher`.
- Only `verify` for now. `hash` will be added when registration (or a seed script) needs it (KISS / YAGNI).

**Why Argon2id.** It's the first choice in the OWASP Password Storage Cheat Sheet. It's deliberately slow and **memory-hard**, so guessing billions of passwords with GPUs becomes very expensive.

**Why `@node-rs/argon2`.**
- Simple API: `verify(hash, password)` is one call.
- Ships ready-made native binaries as optional dependencies, so it needs **no install scripts** (fits D-012).
- MIT license, updated Sep 2026, about 1.9M downloads/week. Adds no `npm audit` issues.

**Alternatives.**

| Option | Why not |
| --- | --- |
| `argon2` (3M/wk) | Same algorithm and equally good, but it needs an install script (`node-gyp-build`) that npm blocks until approved. |
| `bcrypt` / `bcryptjs` (7.7M / 17M) | The most common in existing codebases, but an older algorithm that only uses the first 72 bytes of a password. |
| Node's built-in `crypto.argon2` | No dependency, but it returns raw bytes. We'd have to write the salt handling, the storage format and a constant-time comparison ourselves: security-critical code that is easy to get wrong, against KISS. |

**Testing.** The adapter is tested with the real library (fast, no setup): the right password returns `true`, a wrong one returns `false`.

**Concepts.** One-way hashing, salt, memory-hard algorithms, keeping crypto behind a port.

---

## D-025: Feature-first folder structure

**Context.** All code was grouped by layer (`src/domain`, `src/application`, `src/adapters`). As features grow (auth, products, orders...), each layer folder mixes unrelated features, and one feature is spread across the whole tree.

**Decision.** Group by **feature first**, then by hexagonal layer inside each feature. Code used by several features goes in `shared/`.

```
src/
├── features/auth/{domain, application, adapters}
├── shared/{config, http, testing}
└── index.ts
```

Files moved (only the location changed, not the code): `User`, the `UserRepository` and `PasswordHasher` ports, the login DTO, the Drizzle schema and repository, and the Argon2 hasher went to `features/auth/...`. `createApp` and `ValidationError` went to `shared/http/`.

**Why.**
- Everything about login lives in one folder, so it's easy to find, change, or delete.
- Hexagonal rules still apply **inside** each feature.
- `shared/` never imports from `features/`. Features plug in from `index.ts`, e.g. `createApp(createAuthRouter(loginService))`. So shared code has no hidden dependency on any feature.

**Also changed.**
- `createApp(authRouter)` mounts the feature router at `/auth`. App-wide behavior stays in `createApp`: JSON parsing, health check, 404, error handler.
- The `withServer` test helper moved to `shared/testing/` because two test files need it. `tsconfig.build.json` excludes that folder, so test code isn't shipped.
- `drizzle.config.ts` points to the new schema path. The migration didn't change, because only the file moved.

**Alternatives.** Layer-first (D-007's original tree): simpler with one feature, but scales worse.

**Concepts.** Vertical slices (feature-first), dependency direction between `features/` and `shared/`.

---

## D-026: Login use case and JWT tokens

**Context.** Complete the login path: `POST /auth/login` must check the credentials and give the Flutter app a way to stay logged in.

**Decision.**

| Piece | File | Role |
| --- | --- | --- |
| In port | `application/ports/in/login-use-case.ts` | `LoginUseCase.execute(email, password): Promise<string>` |
| Use case | `application/services/login.service.ts` | `LoginService`: find user → verify password → issue token |
| Error | `application/invalid-credentials-error.ts` | `InvalidCredentialsError`, the same for unknown email and wrong password |
| Out port | `application/ports/out/token-issuer.ts` | `TokenIssuer.issue(userId): Promise<string>` |
| Adapter | `adapters/out/security/jose-token-issuer.ts` | `JoseTokenIssuer`: JWT, HS256, 1 hour, `sub` = user id |
| Adapter | `adapters/in/http/auth-router.ts` | `POST /login`: DTO → use case → `200 { token }` or `401` |
| Config | `shared/config/env.ts` | Reads `DATABASE_URL` and `JWT_SECRET` and stops the app if one is missing |
| Wiring | `index.ts` | Creates the DB pool and the adapters, injects them into `LoginService`, and mounts the router |

**Responses.**
- `200 { "token": "eyJ..." }` for the right credentials.
- `401 { "error": "Invalid email or password" }` for an unknown email or a wrong password.
- `400` for an invalid body (D-018).
- `500` (generic message) if something breaks, e.g. the database is down.

**Why each part.**
- **One error for both cases.** Different messages ("no such user" vs "wrong password") would let anyone find out which emails are registered (*user enumeration*).
- **In port (`LoginUseCase`).** The router depends on the interface, so its HTTP test passes a 3-line fake instead of building the real service.
- **Use case tested with fakes.** `login.service.test.ts` uses plain objects for the repository, hasher and token issuer. There's no database, Argon2 or JWT, and the tests run in milliseconds. This is the main payoff of hexagonal architecture.
- **401 is handled in the auth router**, because `InvalidCredentialsError` belongs to the auth feature, and `shared/` must not import from features.

**JWT basics.** A JWT is `header.payload.signature`, each part base64url-encoded. The payload (`sub`, `iat`, `exp`) is **readable by anyone**, so it never contains secrets. The signature (HMAC-SHA256 with `JWT_SECRET`) proves the server created it and that nobody changed it. The server doesn't store tokens, so it can check one without a database lookup.

**Why `jose`.** MIT license, no dependencies, built-in TypeScript types, about 175M downloads/week, actively maintained. Alternative: `jsonwebtoken` (71M/week), which has 10 dependencies, needs `@types`, and has an older callback-style API.

**Settings.**
- **HS256**: one shared secret signs and checks tokens. It's simple, and fine while only this API checks tokens.
- **1 hour lifetime**: a stolen token stops working soon. The app must log in again after that. Refresh tokens can come later.
- `JWT_SECRET` must be at least 32 bytes for HS256. The current one is 43.

**Scripts.**
- `npm run dev` now loads `.env` (`tsx watch --env-file=.env`).
- `npm start` uses `--env-file-if-exists=.env`, because in production the variables usually come from the hosting platform, not a file.

**Verified.** All unit and HTTP tests pass. A manual run without a database returned `/health` → 200, an invalid body → 400, and a valid login → 500 with `ECONNREFUSED` logged on the server only. Starting without `.env` failed immediately with `Missing environment variable: DATABASE_URL`.

**Known gaps (to discuss).**
- **No user can log in yet:** there's no signup or seed. *(Solved by D-027.)*
- **Timing difference:** an unknown email returns faster than a wrong password, because no hash is checked. A patient attacker could use this to guess which emails exist. The usual fix is verifying against a dummy hash.
- **No graceful shutdown:** the DB pool isn't closed on Ctrl+C or `SIGTERM` (a rule in `CLAUDE.md`).
- **Nothing checks the token yet:** an "authentication middleware" will be needed for protected routes.

**Concepts.** Use case, inbound vs outbound ports, constructor injection in the composition root, JWT, user enumeration, fail-fast configuration.

---

## D-027: Signup

**Context.** Nobody could log in, because there was no way to create a user.

**Decision.** `POST /auth/signup` with `{ email, password }`:

| Piece | File | Role |
| --- | --- | --- |
| In port | `application/ports/in/signup-use-case.ts` | `SignupUseCase.execute(email, password): Promise<string>` |
| Use case | `application/services/signup.service.ts` | `SignupService`: email taken? → hash password → new `User` with a UUID → save → issue token |
| Error | `application/email-already-registered-error.ts` | `EmailAlreadyRegisteredError` → `409 Conflict` |
| Ports extended | `PasswordHasher.hash(password)`, `UserRepository.save(user)` | What signup needs that login didn't |
| Adapters extended | `Argon2PasswordHasher.hash`, `DrizzleUserRepository.save` (an `INSERT`) | |
| DTO renamed | `LoginRequestDto` → `CredentialsDto` (`credentials.dto.ts`) | Login and signup take the same body with the same rules, so one DTO serves both instead of duplicating the validation |
| Route | `auth-router.ts` | `POST /signup` → `201 { token }` |
| Wiring | `index.ts` | The adapters are created once and shared by `LoginService` and `SignupService` |

**Why these choices.**
- **Returns a token (201).** The user is logged in right after signing up, so the app doesn't need a second request. `201 Created` means a new resource was created.
- **409 Conflict** is the standard status when a request clashes with existing data.
- **The id is created in the use case** with `crypto.randomUUID()`, a standard global that also exists in browsers, so nothing is imported from Node. The database doesn't generate it, so the schema didn't change. Tests don't predict the id; they check that the token belongs to the saved user.
- **The email check lives in the use case**, where the business rule ("one account per email") is easy to read. The database's `UNIQUE` constraint is the safety net.
- **The hashing test shows the salt.** Hashing the same password twice gives two different hashes.

**Tests.**
- `SignupService` uses fakes: the user is saved with a hashed password, the token matches its id, and a taken email is rejected with nothing saved.
- The HTTP test covers 201, 409 and 400.
- The Argon2 test covers `hash`.
- The repository test adds "save then find". It's a database test, so it's skipped without Docker.

**Verified without a database.** An invalid body → 400. A valid signup → generic 500, with `ECONNREFUSED` logged on the server only.

**Known gaps (not added, to discuss).**
- **Two signups at the same instant** with the same email could both pass the check. The database's `UNIQUE` constraint then rejects the second, but the client gets a `500` instead of a `409`. The data stays correct.
- **No password strength rule:** even `"a"` is accepted. OWASP suggests a minimum length (8+ characters).
- **Email case:** `Ana@x.com` and `ana@x.com` are different accounts. Usually emails are lower-cased before saving and searching.
- **User enumeration:** signup reveals that an email is registered (409). Most apps accept this trade-off for a clearer UX.

**Concepts.** Extending ports when a new use case needs more, reusing adapters across use cases, 201 vs 200, 409 Conflict.

---

## Roadmap (learning path)

- [ ] 1. Configuration from environment variables (`config/`), with validation
- [x] 2. Routing (done with Express, see D-015)
- [x] 3. Read and validate JSON request bodies (see D-018)
- [ ] 4. First domain entity + value objects (e.g. `Product`, `Money`) with tests
- [ ] 5. Use cases + ports, in-memory repository adapter
- [ ] 6. HTTP adapter for `/products` (`GET/POST/PUT/DELETE`)
- [ ] 7. Database (SQLite, then PostgreSQL)
- [ ] 8. Authentication (password hashing, JWT)
- [ ] 9. Image upload for product photos
- [ ] 10. Logging, error handling, graceful shutdown
- [ ] 11. Connect the Flutter app

## Notes / learning log

Add what you learn here as the project grows.
