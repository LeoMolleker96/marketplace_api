import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jwtVerify } from "jose";
import { JoseTokenIssuer } from "./jose-token-issuer.js";

const SECRET = "a-test-secret-that-is-at-least-32-characters-long";

// Adapter test with the real library: the token is checked the same way a
// future "is this user logged in?" step will check it.
describe("JoseTokenIssuer", () => {
  it("issues a token for the user that is valid for 1 hour", async () => {
    // Arrange
    const issuer = new JoseTokenIssuer(SECRET);

    // Act
    const token = await issuer.issue("user-1");

    // Assert
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET));
    assert.equal(payload.sub, "user-1");
    assert.equal((payload.exp ?? 0) - (payload.iat ?? 0), 60 * 60);
  });

  it("issues a token that a different secret can't verify", async () => {
    const issuer = new JoseTokenIssuer(SECRET);

    const token = await issuer.issue("user-1");

    await assert.rejects(jwtVerify(token, new TextEncoder().encode("another-secret-that-is-also-32-characters")));
  });
});
