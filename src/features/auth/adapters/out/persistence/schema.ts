import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/**
 * The `users` table, described in TypeScript.
 *
 * Drizzle uses this to build type-safe queries, and `drizzle-kit generate`
 * compares it with previous migrations to write the SQL that creates or
 * changes the table. It belongs to the persistence adapter: the domain's
 * `User` entity knows nothing about tables or columns.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  // Unique: login finds a user by email, so two users can't share one.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
