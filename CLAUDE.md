# CLAUDE.md

## Purpose

This is the backend API for a marketplace app. The client is a Flutter app (`../marketplace_app`), where the owner is learning Riverpod.

**The main purpose of this project is learning backend development with Node.js and TypeScript.** The owner is a beginner in backend work. The goal is to learn:

- **Clean architecture** (we use Hexagonal / Ports & Adapters, see below).
- **Real-world best practices** for Node.js and TypeScript.
- **Real-world packages**, the ones used in professional projects, chosen deliberately.

Prefer clarity and teaching value over cleverness or speed. **Explain everything**: for every change, explain in your reply what you did, why, and which concept it shows (HTTP, streams, ports/adapters, dependency injection, validation, etc.). Put short explanations in code comments too.

## Guiding principle: KISS (Keep It Simple)

Code must be **simple to read**. Simple does **not** mean careless: it must still be correct, secure, reasonably efficient, and follow the best practices in this file.

- Write the most direct code that solves the problem. A beginner should be able to read it top to bottom.
- **No complex types** (result/wrapper types, generics, discriminated unions, mapped or conditional types) unless they clearly make the code *simpler*, and ask first.
- **No helpers for the sake of it.** Extract a function only when it is reused, or when it clearly makes the calling code easier to read. A few inline lines beat a helper used once.
- Prefer plain language features: `if` + `throw`, classes with constructors, plain objects, simple return values.
- No speculative code: no abstractions, options, or checks "for later". Add them when they are needed.
- If the simple way would be a bad practice (security, performance, correctness), say so and explain the trade-off instead of quietly writing the complex version.

Example from this project: `CredentialsDto` (formerly `LoginRequestDto`) validates its fields in its constructor with plain `if` + `throw new ValidationError(...)`. It doesn't use a `ParseResult<T>` type and per-field helper functions.

## Stack

- **Node.js** (v26) + **TypeScript** (strict mode), **ES modules** (`"type": "module"`, `"module": "NodeNext"`).
- **TypeScript is pinned to `~6.0.x`** because `typescript-eslint` does not support TypeScript 7 yet. Move to TS 7 when it does (check `npm view typescript-eslint peerDependencies`).
- **No architecture-dictating frameworks** (NestJS, AdonisJS, LoopBack...). The architecture is built by hand so it stays visible.
- **Focused, real-world libraries are welcome** (validation, logging, database, auth, etc.), but each one must be **proposed first** with the reason and alternatives, and only installed after the owner agrees. The HTTP layer uses **Express 5** (see DECISIONS.md D-015). Express code belongs only in HTTP adapters and the composition root, never in `domain/` or `application/`.
- Database: **PostgreSQL** with **Drizzle ORM** (`drizzle-orm` + `pg` driver, migrations with `drizzle-kit`). See DECISIONS.md D-020. Drizzle code belongs only in a feature's `adapters/out/persistence` (and wiring in `index.ts`).
- Password hashing: **Argon2id** with `@node-rs/argon2` (see DECISIONS.md D-024), only in `adapters/out/security`.
- Login tokens: **JWT** (HS256, 1 hour) with `jose` (see DECISIONS.md D-026), only in `adapters/out/security`.
- Tests: Node's built-in runner (`node:test` + `node:assert/strict`) run through `tsx`.
- Lint: ESLint + `typescript-eslint` (`strictTypeChecked` + `stylisticTypeChecked`), config in `eslint.config.js`.

Commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Run with auto-restart (tsx watch), loading `.env` |
| `npm run build` / `npm start` | Compile to `dist/` (via `tsconfig.build.json`, tests excluded) / run the build |
| `npm run typecheck` | Type-check only |
| `npm run lint` / `npm run lint:fix` | Lint / lint and auto-fix |
| `npm test` | Run all `src/**/*.test.ts` (database tests skip themselves) |
| `npm run test:db` | All tests including database ones (loads `.env`; needs `docker compose up -d` + `npm run db:migrate`) |
| `npm run check` | typecheck + lint + test (**run after every change**) |
| `npm run db:generate` / `npm run db:migrate` | Write a migration from `schema.ts` / apply migrations |

## How to work in this project (most important rules)

1. **Only create exactly what is asked.** If asked for a folder, create only the folder (a `.gitkeep` if needed). If asked for a service, create only that service plus its test. Do not scaffold extra layers, routes, entities, or "helpful" files. This includes **validation rules and checks**: implement only the rules the owner stated (e.g. "must be an email" does not mean "max 254 characters").
2. **Keep tasks small and simple.** Do one thing per request. Recommendations (extra checks, security hardening, refactors, config changes) are **asked about first**, never added "just in case".
3. **Don't wire things up unasked.** Do not register a new piece in `index.ts` or other files unless asked.
4. **If a request is ambiguous** or would need something not asked for, ask or mention it instead of creating it.
5. **Every iteration ends with `npm run check`** (typecheck, lint, tests). Fix every lint error. Never disable a lint rule or add `eslint-disable` without explaining why and recording it in `DECISIONS.md`. Report the actual results to the owner, including failures.
6. **Every piece of logic comes with tests and documentation** (see Testing and Documentation).
7. **Record every decision in `DECISIONS.md`** (new package, config change, architecture choice, rule change, rejected alternative). Keep `README.md` limited to *how to run the project*.
8. After the work, briefly say what was created and what concept it demonstrates. **Suggest (do not do)** the logical next step.

## Packages: safe and up to date

- Before proposing a package, check it: actively maintained (recent releases), widely used, acceptable license, no known vulnerabilities, ships TypeScript types. Mention the alternatives.
- Install the **latest stable** version (`npm install <pkg>@latest`), as a dev dependency (`-D`) if it is only needed for development/tests.
- After any install or upgrade, run `npm audit` and `npm outdated` and report the results. Do not leave known vulnerabilities unmentioned.
- Never use `npm audit fix --force` without asking (it can install breaking major versions).
- npm blocks dependency install scripts unless approved (`allowScripts`). Do not approve one without asking and explaining what the script does.
- Always commit `package-lock.json`. Remove packages that are no longer used (`npm uninstall`, `npm prune`).

## Architecture: Hexagonal (Ports & Adapters), feature-first

The goal is to keep business rules independent from frameworks, databases, and HTTP. Code is grouped **by feature first** (`features/auth`, later e.g. `features/products`), and **inside each feature** by hexagonal layer. Dependencies point **inward only**:

```
adapters  ->  application  ->  domain
```

```
src/
├── features/
│   └── auth/                          # one folder per feature
│       ├── domain/
│       │   └── entities/              #   e.g. User (identity + business data). Imports nothing.
│       ├── application/
│       │   ├── ports/
│       │   │   ├── in/                #   what the feature offers (e.g. LoginUseCase interface)
│       │   │   └── out/               #   what it needs (UserRepository, PasswordHasher, TokenIssuer)
│       │   ├── services/              #   use cases implementing "in" ports, using only "out" ports
│       │   └── *-error.ts             #   application errors (e.g. InvalidCredentialsError)
│       └── adapters/
│           ├── in/http/               #   Express router + request DTOs -> call use cases
│           └── out/
│               ├── persistence/       #   Drizzle schema + repositories implementing "out" ports
│               └── security/          #   Argon2 hashing, JWT tokens
├── shared/                            # code used by several features, never feature-specific
│   ├── config/                        #   environment variables (env.ts)
│   ├── http/                          #   createApp (app-wide middleware, errors), ValidationError
│   └── testing/                       #   test helpers (excluded from the build)
└── index.ts                           # composition root: the ONLY place that creates adapters and wires them
```

Rules:

- `domain/` imports nothing from `application/` or `adapters/`, and no Node APIs or libraries.
- `application/` imports only from its feature's `domain/` and its own ports/errors. It never imports an adapter, Express, Drizzle, or any infrastructure library.
- `adapters/` may import from their feature's `application/` and `domain/`, and from `shared/`. Adapters never import each other (an HTTP adapter must not import a persistence adapter).
- `shared/` never imports from `features/`. Features plug into the app from `index.ts` (e.g. `createApp(createAuthRouter(loginService))`).
- Features don't import each other's internals. If that becomes necessary, discuss it first.
- Wiring (choosing which adapter implements which port) happens only in `index.ts` via constructor injection. No DI framework.
- Ports are TypeScript `interface`s. Adapters `implements` them.
- Errors are custom error classes. Feature errors are translated to HTTP status codes in the feature's router (e.g. `InvalidCredentialsError` -> 401). Shared errors (`ValidationError` -> 400) and unknown errors (-> 500) are handled in `createApp`'s error handler.

Folders are created only when needed (see rule 1).

## Code style and best practices

**TypeScript**
- `strict` is on, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`. Never weaken them.
- No `any` (use `unknown` and narrow). No non-null assertions (`!`) or unchecked `as` casts without a comment explaining why.
- Prefer `interface` for contracts/ports, `type` for unions and aliases. Use `readonly` and `const` by default.
- Explicit return types on exported functions and public methods (enforced by lint).
- Keep types simple (see KISS above).
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`). Local imports need the `.js` extension (NodeNext), e.g. `import { x } from "./x.js"`.
- Named exports only, no default exports (enforced by lint in `src/`).
- Files: `kebab-case.ts` (e.g. `create-product.service.ts`). Classes/interfaces/types: `PascalCase`. Variables/functions: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Do not prefix interfaces with `I`.

**Node.js**
- Use the `node:` prefix for built-in modules (enforced by lint).
- Never block the event loop: use async APIs, not `*Sync` ones (except at startup).
- Always handle promise rejections; no floating promises (enforced by lint). Use `async/await`.
- Validate all external input (request bodies, query params, env vars) at the boundary, and treat it as `unknown` until validated.
- Never hardcode secrets or config; read them from environment variables in `config/`. Never commit `.env`.
- Never leak internal error details or stack traces to clients. Log them server-side.
- Shut down gracefully on `SIGINT`/`SIGTERM`.

**General**
- Functions do one thing, but don't split code into many tiny helpers (see KISS above). Prefer composition over inheritance.
- Depend on abstractions (ports), not concrete implementations.
- No dead code, no commented-out code, no TODO left without telling the owner.

## Documentation

Documentation is a requirement, not an extra:

- **`README.md`**: only how to set up and run the project (prerequisites, install, env vars, scripts, how to verify). Update it whenever a step changes (new script, env var, service like a database).
- **`DECISIONS.md`**: the learning log. Every decision gets an entry: context, decision, why, alternatives considered, and concepts to learn. Append new entries; if a decision is replaced, mark the old one "Superseded by D-xxx" instead of deleting it.
- **TSDoc** (`/** ... */`) on every exported class, interface, function, and type, explaining *what it is and why it exists*. Use `@param`, `@returns`, `@throws` where they add information.
- Short inline comments for non-obvious decisions, focused on the **why**.
- Where a file demonstrates a concept (a port, an adapter, an entity), say so in its doc comment in one or two lines (e.g. "This is a driven port: ...").

## Testing

Every piece of logic must come with tests. A service, entity, value object, or adapter is not "done" until it has a test file.

- Use `node:test` and `node:assert/strict`. No Jest/Vitest unless the owner asks.
- Run with `npm test` (`tsx --test "src/**/*.test.ts"`), and **run the tests on every iteration** (via `npm run check`).
- Test files live next to the code: `create-product.service.ts` -> `create-product.service.test.ts`.
- Test names describe behavior: `it("rejects a negative price")`, not `it("test 1")`.
- Structure each test as Arrange / Act / Assert.
- **Domain**: plain unit tests, no mocks.
- **Application services**: test against hand-written in-memory fakes/stubs of the "out" ports (no mocking library). This is a main benefit of hexagonal architecture, so point it out.
- **Adapters**: test them against their real counterpart where cheap (e.g. the Express HTTP adapter listening on a real ephemeral port; repositories with the real in-memory/SQLite implementation).
- Cover the happy path, edge cases, and error cases.
- Tests must be deterministic and independent: no shared mutable state between tests, no real network or clock dependence.

## Git

- Do not commit, push, or create branches unless asked.
