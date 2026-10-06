import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { User } from "./user.js";

// Domain test: plain unit test, no server, database, or mocks needed.
describe("User", () => {
  it("is created with an id, email, and password hash", () => {
    // Arrange / Act
    const user = new User("user-1", "ana@example.com", "hashed-password");

    // Assert
    assert.equal(user.id, "user-1");
    assert.equal(user.email, "ana@example.com");
    assert.equal(user.passwordHash, "hashed-password");
  });
});
