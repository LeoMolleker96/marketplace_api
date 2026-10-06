/**
 * Thrown when the email or password is wrong.
 *
 * Login uses the same error for "unknown email" and "wrong password" on
 * purpose: different errors would let anyone find out which emails are
 * registered. The HTTP adapter turns it into a 401 Unauthorized response.
 */
export class InvalidCredentialsError extends Error {
  override name = "InvalidCredentialsError";

  constructor() {
    super("Invalid email or password");
  }
}
