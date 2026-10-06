import { ValidationError } from "../../../../../shared/http/validation-error.js";

/** Simple email check: "something@something.something" with no spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * DTO (Data Transfer Object) for the body of `POST /auth/login` and
 * `POST /auth/signup`: both receive `{ email, password }` with the same rules.
 *
 * A DTO describes the exact shape of data crossing a boundary, here the
 * JSON the Flutter app sends over HTTP. It lives in the HTTP adapter because
 * it is an HTTP concern: the business logic should never see raw request data.
 *
 * The constructor checks the fields, so an instance can only exist if it's valid.
 */
export class CredentialsDto {
  readonly email: string;
  /** The plain-text password as typed by the user. Never log or store it. */
  readonly password: string;

  /**
   * @param body - The parsed JSON body, typed `unknown` because it comes from the client.
   * @throws {ValidationError} If the body is not an object, or the email or password is missing or invalid.
   */
  constructor(body: unknown) {
    if (typeof body !== "object" || body === null) throw new ValidationError("Body must be a JSON object");

    // Safe cast: `body` is an object, and its fields stay `unknown` until checked below.
    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || email === "") throw new ValidationError("Email is required");
    if (!EMAIL_PATTERN.test(email)) throw new ValidationError("Email must be valid");
    if (typeof password !== "string" || password === "") throw new ValidationError("Password is required");

    this.email = email;
    this.password = password;
  }
}
