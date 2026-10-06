import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CredentialsDto } from "./credentials.dto.js";

// Plain unit tests: the DTO only depends on its input, so there is no
// server, database, or mock involved.
describe("CredentialsDto", () => {
  it("is created from a valid email and password", () => {
    // Arrange
    const body = { email: "ana@example.com", password: "secret123" };

    // Act
    const dto = new CredentialsDto(body);

    // Assert
    assert.equal(dto.email, "ana@example.com");
    assert.equal(dto.password, "secret123");
  });

  it("requires the email when it is missing", () => {
    assert.throws(() => new CredentialsDto({ password: "secret123" }), {
      name: "ValidationError",
      message: "Email is required",
    });
  });

  it("requires the email when it is empty", () => {
    assert.throws(() => new CredentialsDto({ email: "", password: "secret123" }), {
      name: "ValidationError",
      message: "Email is required",
    });
  });

  it("requires the email when it is not a string", () => {
    assert.throws(() => new CredentialsDto({ email: 123, password: "secret123" }), {
      name: "ValidationError",
      message: "Email is required",
    });
  });

  it("rejects a body that is not an object", () => {
    assert.throws(() => new CredentialsDto(undefined), {
      name: "ValidationError",
      message: "Body must be a JSON object",
    });
  });

  for (const email of ["ana", "ana@example", "@example.com", "ana maria@example.com"]) {
    it(`rejects an invalid email: "${email}"`, () => {
      assert.throws(() => new CredentialsDto({ email, password: "secret123" }), {
        name: "ValidationError",
        message: "Email must be valid",
      });
    });
  }

  it("requires the password when it is missing", () => {
    assert.throws(() => new CredentialsDto({ email: "ana@example.com" }), {
      name: "ValidationError",
      message: "Password is required",
    });
  });

  it("requires the password when it is empty", () => {
    assert.throws(() => new CredentialsDto({ email: "ana@example.com", password: "" }), {
      name: "ValidationError",
      message: "Password is required",
    });
  });
});
