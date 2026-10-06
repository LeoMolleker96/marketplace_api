/**
 * Settings read from environment variables (in development, from `.env`).
 *
 * They are read and checked once, when the app starts. A missing value stops
 * the app immediately with a clear message, instead of failing later on the
 * first database query or login.
 */

function readRequired(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") throw new Error(`Missing environment variable: ${name}`);
  return value;
}

/** PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/db`. */
export const DATABASE_URL = readRequired("DATABASE_URL");

/** Secret used to sign login tokens (JWT). Keep it private and at least 32 characters. */
export const JWT_SECRET = readRequired("JWT_SECRET");
