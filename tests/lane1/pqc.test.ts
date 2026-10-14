import test from "node:test";
import assert from "node:assert/strict";
import { MLDSAEngine } from "../../src/crypto/mldsa.js";

test("LANE 1: PQC — NIST FIPS 204 ML-DSA Key Generation", () => {
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");
  assert.ok(keyPair.keyId.startsWith("pqc_"));
  assert.equal(keyPair.algorithm, "ML-DSA-65");
  assert.equal(typeof keyPair.publicKey, "string");
  assert.equal(typeof keyPair.privateKey, "string");
  assert.equal(keyPair.publicKey.length, 128); // 64 bytes hex
  assert.equal(keyPair.privateKey.length, 128);
});

test("LANE 1: PQC — Sign & Verify Canonical Envelope", () => {
  MLDSAEngine.resetReplayCache();
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");

  const payload = {
    action: "AUTHORIZE_AI_AGENT",
    agentId: "agent_qmoosa_alpha",
    maxMUSD: "0.01",
    targetMerchant: "0xC3376296a18ef364eA19287203EEd7a87f18e738"
  };

  const envelope = MLDSAEngine.sign(keyPair, payload);
  assert.ok(envelope.signature);
  assert.ok(envelope.nonce);

  const verification = MLDSAEngine.verify(envelope);
  assert.equal(verification.valid, true);
  assert.equal(verification.keyId, keyPair.keyId);
});

test("LANE 1: Negative Test — PQC Tampered Payload Strictly Rejected", () => {
  MLDSAEngine.resetReplayCache();
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");

  const originalPayload = {
    action: "AUTHORIZE_AI_AGENT",
    agentId: "agent_qmoosa_alpha",
    maxMUSD: "0.01"
  };

  const envelope = MLDSAEngine.sign(keyPair, originalPayload);

  // Adversary tampers with maxMUSD from 0.01 to 1000.00
  const tamperedEnvelope = {
    ...envelope,
    payload: {
      ...originalPayload,
      maxMUSD: "1000.00"
    }
  };

  const result = MLDSAEngine.verify(tamperedEnvelope);
  assert.equal(result.valid, false);
  assert.match(result.reason || "", /Tampered/i);
});

test("LANE 1: Negative Test — PQC Signature Corrupted by Single Byte Rejected", () => {
  MLDSAEngine.resetReplayCache();
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");

  const envelope = MLDSAEngine.sign(keyPair, { test: "data" });
  
  // Flip last character of hex signature
  const lastChar = envelope.signature.slice(-1);
  const corruptedChar = lastChar === "a" ? "b" : "a";
  const corruptedEnvelope = {
    ...envelope,
    signature: envelope.signature.slice(0, -1) + corruptedChar
  };

  const result = MLDSAEngine.verify(corruptedEnvelope);
  assert.equal(result.valid, false);
  assert.match(result.reason || "", /Tampered/i);
});

test("LANE 1: Negative Test — PQC Replay Attack strictly Prevented", () => {
  MLDSAEngine.resetReplayCache();
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");

  const envelope = MLDSAEngine.sign(keyPair, { test: "replay_check" });

  // First verification must succeed
  const firstCheck = MLDSAEngine.verify(envelope);
  assert.equal(firstCheck.valid, true);

  // Second verification with identical nonce must fail
  const replayCheck = MLDSAEngine.verify(envelope);
  assert.equal(replayCheck.valid, false);
  assert.match(replayCheck.reason || "", /Replay attack detected/i);
});

test("LANE 1: PQC — Key Rotation Lifecycle", () => {
  const initialKey = MLDSAEngine.generateKeyPair("ML-DSA-65");
  const rotatedKey = MLDSAEngine.rotateKey(initialKey.keyId);

  assert.notEqual(initialKey.keyId, rotatedKey.keyId);
  assert.notEqual(initialKey.publicKey, rotatedKey.publicKey);
  assert.ok(initialKey.rotatedAt);
});
