import { SignJWT } from "jose";
import type { TokenIssuer } from "../../../application/ports/out/token-issuer.js";

/** How long a token is valid. Short-lived, so a stolen token stops working soon. */
const TOKEN_LIFETIME = "1h";

/**
 * Creates JWTs (JSON Web Tokens) with the `jose` library.
 *
 * This is a driven (outbound) adapter: it implements the `TokenIssuer` port.
 * A JWT is a small JSON payload (here: the user id and expiry time) plus a
 * signature made with the server's secret. Anyone can read the payload, but
 * only the server can create a valid signature, so it can't be faked or edited.
 */
export class JoseTokenIssuer implements TokenIssuer {
  private readonly secret: Uint8Array;

  /** @param secret - The signing secret (`JWT_SECRET`), at least 32 characters. */
  constructor(secret: string) {
    // jose needs the secret as bytes, not as a string.
    this.secret = new TextEncoder().encode(secret);
  }

  issue(userId: string): Promise<string> {
    return new SignJWT()
      .setProtectedHeader({ alg: "HS256" }) // HMAC-SHA256: signed and checked with the same secret
      .setSubject(userId) // "sub": who the token is about
      .setIssuedAt() // "iat": when it was created
      .setExpirationTime(TOKEN_LIFETIME) // "exp": when it stops being valid
      .sign(this.secret);
  }
}
