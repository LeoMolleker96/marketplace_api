import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Argon2PasswordHasher } from "./argon2-password-hasher.js";

// Adapter test against the real library: it's fast and needs no setup,
// so there's no reason to fake it.
describe("Argon2PasswordHasher", () => {
  it("creates an Argon2id hash, never the plain password", async () => {
    // Arrange
    const hasher = new Argon2PasswordHasher();

    // Act
    const hash = await hasher.hash("secret123");

    // Assert
    assert.match(hash, /^\$argon2id\$/);
    assert.doesNotMatch(hash, /secret123/);
  });

  it("creates a different hash each time for the same password, because of the random salt", async () => {
    const hasher = new Argon2PasswordHasher();

    const firstHash = await hasher.hash("secret123");
    const secondHash = await hasher.hash("secret123");

    assert.notEqual(firstHash, secondHash);
  });

  it("accepts the password the hash was made from", async () => {
    const hasher = new Argon2PasswordHasher();
    const hash = await hasher.hash("secret123");

    const matches = await hasher.verify("secret123", hash);

    assert.equal(matches, true);
  });

  it("rejects a different password", async () => {
    const hasher = new Argon2PasswordHasher();
    const hash = await hasher.hash("secret123");

    const matches = await hasher.verify("wrong-password", hash);

    assert.equal(matches, false);
  });
});
