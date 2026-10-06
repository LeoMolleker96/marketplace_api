/**
 * What the application needs to hash and check passwords.
 *
 * This is a driven (outbound) port: hashing needs a crypto library, which is
 * infrastructure, so the application only defines this interface and an
 * adapter implements it. Use case tests can pass a simple fake instead.
 */
export interface PasswordHasher {
  /**
   * Turns a plain-text password into a hash that is safe to store.
   * A new random salt is used each time, so the same password gives a
   * different hash every time.
   *
   * @param password - The plain-text password to hash.
   * @returns The hash, including the salt and settings needed to verify it later.
   */
  hash(password: string): Promise<string>;

  /**
   * Checks a plain-text password against a stored hash.
   *
   * Hashing is one-way: the hash can't be turned back into the password.
   * Instead, the password is hashed again (with the salt saved inside the
   * stored hash) and the two results are compared.
   *
   * @param password - The plain-text password the user typed.
   * @param hash - The hash stored for that user.
   * @returns `true` if the password matches the hash.
   */
  verify(password: string, hash: string): Promise<boolean>;
}
