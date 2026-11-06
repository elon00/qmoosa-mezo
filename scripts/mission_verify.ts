/**
 * QMOOSA MEZO — Master Verification Pipeline (npm run mission:verify)
 * 
 * Executes full systematic engineering verification:
 * 1. Environment and dependency audit.
 * 2. Type checking and build verification.
 * 3. REA Evidence Inspection.
 * 4. Raven RSI Self-Improvement experiment & baseline benchmark.
 * 5. Lane 1: Deterministic unit & negative tests.
 * 6. Lane 2: Live Mezo Testnet & canonical MUSD contract verification.
 * 7. Reality Gate 100/100 readiness scorecard calculation.
 * 8. Replay resistance, PQC, and spending policy verification.
 * 
 * Exit Policy:
 * Exits with code 0 if and only if all mandatory gates pass and score is 100/100.
 * Exits with code 1 if any mandatory gate fails or is BLOCKED.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runREAAnalysis } from "./rea_analysis.js";
import { runRSIExperiment } from "./raven_experiment.js";
import { evaluateRealityGates } from "./reality_gate.js";

async function main() {
  console.log("==================================================================");
  console.log("   QMOOSA MEZO — MASTER MISSION VERIFICATION PIPELINE V4.0");
  console.log("   Zero-Mock Reality Engine • Target: 100/100 • Mainnet LOCKED");
  console.log("==================================================================\n");

  const startTime = Date.now();

  try {
    // Step 1: Execute REA Analysis
    console.log("--> [Step 1/5] Executing REA Code & Bytecode Analysis...");
    await runREAAnalysis();

    // Step 2: Execute Raven RSI Benchmark & Experiment
    console.log("\n--> [Step 2/5] Executing Raven RSI Benchmark & Experiment Protocol...");
    await runRSIExperiment();

    // Step 3: Run Lane 1 Unit Tests
    console.log("\n--> [Step 3/5] Running Lane 1 (Deterministic Unit & Negative Tests)...");
    execSync("npx tsx --test tests/lane1/*.test.ts", { stdio: "inherit" });

    // Step 4: Run Lane 2 Real Network Verification
    console.log("\n--> [Step 4/5] Running Lane 2 (Live Mezo Testnet & MUSD Token Verification)...");
    execSync("npx tsx --test tests/lane2/*.test.ts", { stdio: "inherit" });

    // Step 5: Evaluate Reality Gates & Compute Scorecard
    console.log("\n--> [Step 5/5] Evaluating Reality Gates & Final Buildathon Scorecard...");
    const scorecard = await evaluateRealityGates();

    const blocked = scorecard.gateResults.filter(g => g.status !== "PASS");
    const reportLines = [
      "# QMOOSA MEZO — Evidence-based readiness",
      "",
      `**Score: ${scorecard.totalScore}/${scorecard.maxScore} (internal only)**`,
      `**Release eligible: ${scorecard.releaseEligible ? "YES" : "NO"}**`,
      "**Mainnet: LOCKED**",
      "",
      "| Gate | Status | Points | Evidence required |",
      "|---|---|---:|---|",
      ...scorecard.gateResults.map(g =>
        `| ${g.gateId} | ${g.status} | ${g.awardedPoints}/${g.allocatedPoints} | ${g.status === "PASS" ? "Readiness verifier PASS" : "Independent execution and proof still required"} |`),
      "",
      `**Outstanding gates:** ${blocked.length}`,
      "",
      "This report is not an official Mezo judging score. Unit-test success is not proof of live MUSD settlement."
    ];
    fs.mkdirSync("reports", { recursive: true });
    fs.writeFileSync("reports/READINESS_SUMMARY.md", reportLines.join("\n") + "\n");
    for (const g of blocked) {
      console.error(`BLOCKED: ${g.gateId} (${g.allocatedPoints} points) — ${g.name}`);
    }
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nVerification pipeline completed in ${elapsedSeconds}s.`);

    if (scorecard.totalScore === scorecard.maxScore && scorecard.releaseEligible) {
      console.log("\n>>> MISSION COMPLETED SUCCESSFULLY — VERIFIED READINESS (100/100) <<<");
      console.log("All mandatory reality gates passed with authentic chain evidence.");
      console.log("Mainnet Policy: LOCKED (Awaiting separate independent release gate).\n");
      process.exit(0);
    } else {
      console.error("\n>>> MISSION PARTIALLY COMPLETED — BLOCKERS REMAIN <<<");
      console.error(`Current Score: ${scorecard.totalScore} / ${scorecard.maxScore}`);
      process.exit(1);
    }
  } catch (err: unknown) {
    console.error("\n>>> VERIFICATION HALTED DUE TO ERROR <<<");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
