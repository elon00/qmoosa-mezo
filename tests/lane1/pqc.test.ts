import test from "node:test";
import assert from "node:assert/strict";
import { MLDSAEngine } from "../../src/crypto/mldsa.js";

test("PQC fail-closed: no unsupported cryptographic key generation", () => {
  assert.throws(() => MLDSAEngine.generateKeyPair("ML-DSA-65"), /DISABLED/);
});
test("PQC fail-closed: no unverified signing", () => {
  assert.throws(() => MLDSAEngine.sign(), /DISABLED/);
});
test("PQC fail-closed: arbitrary envelope never verifies", () => {
  assert.equal(MLDSAEngine.verify({}).valid, false);
});
test("PQC fail-closed: no unsafe key rotation", () => {
  assert.throws(() => MLDSAEngine.rotateKey("untrusted"), /DISABLED/);
});
