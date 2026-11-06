/**
 * Production safety boundary: ML-DSA-65 is not enabled in this release.
 * Historical HMAC "ML-DSA" was not compliant. A subsequent attempted
 * @noble/post-quantum import lacked a lockfile dependency and broke CI.
 *
 * No signing or verification claim is permitted until a pinned, vetted
 * implementation is installed, tested using published NIST vectors,
 * and independently reviewed with durable nonce/key management.
 */
const UNSUPPORTED = "ML-DSA-65 DISABLED: no validated cryptographic provider, tests or key lifecycle";

export class MLDSAEngine {
  public static generateKeyPair(_algorithm: string = "ML-DSA-65"): never {
    throw new Error(UNSUPPORTED);
  }

  public static sign(..._args: unknown[]): never {
    throw new Error(UNSUPPORTED);
  }

  public static rotateKey(_keyId: string): never {
    throw new Error(UNSUPPORTED);
  }

  public static verify(_envelope: unknown): { valid: false; reason: string } {
    return { valid: false, reason: UNSUPPORTED };
  }

  public static resetReplayCache(): void {
    // No private key registry or replay cache exists in the disabled backend.
  }
}
