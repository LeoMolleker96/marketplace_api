/**
 * Thrown when data sent by the client is invalid.
 * The error handler in `create-app.ts` turns it into a 400 Bad Request response.
 */
export class ValidationError extends Error {
  override name = "ValidationError";
}
