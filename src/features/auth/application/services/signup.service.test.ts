import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { User } from "../../domain/entities/user.js";
import { EmailAlreadyRegisteredError } from "../email-already-registered-error.js";
import type { PasswordHasher } from "../ports/out/password-hasher.js";
import type { TokenIssuer } from "../ports/out/token-issuer.js";
import type { UserRepository } from "../ports/out/user-repository.js";
import { SignupService } from "./signup.service.js";

// Use case tested with hand-written fakes of its ports: no database, no Argon2, no JWT.

/** Fake hasher: a "hash" is just the password with a "hashed:" prefix. */
const passwordHasher: PasswordHasher = {
  hash: (password) => Promise.resolve(`hashed:${password}`),
  verify: (password, hash) => Promise.resolve(hash === `hashed:${password}`),
};

/** Fake token issuer: returns a predictable token. */
const tokenIssuer: TokenIssuer = {
  issue: (userId) => Promise.resolve(`token-for-${userId}`),
};

/**
 * Fake repository backed by a plain array. Each test creates its own,
 * so tests never share stored users.
 */
function createUserRepository(users: User[]): UserRepository {
  return {
    findByEmail: (email) => Promise.resolve(users.find((user) => user.email === email)),
    save: (user) => {
      users.push(user);
      return Promise.resolve();
    },
  };
}

describe("SignupService", () => {
  it("saves the new user with a hashed password and returns a token for them", async () => {
    // Arrange
    const users: User[] = [];
    const signup = new SignupService(createUserRepository(users), passwordHasher, tokenIssuer);

    // Act
    const token = await signup.execute("ana@example.com", "secret123");

    // Assert
    assert.equal(users.length, 1);
    const [savedUser] = users;
    assert.equal(savedUser?.email, "ana@example.com");
    assert.equal(savedUser.passwordHash, "hashed:secret123");
    assert.equal(token, `token-for-${savedUser.id}`);
  });

  it("rejects an email that is already registered, without saving anything", async () => {
    const users = [new User("user-1", "ana@example.com", "hashed:secret123")];
    const signup = new SignupService(createUserRepository(users), passwordHasher, tokenIssuer);

    await assert.rejects(signup.execute("ana@example.com", "another-password"), EmailAlreadyRegisteredError);
    assert.equal(users.length, 1);
  });
});
