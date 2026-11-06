# QMOOSA Mezo — Global Product, Security and Production Blueprint

**Current release:** EVIDENCE_GATED. **Mainnet:** LOCKED. This document is an engineering plan, not a certification.

## Native architecture (Mezo Testnet only)
- Mezo EVM Testnet chain ID **31611** (`eip155:31611`), canonical MUSD 18-decimal asset.
- HTTP x402 challenge + merchant-only verification/settlement, no implicit payment receiver.
- Bazaar catalog -> authenticated order -> signed payment authorization -> facilitator verification -> on-chain finality -> atomic consumption -> real service provider response.
- Modules: `src/server.ts`, `src/x402/`, `src/agents/`, `src/wallet/`, `src/defi/`, `src/crypto/`, `src/core/conway.ts`.
- Separate namespaces for customer identity, payment orders, settlement proofs, service results, and audit events.

## Release trains and required gates

| Stage | Deliverable | Evidence to approve |
|---|---|---|
| R0 — Truth and safety | Disabled unsafe paths; truthful scorecards | Forged receipt/nonce negative tests; 503/403 routes; no fake PASS |
| R1 — Reproducibility | Locked Node 20/22, TS, Solidity and SDK builds | Clean `npm ci`, build, Lane 1/2, real CLI/CI logs, no skipped mandatory jobs |
| R2 — Supply chain | Dependency policy and SBOM | No unresolved high/critical advisories; CodeQL, secrets, licenses and SCA review |
| R3 — Payment security | Official x402 order-bound settlement | HTTP 402 -> signed authorization -> verified receipt -> delivery; wrong asset/chain/merchant/amount rejected |
| R4 — Replay correctness | Durable ACID journal with unique payment reference | Restart/parallel/concurrency tests, idempotent fulfillment, atomic transaction+order+log index |
| R5 — Authentic PQC | Reviewed ML-DSA-65 + secure key lifecycle | Pinned dependency, clean lockfile, NIST vectors, cross-implementation positive and tamper/replay negatives |
| R6 — Real AI/DeFi | Authenticated provider and genuine price/yield data | External source provenance, actual API response, no simulated return values |
| R7 — Agentics | Bounded actual REA/Raven with measured improvements | Pinned code, audited sandbox, stable baseline, independent evaluator, no unattended signing |
| R8 — Wallet UX | Multi-wallet and QR session binding | Correct recipient, asset, chain, exact amount, rejected wrong-network/wrong-recipient tests |
| R9 — Operations | SLOs, telemetry, recovery, key management | Logs without secrets, rollback drills, disaster recovery, budgets and abuse protection |
| R10 — Compliance | Privacy, financial crime controls and disclosures | Appropriate jurisdiction-specific counsel review; technical tests are NOT legal certification |
| R11 — Release | Independent audit + human approval | SHA-bound signed artifacts, verified testnet transaction receipts and explicit release authorization |

## Economic/security controls
- Use fixed decimal `bigint` amounts throughout payment settlement; never JavaScript floating-point conversions for authorization.
- Store order binding `chainId, asset, payTo, payer, resource, amountBaseUnits, nonce, expiry, txHash, logIndex`.
- Verify MUSD transfer/facilitator proof, finality and payment replay against the same pending order. The client must never select the minimum required amount or an arbitrary destination.
- Atomically mark payment consumed **with** exactly-once service fulfillment; persist receipt and service output keyed by order ID; never use a process-local Set for globally unique payments.
- Use authentication, authorization, rate limits, spending caps, prompt/data handling policies, breach response, and legal review before expanding beyond testnet.

## Required global production definition
`Certified = clean_build && executed_tests && security_clear && live_settlement_evidence && durable_replay_evidence && authentic_PQC_if_claimed && real_provider_evidence && operational_review && legal_review_if_applicable && release_approval`.

**A failed or unexecuted mandatory gate always means NOT CERTIFIED.** Existing security-blocking dependency alerts remain blockers even if the TypeScript build passes. No mainnet deploy, key access or funded transfer is authorized by this plan.

## Current blockers (as of November 7, 2026)
- `@noble/post-quantum` attempted integration previously missing a lockfile and legacy callers still expected `MLDSAEngine`.
- Real authenticated x402 service settlement and durable replay journal not yet implemented.
- No authenticated real AI provider or independent Raven/REA runtime execution evidence.
- Latest security job recorded **19 high** and **15 moderate** dependency advisories.
- User previously disclosed a private key in a separate deployment log: those credentials must be retired and never imported into this repository.
- Contract/SDK license and global privacy/financial regulations require appropriate professional review.

## Existing PR #1
PR #1 is a stale draft against older source. This work carries its legitimate fail-closed protections forward from the current `main` into a new draft PR. Do not merge the old PR blindly or equate a merged safety PR with market certification.
