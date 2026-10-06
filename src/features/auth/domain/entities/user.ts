/**
 * A registered user of the marketplace.
 *
 * This is a domain entity: an object with an identity (`id`) that stays the
 * same even if its other data changes. It is pure business code: no Express,
 * no database, no Node APIs, so it can be used and tested anywhere.
 */
export class User {
  readonly id: string;
  readonly email: string;
  /**
   * The hashed password, never the plain one. Hashing is one-way: if the
   * database leaks, the original passwords can't be read back.
   */
  readonly passwordHash: string;

  constructor(id: string, email: string, passwordHash: string) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
  }
}
