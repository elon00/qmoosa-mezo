import test from "node:test";
import assert from "node:assert/strict";
import { CellularAutomaton, TransactionStateMachine, TxState } from "../../src/core/conway.js";

test("LANE 1: Conway B3/S23 Blinker Oscillation (Period 2)", () => {
  const automaton = new CellularAutomaton(5, 5);
  // Center horizontal blinker at row 2: cols 1, 2, 3
  automaton.seedPattern("blinker", 2, 1);
  assert.equal(automaton.getLiveCellCount(), 3);
  assert.equal(automaton.grid[2][1], 1);
  assert.equal(automaton.grid[2][2], 1);
  assert.equal(automaton.grid[2][3], 1);

  // Step 1: turns vertical (row 1, 2, 3 at col 2)
  automaton.step();
  assert.equal(automaton.getLiveCellCount(), 3);
  assert.equal(automaton.grid[1][2], 1);
  assert.equal(automaton.grid[2][2], 1);
  assert.equal(automaton.grid[3][2], 1);
  assert.equal(automaton.grid[2][1], 0);
  assert.equal(automaton.grid[2][3], 0);

  // Step 2: returns horizontal
  automaton.step();
  assert.equal(automaton.getLiveCellCount(), 3);
  assert.equal(automaton.grid[2][1], 1);
  assert.equal(automaton.grid[2][2], 1);
  assert.equal(automaton.grid[2][3], 1);
});

test("LANE 1: Conway Deterministic Entropy Hash Reproducibility", () => {
  const simA = new CellularAutomaton(8, 8);
  const simB = new CellularAutomaton(8, 8);

  simA.seedPattern("glider", 1, 1);
  simB.seedPattern("glider", 1, 1);

  assert.equal(simA.getEntropyHash(), simB.getEntropyHash());

  simA.step();
  simB.step();

  assert.equal(simA.getEntropyHash(), simB.getEntropyHash());
});

test("LANE 1: Transaction State Machine — Valid Sequential Lifecycle", () => {
  const intent = TransactionStateMachine.createIntent(
    "0x1111111111111111111111111111111111111111",
    "0xC3376296a18ef364eA19287203EEd7a87f18e738",
    "$0.001",
    "qmoosa-fast-inference"
  );

  assert.equal(intent.state, "CREATED");

  TransactionStateMachine.transition(intent, "VALIDATED", "Format check passed");
  assert.equal(intent.state, "VALIDATED");

  TransactionStateMachine.transition(intent, "AUTHORIZATION_REQUIRED", "x402 402 challenge issued");
  assert.equal(intent.state, "AUTHORIZATION_REQUIRED");

  TransactionStateMachine.transition(intent, "AUTHORIZED", "Buyer signed authorization");
  assert.equal(intent.state, "AUTHORIZED");

  TransactionStateMachine.transition(intent, "SETTLING", "Submitted to facilitator");
  assert.equal(intent.state, "SETTLING");

  TransactionStateMachine.transition(intent, "SETTLED", "Facilitator confirmed on-chain", {
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  });
  assert.equal(intent.state, "SETTLED");
  assert.ok(intent.settlementTxHash);

  TransactionStateMachine.transition(intent, "EXECUTING", "Invoking AI service");
  assert.equal(intent.state, "EXECUTING");

  TransactionStateMachine.transition(intent, "VERIFIED", "Service output delivered to user");
  assert.equal(intent.state, "VERIFIED");
  assert.equal(intent.history.length, 8);
});

test("LANE 1: Negative Test — Illegal State Transition Rejected", () => {
  const intent = TransactionStateMachine.createIntent(
    "0x1111111111111111111111111111111111111111",
    "0xC3376296a18ef364eA19287203EEd7a87f18e738",
    "$0.001",
    "qmoosa-fast-inference"
  );

  assert.throws(
    () => {
      // Cannot jump from CREATED directly to SETTLED
      TransactionStateMachine.transition(intent, "SETTLED");
    },
    /Illegal state transition/,
    "Skipping authorization must be strictly rejected"
  );

  assert.throws(
    () => {
      // Cannot jump from CREATED directly to VERIFIED
      TransactionStateMachine.transition(intent, "VERIFIED");
    },
    /Illegal state transition/,
    "Direct verification without payment must be strictly rejected"
  );
});

test("LANE 1: Transaction State Machine — Replay Verification", () => {
  const intent = TransactionStateMachine.createIntent(
    "0x1111111111111111111111111111111111111111",
    "0xC3376296a18ef364eA19287203EEd7a87f18e738",
    "$0.001",
    "qmoosa-fast-inference"
  );

  TransactionStateMachine.transition(intent, "VALIDATED", "Format valid");
  TransactionStateMachine.transition(intent, "AUTHORIZATION_REQUIRED", "x402 challenge");

  const historyToReplay = intent.history.slice(1); // skip initial CREATED
  const freshIntent = TransactionStateMachine.createIntent(
    intent.buyer,
    intent.merchant,
    intent.amount,
    intent.serviceId
  );

  const replayed = TransactionStateMachine.replayEvents(freshIntent, historyToReplay);
  assert.equal(replayed.state, "AUTHORIZATION_REQUIRED");
});
