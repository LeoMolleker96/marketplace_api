import type { User } from "../../../domain/entities/user.js";

/**
 * What the application needs from wherever users are stored.
 *
 * This is a driven (outbound) port: the application defines this interface,
 * and an adapter (e.g. the Drizzle/PostgreSQL one) implements it. Use cases
 * depend on this interface only, so they never know which database is used,
 * and tests can pass a simple in-memory fake instead.
 */
export interface UserRepository {
  /**
   * @param email - The email to look for.
   * @returns The user with that email, or `undefined` if there is none.
   */
  findByEmail(email: string): Promise<User | undefined>;

  /**
   * Stores a new user.
   *
   * @param user - The user to store.
   */
  save(user: User): Promise<void>;
}
