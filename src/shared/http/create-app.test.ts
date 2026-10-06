import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Router } from "express";
import { withServer } from "../testing/with-server.js";
import { createApp } from "./create-app.js";

// Tests of the app-wide behavior, with real HTTP requests (`fetch`) against
// the real app. Feature routes are tested in their own feature, so here the
// app gets an empty router.

/** Sends `body` as JSON. It's a string so tests can also send invalid JSON. */
function postJson(baseUrl: string, body: string): Promise<Response> {
  return fetch(`${baseUrl}/anything`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("createApp", () => {
  it("responds to GET /health with 200 and status ok as JSON", async () => {
    await withServer(createApp(Router()), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type") ?? "", /application\/json/);
      assert.deepEqual(await response.json(), { status: "ok" });
    });
  });

  it("does not reveal that the server uses Express", async () => {
    await withServer(createApp(Router()), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);

      assert.equal(response.headers.get("x-powered-by"), null);
    });
  });

  it("responds 400 for malformed JSON without leaking parser details", async () => {
    await withServer(createApp(Router()), async (baseUrl) => {
      const response = await postJson(baseUrl, '{"email": "ana@example.com",');

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "Bad Request" });
    });
  });

  it("responds 413 for a body larger than 100kb", async () => {
    await withServer(createApp(Router()), async (baseUrl) => {
      const response = await postJson(baseUrl, JSON.stringify({ data: "x".repeat(200_000) }));

      assert.equal(response.status, 413);
      assert.deepEqual(await response.json(), { error: "Payload Too Large" });
    });
  });

  it("responds 404 with a JSON error to unknown routes", async () => {
    await withServer(createApp(Router()), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/nope`);

      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { error: "Not found" });
    });
  });
});
