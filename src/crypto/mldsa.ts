import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

export class SovereignMLDSA65 {
  static keygen(seed?: Uint8Array) {
    const keys = ml_dsa65.keygen(seed);
    if (keys.publicKey.length !== 1952 || keys.secretKey.length !== 4032) {
      throw new Error('Invalid NIST ML-DSA-65 key dimensions');
    }
    return {
      publicKey: Buffer.from(keys.publicKey).toString('hex'),
      secretKey: Buffer.from(keys.secretKey).toString('hex')
    };
  }

  static sign(message: Uint8Array, secretKeyHex: string): string {
    const sk = Uint8Array.from(Buffer.from(secretKeyHex, 'hex'));
    const sig = ml_dsa65.sign(message, sk);
    if (sig.length !== 3309) throw new Error('Invalid ML-DSA-65 signature length');
    return Buffer.from(sig).toString('hex');
  }

  static verify(signatureHex: string, message: Uint8Array, publicKeyHex: string): boolean {
    try {
      const sig = Uint8Array.from(Buffer.from(signatureHex, 'hex'));
      const pk = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'));
      return ml_dsa65.verify(sig, message, pk);
    } catch {
      return false;
    }
  }
}
