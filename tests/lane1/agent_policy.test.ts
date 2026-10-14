import test from "node:test";
import assert from "node:assert/strict";
import { AgentPolicyEngine } from "../../src/agents/policy.js";

test("LANE 1: Agent Policy — Enforces Per-Request Cap", () => {
  const engine = new AgentPolicyEngine();

  // Within cap ($0.005 <= $0.010)
  const validCheck = engine.evaluateSpend("agent_default", 0.005, "qmoosa-fast-inference");
  assert.equal(validCheck.approved, true);

  // Exceeds cap ($0.020 > $0.010)
  const invalidCheck = engine.evaluateSpend("agent_default", 0.020, "qmoosa-fast-inference");
  assert.equal(invalidCheck.approved, false);
  assert.match(invalidCheck.reason || "", /per-request cap/i);
});

test("LANE 1: Agent Policy — Enforces 24-Hour Sliding Daily Budget", () => {
  const engine = new AgentPolicyEngine();
  engine.registerPolicy({
    agentId: "agent_budget_tester",
    name: "Tester Agent",
    maxPerRequestMUSD: 0.10,
    maxDailyMUSD: 0.20,
    allowedServices: ["*"],
    requiresApprovalFor: []
  });

  // Transaction 1: $0.10 -> Allowed
  const tx1 = engine.evaluateSpend("agent_budget_tester", 0.10, "qmoosa-fast-inference");
  assert.equal(tx1.approved, true);
  engine.recordSpend("agent_budget_tester", 0.10, "qmoosa-fast-inference");

  // Transaction 2: $0.08 -> Allowed (total $0.18 <= $0.20)
  const tx2 = engine.evaluateSpend("agent_budget_tester", 0.08, "qmoosa-fast-inference");
  assert.equal(tx2.approved, true);
  engine.recordSpend("agent_budget_tester", 0.08, "qmoosa-fast-inference");

  // Transaction 3: $0.05 -> Rejected (0.18 + 0.05 = 0.23 > 0.20)
  const tx3 = engine.evaluateSpend("agent_budget_tester", 0.05, "qmoosa-fast-inference");
  assert.equal(tx3.approved, false);
  assert.match(tx3.reason || "", /exceed daily budget/i);
});

test("LANE 1: Agent Policy — Sensitive Operation Gate", () => {
  const engine = new AgentPolicyEngine();

  // Routine service call does not require manual approval
  const normal = engine.evaluateSpend("agent_default", 0.001, "qmoosa-fast-inference", "service_call");
  assert.equal(normal.approved, true);
  assert.equal(normal.requiresManualApproval, false);

  // High-risk vault deposit requires out-of-band approval
  const sensitive = engine.evaluateSpend("agent_default", 0.001, "qmoosa-fast-inference", "vault_deposit");
  assert.equal(sensitive.approved, false);
  assert.equal(sensitive.requiresManualApproval, true);
  assert.match(sensitive.reason || "", /requires explicit human/i);
});
