import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Express } from "express";
import { createApp } from "../../../../../shared/http/create-app.js";
import { withServer } from "../../../../../shared/testing/with-server.js";
import { EmailAlreadyRegisteredError } from "../../../application/email-already-registered-error.js";
import { InvalidCredentialsError } from "../../../application/invalid-credentials-error.js";
import type { LoginUseCase } from "../../../application/ports/in/login-use-case.js";
import type { SignupUseCase } from "../../../application/ports/in/signup-use-case.js";
import { createAuthRouter } from "./auth-router.js";

// HTTP adapter test: real Express app, real HTTP requests, but fake use
// cases, so we only test the HTTP translation (status codes and JSON).

/** Fake login: only "ana@example.com" / "secret123" is accepted. */
const login: LoginUseCase = {
  execute: (email, password) =>
    email === "ana@example.com" && password === "secret123"
      ? Promise.resolve("a-token")
      : Promise.reject(new InvalidCredentialsError()),
};

/** Fake signup: "ana@example.com" is already registered, any other email works. */
const signup: SignupUseCase = {
  execute: (email) =>
    email === "ana@example.com" ? Promise.reject(new EmailAlreadyRegisteredError()) : Promise.resolve("a-new-token"),
};

/** A fresh app for each test, with the fake use cases. */
function createTestApp(): Express {
  return createApp(createAuthRouter(login, signup));
}

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /auth/login", () => {
  it("responds 200 with a token for the right credentials", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/login`, { email: "ana@example.com", password: "secret123" });

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { token: "a-token" });
    });
  });

  it("responds 401 for wrong credentials", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/login`, { email: "ana@example.com", password: "wrong" });

      assert.equal(response.status, 401);
      assert.deepEqual(await response.json(), { error: "Invalid email or password" });
    });
  });

  it("responds 400 with the validation message for an invalid body", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/login`, { email: "not-an-email", password: "secret123" });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "Email must be valid" });
    });
  });

  it("responds 400 when the body is not sent as JSON", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "email=ana@example.com&password=secret123",
      });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "Body must be a JSON object" });
    });
  });

  it("responds 404 to GET, because only POST is defined", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/login`);

      assert.equal(response.status, 404);
    });
  });
});

describe("POST /auth/signup", () => {
  it("responds 201 with a token for a new email", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/signup`, { email: "new@example.com", password: "secret123" });

      assert.equal(response.status, 201);
      assert.deepEqual(await response.json(), { token: "a-new-token" });
    });
  });

  it("responds 409 when the email is already registered", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/signup`, { email: "ana@example.com", password: "secret123" });

      assert.equal(response.status, 409);
      assert.deepEqual(await response.json(), { error: "Email is already registered" });
    });
  });

  it("responds 400 with the validation message for an invalid body", async () => {
    await withServer(createTestApp(), async (baseUrl) => {
      const response = await postJson(`${baseUrl}/auth/signup`, { email: "new@example.com" });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "Password is required" });
    });
  });
});
