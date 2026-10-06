import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { UserRepository } from "../../../application/ports/out/user-repository.js";
import { User } from "../../../domain/entities/user.js";
import { users } from "./schema.js";

/**
 * Stores users in PostgreSQL using Drizzle.
 *
 * This is a driven (outbound) adapter: it implements the `UserRepository`
 * port. It translates between database rows and domain `User` entities, so
 * nothing outside this folder needs to know about tables or SQL.
 */
export class DrizzleUserRepository implements UserRepository {
  private readonly db: NodePgDatabase;

  /** @param db - The Drizzle connection, created once in `index.ts` and shared. */
  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // SELECT * FROM users WHERE email = $1 LIMIT 1
    // Drizzle sends `email` as a query parameter ($1), never pasted into the
    // SQL text, which is what prevents SQL injection.
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    const row = rows[0];
    if (row === undefined) return undefined;
    return new User(row.id, row.email, row.passwordHash);
  }

  async save(user: User): Promise<void> {
    // INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
    await this.db.insert(users).values({ id: user.id, email: user.email, passwordHash: user.passwordHash });
  }
}
