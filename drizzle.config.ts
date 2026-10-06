// Configuration for drizzle-kit, the CLI that creates and applies migrations.
// drizzle-kit requires a default export here.
import { defineConfig } from "drizzle-kit";

// Loads `.env` into process.env (built into Node, no package needed).
process.loadEnvFile();

export default defineConfig({
  dialect: "postgresql",
  // Where the tables are described.
  schema: "./src/features/auth/adapters/out/persistence/schema.ts",
  // Where the generated SQL migration files are written (commit them).
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
