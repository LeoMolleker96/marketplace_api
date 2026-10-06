/**
 * Thrown when someone signs up with an email that already has an account.
 * The HTTP adapter turns it into a 409 Conflict response.
 */
export class EmailAlreadyRegisteredError extends Error {
  override name = "EmailAlreadyRegisteredError";

  constructor() {
    super("Email is already registered");
  }
}
