import * as argon2 from "@node-rs/argon2";
import type { PasswordHasher } from "../../../application/ports/out/password-hasher.js";

/**
 * Hashes and checks passwords with Argon2id, the algorithm OWASP recommends first.
 *
 * This is a driven (outbound) adapter: it implements the `PasswordHasher`
 * port with the `@node-rs/argon2` library. A stored hash looks like
 * `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`: it contains the algorithm,
 * its settings, and the salt, which is everything needed to verify a password.
 */
export class Argon2PasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    // Uses the library's defaults: Argon2id with OWASP's recommended settings.
    return argon2.hash(password);
  }

  verify(password: string, hash: string): Promise<boolean> {
    // Note the library's argument order is (hash, password).
    return argon2.verify(hash, password);
  }
}
