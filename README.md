# Marketplace API

Backend for the Flutter marketplace app (`../marketplace_app`).

**Purpose: learning.** This project uses vanilla Node.js (no Express or other framework) and TypeScript, so the fundamentals of backend development stay visible. This README documents every step used to create the project and why.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000/health>. You should see `{"status":"ok"}`.

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Runs `src/index.ts` and restarts automatically when you save a file |
| `npm run build`     | Compiles TypeScript (`src/`) to JavaScript (`dist/`)                |
| `npm start`         | Runs the compiled build (`dist/index.js`), as you would in production |
| `npm run typecheck` | Checks types without producing any files                            |

> From the Flutter app on an **Android emulator**, `localhost` is the emulator itself. Use `http://10.0.2.2:3000` to reach your computer. On iOS simulator, `localhost` works.

---

## How this project was created, step by step

### 0. Prerequisites

Node.js and npm installed. Versions used: Node `v26.10.0`, npm `11.19.1`.

```bash
node -v
npm -v
```

### 1. Create the project folder

```bash
mkdir marketplace_api
cd marketplace_api
mkdir src
```

All source code lives in `src/`. Compiled output will go to `dist/` (generated, not edited by hand).

### 2. Initialize npm

```bash
npm init -y
```

This creates `package.json`, the file that describes the project: its name, scripts, and dependencies. `-y` accepts all defaults.

### 3. Install TypeScript tooling

```bash
npm install -D typescript @types/node tsx
```

`-D` means *dev dependency*: needed while developing, not at runtime in production.

| Package        | Why                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `typescript`   | The compiler (`tsc`). Checks types and turns `.ts` into `.js`, which is what Node actually runs. |
| `@types/node`  | Type definitions for Node's built-in modules (`http`, `fs`, ...) so TypeScript understands them. |
| `tsx`          | Runs `.ts` files directly and supports watch mode. Only for development convenience.             |

There are no runtime dependencies. The server uses only what ships with Node.

### 4. Configure TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

| Option                         | Meaning                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `target: ES2022`               | Which JavaScript version to emit. Modern Node supports it natively.                      |
| `module` / `moduleResolution: NodeNext` | Use the same module rules as modern Node. **Consequence:** when importing your own files, write the `.js` extension: `import { x } from "./x.js"` (even though the source file is `.ts`). |
| `rootDir` / `outDir`           | Read from `src/`, write to `dist/`.                                                      |
| `strict: true`                 | Turns on all strict type checks. Keep it on; it catches most bugs early.                 |
| `esModuleInterop`              | Smoother imports of older CommonJS packages.                                             |
| `skipLibCheck`                 | Don't type-check `node_modules` declaration files (faster builds).                       |
| `types: ["node"]`              | Include Node's type definitions.                                                         |
| `include: ["src"]`             | Only compile files in `src/`.                                                            |

### 5. Write the first server (`src/index.ts`)

```ts
import { createServer } from "node:http";

const PORT = 3000;

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

Concepts shown here:

- **`node:http`**: Node's built-in HTTP module. The `node:` prefix marks it as a built-in. Frameworks like Express are built on top of it.
- **`createServer(callback)`**: the callback runs once for **every** incoming request.
- **`req`** (request): what the client sent: method (`GET`, `POST`, ...), URL, headers, body.
- **`res`** (response): what we send back: status code, headers, body.
- **Status codes**: `200` = OK, `404` = not found.
- **`Content-Type: application/json`**: tells the client how to read the body. Flutter's `jsonDecode` expects JSON.
- **`listen(PORT)`**: starts accepting connections on that port.
- **Routing by hand**: the `if` checks on method and URL are the simplest possible router. Frameworks automate this.

### 6. Add scripts to `package.json`

```bash
npm pkg set name=marketplace-api \
  main=dist/index.js \
  scripts.dev="tsx watch src/index.ts" \
  scripts.build=tsc \
  scripts.start="node dist/index.js" \
  scripts.typecheck="tsc --noEmit"
```

(Equivalent to editing the `scripts` section of `package.json` by hand.)

### 7. Add `.gitignore`

```
node_modules
dist
.env
```

- `node_modules`: installed packages; recreated by `npm install`.
- `dist`: generated by the build.
- `.env`: will hold secrets (database passwords, JWT keys). **Never commit it.**

### 8. Verify it works

```bash
npm run build            # should finish with no errors
npm start                # in one terminal
```

In another terminal:

```bash
curl -i http://localhost:3000/health
# HTTP/1.1 200 OK
# {"status":"ok"}

curl -i http://localhost:3000/nope
# HTTP/1.1 404 Not Found... {"error":"Not found"}
```

Also confirmed `npm run dev` serves the same responses.

---

## Project structure

```
marketplace_api/
├── src/
│   └── index.ts        # HTTP server (entry point)
├── dist/               # compiled JS (generated, git-ignored)
├── node_modules/       # dependencies (generated, git-ignored)
├── .gitignore
├── package.json        # project metadata, scripts, dependencies
├── package-lock.json   # exact dependency versions (commit this)
├── tsconfig.json       # TypeScript configuration
└── README.md
```

## Development vs production

- **Development**: `npm run dev` runs TypeScript directly through `tsx` and restarts on every save.
- **Production**: `npm run build` then `npm start`. Node runs the plain JavaScript in `dist/`; TypeScript is no longer involved.

## Roadmap (learning path)

- [ ] 1. Write a small router by hand (parse URL, method, query string)
- [ ] 2. Read JSON request bodies (collect the stream chunks, parse, validate)
- [ ] 3. `GET/POST/PUT/DELETE /products` using an in-memory array
- [ ] 4. Split code into modules (routes, handlers, types)
- [ ] 5. Add a database (SQLite, then PostgreSQL)
- [ ] 6. Authentication (password hashing, JWT)
- [ ] 7. Image upload for product photos
- [ ] 8. Error handling, validation, and tests
- [ ] 9. Connect the Flutter app

## Notes / learning log

Add what you learn here as the project grows.
