/**
 * What the application offers to create a new account.
 *
 * This is a driving (inbound) port: the HTTP adapter depends on this
 * interface, so its tests can pass a simple fake instead of the real use case.
 */
export interface SignupUseCase {
  /**
   * @param email - The email for the new account.
   * @param password - The plain-text password the user chose.
   * @returns A token for the new user, so they are logged in right away.
   * @throws {EmailAlreadyRegisteredError} If an account with this email exists.
   */
  execute(email: string, password: string): Promise<string>;
}
