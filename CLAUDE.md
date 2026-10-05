# CLAUDE.md

## Purpose

This is the backend API for a marketplace app whose client is a Flutter app (`../marketplace_app`).

**The main purpose of this project is learning backend development.** The owner is a beginner in backend work. Prefer clarity and teaching value over cleverness or speed. When something is a core concept (HTTP, routing, streams, ports/adapters, etc.), explain it briefly in your reply and in code comments.

## Stack

- Node.js + TypeScript (strict mode), ES modules (`"module": "NodeNext"`)
- **No web framework** (no Express, Fastify, Nest...). Use Node built-ins (`node:http`, `node:test`, `node:assert`, ...) so the fundamentals stay visible.
- Do not add a dependency unless asked. If one seems necessary, propose it and explain why first.
- Dev: `npm run dev` · Build: `npm run build` · Start: `npm start` · Typecheck: `npm run typecheck`

## How to work in this project (most important rules)

1. **Only create exactly what is asked.** If asked for a folder, create only the folder (no files inside, except a `.gitkeep` if needed to keep it). If asked for a service, create only that service (plus its test, see below). Do not scaffold extra layers, routes, entities, or "helpful" files.
2. **Don't wire things up unasked.** Do not register a new piece in `index.ts` or other files unless asked.
3. If a request is ambiguous or would need something not asked for, ask or mention it instead of creating it.
4. After the work, briefly say what was created and what concept it demonstrates. Suggest (do not do) the logical next step.
5. When a step changes how the project is set up (new script, config, dependency), update `README.md` so its step-by-step documentation stays accurate.

## Architecture: Hexagonal (Ports & Adapters)

The goal is to keep business rules independent from frameworks, databases, and HTTP. Dependencies point **inward only**:

```
adapters  ->  application  ->  domain
```

```
src/
├── domain/              # Pure business rules. No imports from outside this folder.
│   ├── entities/        #   e.g. Product, User (have identity and behavior)
│   └── value-objects/   #   e.g. Money, Email (immutable, validated on creation)
├── application/         # Use cases: orchestrate the domain to do one thing.
│   ├── ports/
│   │   ├── in/          #   what the app offers (use case interfaces)
│   │   └── out/         #   what the app needs (e.g. ProductRepository interface)
│   └── services/        #   implement the "in" ports, depend only on "out" ports
├── adapters/            # Connect the outside world to the ports.
│   ├── in/http/         #   driving adapters: HTTP handlers/router -> call use cases
│   └── out/persistence/ #   driven adapters: DB / in-memory repositories implementing "out" ports
├── config/              # Environment variables and settings
└── index.ts             # Composition root: the ONLY place that creates adapters and wires them together
```

Rules:

- `domain/` imports nothing from `application/` or `adapters/`, and no Node APIs or libraries.
- `application/` imports only from `domain/` and its own ports. It never imports an adapter or `node:http`.
- `adapters/` may import from `application/` and `domain/`, never from each other (an HTTP adapter must not import a persistence adapter).
- Wiring (choosing which adapter implements which port) happens only in `index.ts` via constructor injection. No DI framework.
- Ports are TypeScript `interface`s. Adapters `implements` them.
- Domain/application errors are custom error classes; adapters translate them into HTTP status codes.

This structure is the target. Folders are created only when asked (see rule 1).

## Code style and best practices

**TypeScript**
- `strict` is on; never weaken it. No `any` (use `unknown` and narrow). No non-null assertions (`!`) or unchecked `as` casts without a comment explaining why.
- Prefer `interface` for contracts/ports, `type` for unions and aliases. Use `readonly` and `const` by default.
- Explicit return types on exported functions and public methods.
- Model states with union types / discriminated unions instead of loose strings and booleans.
- Use `import type` for type-only imports. Local imports need the `.js` extension (NodeNext), e.g. `import { x } from "./x.js"`.
- Named exports only (no default exports).
- Files: `kebab-case.ts` (e.g. `create-product.service.ts`). Classes/interfaces/types: `PascalCase`. Variables/functions: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Do not prefix interfaces with `I`.

**Node.js**
- Use the `node:` prefix for built-in modules.
- Never block the event loop: use async APIs, not `*Sync` ones (except at startup).
- Always handle promise rejections; no floating promises. Use `async/await`.
- Validate all external input (request bodies, query params, env vars) at the boundary, and treat it as `unknown` until validated.
- Never hardcode secrets or config; read them from environment variables in `config/`. Never commit `.env`.
- Never leak internal error details or stack traces to clients. Log them server-side.
- Shut down gracefully on `SIGINT`/`SIGTERM`.

**General**
- Small functions with a single responsibility. Prefer composition over inheritance.
- Depend on abstractions (ports), not concrete implementations.
- No dead code, no commented-out code, no TODO left without telling the owner.

## Documentation

Since this project is for learning, documentation is a requirement, not an extra:

- Every exported class, interface, function, and type gets a **TSDoc** comment (`/** ... */`) explaining *what it is and why it exists*. Use `@param`, `@returns`, `@throws` where they add information.
- Add short inline comments for non-obvious decisions, focused on the **why**, not the what.
- Where a file demonstrates a concept (a port, an adapter, an entity), say so in its doc comment in one or two lines (e.g. "This is a driven port: ...").
- Keep `README.md` current (see rule 5).

## Testing

Every piece of logic created must come with tests. A service, entity, value object, or adapter is not "done" until it has a test file.

- Use Node's built-in test runner: `node:test` and `node:assert/strict`. No Jest/Vitest unless the owner asks.
- Run with `tsx` (already installed): `tsx --test "src/**/*.test.ts"`. Add an `npm test` script when the first test is created, and document it in the README.
- Test files live next to the code: `create-product.service.ts` -> `create-product.service.test.ts`.
- Test names describe behavior: `it("rejects a negative price")`, not `it("test 1")`.
- Structure each test as Arrange / Act / Assert.
- **Domain**: plain unit tests, no mocks.
- **Application services**: test against in-memory fakes/stubs of the "out" ports (hand-written, no mocking library). This is a main benefit of hexagonal architecture, so point it out.
- **Adapters**: test them against their real counterpart where cheap (e.g. HTTP adapter with a real `node:http` server on an ephemeral port; repositories with the real in-memory/SQLite implementation).
- Cover the happy path, edge cases, and error cases.
- Tests must be deterministic and independent: no shared mutable state between tests, no real network or clock dependence.
- Before saying work is finished, run `npm run typecheck` and the tests, and report the actual results.

## Git

- Do not commit, push, or create branches unless asked.
