import { once } from "node:events";
import type { Express } from "express";

/**
 * Test helper: starts `app` on a random free port (port 0 lets the OS choose),
 * runs `test` with the server's base URL, and always shuts the server down.
 * Each test gets its own server, so tests can't affect each other.
 *
 * @param app - The Express app to serve.
 * @param test - The test body, receiving e.g. `http://127.0.0.1:54321`.
 */
export async function withServer(app: Express, test: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Expected the server to listen on a TCP port");
    }
    await test(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}
