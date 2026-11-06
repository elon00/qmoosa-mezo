import test from "node:test";
import assert from "node:assert/strict";

test("Public HTTP endpoints reject forged payment, receipt consumption, and PQC signing", async () => {
  // Test merchant is a discard-only address; no signing or real payments occur.
  process.env.NODE_ENV = "test";
  process.env.PAY_TO = "0x000000000000000000000000000000000000dEaD";
  const { app } = await import("../../src/server.js");
  const server = app.listen(0);
  try {
    const a = server.address();
    assert.ok(a && typeof a !== "string");
    const host = "http://127.0.0.1:" + a.port;
    const json = { "Content-Type": "application/json" };
    const forged = await fetch(host + "/api/bazaar/qmoosa-fast-inference/execute", {
      method: "POST", headers: json,
      body: JSON.stringify({ prompt: "unpaid", receiptTxHash: "0x" + "a".repeat(64) })
    });
    assert.equal(forged.status, 503);
    const receipts = await fetch(host + "/api/receipts");
    assert.equal(receipts.status, 403);
    const settlement = await fetch(host + "/api/settlement/verify", { method: "POST", headers: json, body: "{}" });
    assert.equal(settlement.status, 503);
    const pqc = await fetch(host + "/api/pqc/keygen", { method: "POST" });
    assert.equal(pqc.status, 503);
    const hackedQR = await fetch(host + "/api/qr/generate?recipient=0x" + "b".repeat(40));
    assert.equal(hackedQR.status, 400);
    const hackedPrice = await fetch(host + "/api/qr/generate?amount=%240.00001");
    assert.equal(hackedPrice.status, 400);
    const health = await fetch(host + "/health");
    assert.equal(health.status, 200);
    const body = await health.json() as { productionCertified?: boolean; mainnet?: string };
    assert.equal(body.productionCertified, false);
    assert.equal(body.mainnet, "LOCKED");
  } finally {
    await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  }
});
