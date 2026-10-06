import { STATUS_CODES } from "node:http";
import express from "express";
import type { Express, NextFunction, Request, Response, Router } from "express";
import { ValidationError } from "./validation-error.js";

/**
 * Builds the Express application: app-wide middleware, the feature routers,
 * and error handling.
 *
 * It only *builds* the app and doesn't start listening; the composition root
 * (`index.ts`) decides the port. That split lets tests start the same app on a
 * random free port. Feature routes come in as routers, so this shared code
 * never imports anything from a feature.
 *
 * @param authRouter - The auth feature's routes, mounted under `/auth`.
 * @returns A configured Express app, ready to `listen()`.
 */
export function createApp(authRouter: Router): Express {
  // An Express app is an ordered list of middleware functions. Each request
  // walks through them in registration order until one sends a response.
  const app = express();

  // Express adds an `X-Powered-By: Express` header by default. Removing it
  // avoids telling attackers which library (and known bugs) to target.
  app.disable("x-powered-by");

  // Logging middleware: runs for every request, then calls `next()` to hand the
  // request to the next middleware. Forgetting `next()` would leave it hanging.
  // Only method and URL are logged, never the body (it may contain passwords).
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });

  // The request body arrives as a stream of bytes. `express.json()` collects
  // it and parses it into `req.body`, but only when the client sends
  // `Content-Type: application/json`, and only up to 100kb by default.
  // Invalid JSON becomes a 400 error handled by the error middleware below.
  app.use(express.json());

  // Route: only matches GET requests to exactly "/health".
  // `res.json()` serializes the object and sets `Content-Type: application/json`.
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Feature routes: every route in `authRouter` is reached under "/auth"
  // (its "/login" becomes "/auth/login").
  app.use("/auth", authRouter);

  // Fallback: if no route above sent a response, nothing matched, so it's a 404.
  // Without this, Express answers with an HTML page, which a JSON client can't parse.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error-handling middleware: Express recognizes it because it has 4 parameters.
  // Any error thrown in a route ends up here. Express's default handler would send
  // the stack trace to the client in development, so we log the details
  // server-side and send a generic message instead.
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    // If the response already started streaming, we can't send a new one;
    // Express's default handler knows how to close the connection safely.
    if (res.headersSent) {
      next(err);
      return;
    }

    // Invalid data from the client (thrown by our DTOs): 400 with its message.
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Errors caused by the client (e.g. malformed JSON -> 400, body too large -> 413)
    // carry a 4xx `status`. Answer with that status and its standard name only.
    const clientErrorStatus = getClientErrorStatus(err);
    if (clientErrorStatus !== undefined) {
      res.status(clientErrorStatus).json({ error: STATUS_CODES[clientErrorStatus] ?? "Bad Request" });
      return;
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

/**
 * Returns the HTTP status of errors caused by the client (4xx), like the ones
 * `express.json()` throws for malformed JSON. Returns `undefined` for anything
 * else, which must be treated as a server bug (500).
 */
function getClientErrorStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err && typeof err.status === "number") {
    return err.status >= 400 && err.status < 500 ? err.status : undefined;
  }
  return undefined;
}
