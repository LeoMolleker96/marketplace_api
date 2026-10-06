// Composition root: the only place that creates the adapters and connects
// them to the use cases (constructor injection). Everything else only knows
// interfaces (ports).
import { drizzle } from "drizzle-orm/node-postgres";
import { createAuthRouter } from "./features/auth/adapters/in/http/auth-router.js";
import { DrizzleUserRepository } from "./features/auth/adapters/out/persistence/drizzle-user-repository.js";
import { Argon2PasswordHasher } from "./features/auth/adapters/out/security/argon2-password-hasher.js";
import { JoseTokenIssuer } from "./features/auth/adapters/out/security/jose-token-issuer.js";
import { LoginService } from "./features/auth/application/services/login.service.js";
import { SignupService } from "./features/auth/application/services/signup.service.js";
import { DATABASE_URL, JWT_SECRET } from "./shared/config/env.js";
import { createApp } from "./shared/http/create-app.js";

const PORT = 3000;

// One database connection pool for the whole app. It connects lazily, on the first query.
const db = drizzle(DATABASE_URL);

// Adapters: created once and shared by both use cases.
const userRepository = new DrizzleUserRepository(db);
const passwordHasher = new Argon2PasswordHasher();
const tokenIssuer = new JoseTokenIssuer(JWT_SECRET);

const loginService = new LoginService(userRepository, passwordHasher, tokenIssuer);
const signupService = new SignupService(userRepository, passwordHasher, tokenIssuer);

const app = createApp(createAuthRouter(loginService, signupService));

// Express 5 calls this callback with an error if the server can't start
// (e.g. the port is already in use). Without this check that error would be
// swallowed silently, leaving a process that runs but doesn't serve anything.
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Server running at http://localhost:${PORT}`);
});
