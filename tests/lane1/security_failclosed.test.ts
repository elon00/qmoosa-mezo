import test from "node:test";
import assert from "node:assert/strict";
import { MarketplaceManager } from "../../src/marketplace/catalog.js";
import { SettlementVerifier } from "../../src/x402/settlement.js";
import { AgentPolicyEngine } from "../../src/agents/policy.js";
import { QRPaymentEngine } from "../../src/wallet/qr.js";

test("Marketplace rejects plausible but unauthenticated settlement hashes", async () => {
  await assert.rejects(
    MarketplaceManager.executeService("qmoosa-fast-inference", "private request", "0x" + "a".repeat(64)),
    /PAID_SERVICE_DISABLED/
  );
  assert.ok(MarketplaceManager.listServices().every(s => (s as typeof s & {availability: string}).availability === "UNAVAILABLE"));
});
test("Settlement consumption is disabled despite a syntactically valid hash", async () => {
  const result = await SettlementVerifier.verifyOnChainSettlement("0x" + "a".repeat(64), "0x" + "b".repeat(40), 0.001);
  assert.equal(result.verified, false);
  assert.match(result.reason, /SETTLEMENT_DISABLED/);
  assert.deepEqual(SettlementVerifier.listReceipts(), []);
});
test("Agent policies deny unknown identity and invalid amounts", () => {
  const engine = new AgentPolicyEngine();
  assert.equal(engine.evaluateSpend("unknown", 0.001, "qmoosa-fast-inference").approved, false);
  assert.equal(engine.evaluateSpend("agent_default", Number.NaN, "qmoosa-fast-inference").approved, false);
  assert.equal(engine.evaluateSpend("agent_default", -1, "qmoosa-fast-inference").approved, false);
});
test("Payment QR engine rejects invalid recipients, zero and excess precision", () => {
  assert.throws(() => QRPaymentEngine.createPaymentURI("0x" + "0".repeat(40), "$0.001"), /Invalid recipient/);
  assert.throws(() => QRPaymentEngine.createPaymentURI("0x" + "a".repeat(40), "$0.000"), /positive/);
  assert.throws(() => QRPaymentEngine.createPaymentURI("0x" + "a".repeat(40), "$0.0000000000000000001"), /precision/);
});
