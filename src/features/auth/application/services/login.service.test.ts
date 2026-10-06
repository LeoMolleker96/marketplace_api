import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { User } from "../../domain/entities/user.js";
import { InvalidCredentialsError } from "../invalid-credentials-error.js";
import type { PasswordHasher } from "../ports/out/password-hasher.js";
import type { TokenIssuer } from "../ports/out/token-issuer.js";
import type { UserRepository } from "../ports/out/user-repository.js";
import { LoginService } from "./login.service.js";

// This is where hexagonal architecture pays off: the use case is tested with
// tiny hand-written fakes of its ports. No database, no Argon2, no JWT.

const ANA = new User("user-1", "ana@example.com", "hashed:secret123");

/** Fake repository: finds users in a plain array instead of a database. */
const userRepository: UserRepository = {
  findByEmail: (email) => Promise.resolve([ANA].find((user) => user.email === email)),
  save: () => Promise.resolve(), // not used by login
};

/** Fake hasher: a "hash" is just the password with a "hashed:" prefix. */
const passwordHasher: PasswordHasher = {
  hash: (password) => Promise.resolve(`hashed:${password}`), // not used by login
  verify: (password, hash) => Promise.resolve(hash === `hashed:${password}`),
};

/** Fake token issuer: returns a predictable token. */
const tokenIssuer: TokenIssuer = {
  issue: (userId) => Promise.resolve(`token-for-${userId}`),
};

describe("LoginService", () => {
  it("returns a token for the right email and password", async () => {
    // Arrange
    const login = new LoginService(userRepository, passwordHasher, tokenIssuer);

    // Act
    const token = await login.execute("ana@example.com", "secret123");

    // Assert
    assert.equal(token, "token-for-user-1");
  });

  it("rejects an email that isn't registered", async () => {
    const login = new LoginService(userRepository, passwordHasher, tokenIssuer);

    await assert.rejects(login.execute("nobody@example.com", "secret123"), InvalidCredentialsError);
  });

  it("rejects a wrong password", async () => {
    const login = new LoginService(userRepository, passwordHasher, tokenIssuer);

    await assert.rejects(login.execute("ana@example.com", "wrong-password"), InvalidCredentialsError);
  });
});
