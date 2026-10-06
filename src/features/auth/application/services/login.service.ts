import { InvalidCredentialsError } from "../invalid-credentials-error.js";
import type { LoginUseCase } from "../ports/in/login-use-case.js";
import type { PasswordHasher } from "../ports/out/password-hasher.js";
import type { TokenIssuer } from "../ports/out/token-issuer.js";
import type { UserRepository } from "../ports/out/user-repository.js";

/**
 * The login use case: checks the credentials and returns a token.
 *
 * It only talks to ports (interfaces), never to the database, Argon2, or JWT
 * directly. `index.ts` decides which adapters to pass in, and tests pass
 * simple in-memory fakes, so this logic is tested without any infrastructure.
 */
export class LoginService implements LoginUseCase {
  private readonly userRepository: UserRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly tokenIssuer: TokenIssuer;

  constructor(userRepository: UserRepository, passwordHasher: PasswordHasher, tokenIssuer: TokenIssuer) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenIssuer = tokenIssuer;
  }

  async execute(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (user === undefined) throw new InvalidCredentialsError();

    const passwordMatches = await this.passwordHasher.verify(password, user.passwordHash);
    if (!passwordMatches) throw new InvalidCredentialsError();

    return this.tokenIssuer.issue(user.id);
  }
}
