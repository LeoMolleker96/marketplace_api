/**
 * What the application needs to give a logged-in user a token.
 *
 * This is a driven (outbound) port: creating tokens needs a library (JWT),
 * which is infrastructure, so the application only defines this interface.
 */
export interface TokenIssuer {
  /**
   * @param userId - The id of the user who just logged in.
   * @returns A signed token the client sends back on later requests.
   */
  issue(userId: string): Promise<string>;
}
