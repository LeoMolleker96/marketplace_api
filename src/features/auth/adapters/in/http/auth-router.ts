import { Router } from "express";
import type { Request, Response } from "express";
import { EmailAlreadyRegisteredError } from "../../../application/email-already-registered-error.js";
import { InvalidCredentialsError } from "../../../application/invalid-credentials-error.js";
import type { LoginUseCase } from "../../../application/ports/in/login-use-case.js";
import type { SignupUseCase } from "../../../application/ports/in/signup-use-case.js";
import { CredentialsDto } from "./credentials.dto.js";

/**
 * The HTTP routes of the auth feature, mounted under `/auth` by `createApp`.
 *
 * This is a driving (inbound) adapter: it translates HTTP into calls to the
 * use cases, and their results (or errors) back into HTTP responses.
 * Invalid bodies throw a ValidationError, which the app's error handler turns into 400.
 *
 * @param login - The login use case (the real one in `index.ts`, a fake in tests).
 * @param signup - The signup use case.
 * @returns An Express router with `POST /login` and `POST /signup`.
 */
export function createAuthRouter(login: LoginUseCase, signup: SignupUseCase): Router {
  const router = Router();

  // POST (not GET) because credentials travel in the request body;
  // a GET would put them in the URL, which ends up in logs and browser history.
  router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = new CredentialsDto(req.body);

    try {
      const token = await login.execute(email, password);
      res.json({ token });
    } catch (error) {
      // 401 Unauthorized: the credentials are wrong. Any other error is a bug
      // and is re-thrown so the app's error handler answers 500.
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  router.post("/signup", async (req: Request, res: Response) => {
    const { email, password } = new CredentialsDto(req.body);

    try {
      const token = await signup.execute(email, password);
      // 201 Created: a new resource (the account) was created.
      res.status(201).json({ token });
    } catch (error) {
      // 409 Conflict: the request clashes with existing data (the email is taken).
      if (error instanceof EmailAlreadyRegisteredError) {
        res.status(409).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  return router;
}
