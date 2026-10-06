import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { User } from "../../../domain/entities/user.js";
import { DrizzleUserRepository } from "./drizzle-user-repository.js";
import { users } from "./schema.js";

// Adapter test against a real PostgreSQL database (see README: Database).
// `npm test` doesn't load `.env`, so these tests are skipped there.
// `npm run test:db` loads `.env` and runs them against the Docker database.
const DATABASE_URL = process.env.DATABASE_URL;

describe("DrizzleUserRepository", { skip: DATABASE_URL === undefined && "needs a database: run `npm run test:db`" }, () => {
  // Safe: this block only runs when DATABASE_URL is set (see `skip` above).
  const db = drizzle(DATABASE_URL ?? "");
  const repository = new DrizzleUserRepository(db);

  before(async () => {
    // Make sure the `users` table exists by applying the migrations.
    await migrate(db, { migrationsFolder: "drizzle" });
  });

  after(async () => {
    // Close the connection pool, otherwise the test process never exits.
    await db.$client.end();
  });

  it("finds a user by email", async () => {
    // Arrange: each test inserts its own row and removes it at the end,
    // so tests don't depend on each other or on existing data.
    const id = crypto.randomUUID();
    const email = `${id}@example.com`;
    await db.insert(users).values({ id, email, passwordHash: "hashed-password" });

    try {
      // Act
      const user = await repository.findByEmail(email);

      // Assert
      assert.deepEqual(user, new User(id, email, "hashed-password"));
    } finally {
      await db.delete(users).where(eq(users.id, id));
    }
  });

  it("returns undefined when no user has that email", async () => {
    const user = await repository.findByEmail(`${crypto.randomUUID()}@example.com`);

    assert.equal(user, undefined);
  });

  it("saves a user that can then be found by email", async () => {
    // Arrange
    const id = crypto.randomUUID();
    const user = new User(id, `${id}@example.com`, "hashed-password");

    try {
      // Act
      await repository.save(user);

      // Assert
      assert.deepEqual(await repository.findByEmail(user.email), user);
    } finally {
      await db.delete(users).where(eq(users.id, id));
    }
  });
});
