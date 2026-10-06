/**
 * What the application offers to log a user in.
 *
 * This is a driving (inbound) port: the HTTP adapter depends on this
 * interface, not on the class that implements it, so its tests can pass a
 * simple fake instead of the real use case.
 */
export interface LoginUseCase {
  /**
   * @param email - The email the user typed.
   * @param password - The plain-text password the user typed.
   * @returns A token that proves who the user is on later requests.
   * @throws {InvalidCredentialsError} If the email or the password is wrong.
   */
  execute(email: string, password: string): Promise<string>;
}
