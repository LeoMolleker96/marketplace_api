import { User } from "../../domain/entities/user.js";
import { EmailAlreadyRegisteredError } from "../email-already-registered-error.js";
import type { SignupUseCase } from "../ports/in/signup-use-case.js";
import type { PasswordHasher } from "../ports/out/password-hasher.js";
import type { TokenIssuer } from "../ports/out/token-issuer.js";
import type { UserRepository } from "../ports/out/user-repository.js";

/**
 * The signup use case: creates a user and returns a token for them.
 *
 * Like `LoginService`, it only talks to ports, so it's tested with simple
 * in-memory fakes and no database.
 */
export class SignupService implements SignupUseCase {
  private readonly userRepository: UserRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly tokenIssuer: TokenIssuer;

  constructor(userRepository: UserRepository, passwordHasher: PasswordHasher, tokenIssuer: TokenIssuer) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenIssuer = tokenIssuer;
  }

  async execute(email: string, password: string): Promise<string> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser !== undefined) throw new EmailAlreadyRegisteredError();

    // Only the hash is stored, never the plain password.
    const passwordHash = await this.passwordHasher.hash(password);
    // `crypto.randomUUID()` is a standard global (also in browsers), so no
    // import from Node is needed. UUIDs are random and practically never repeat.
    const user = new User(crypto.randomUUID(), email, passwordHash);
    await this.userRepository.save(user);

    return this.tokenIssuer.issue(user.id);
  }
}
