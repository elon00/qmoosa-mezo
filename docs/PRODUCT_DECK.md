# QMOOSA Mezo — Concept/Product Deck (DRAFT)

**For engineering review, not a live commercial offering.**

## 1. Market problem
AI agents and developers need auditable, low-friction pay-per-use services. Traditional subscriptions are poorly suited to intermittent, automated workloads.

## 2. Proposed product
A Mezo-native MUSD/x402 marketplace with transparent service pricing, authenticated authorization, durable receipts, real AI/provider execution, agent spending policies and optional ML-DSA off-chain attestations.

## 3. Current capabilities
- TypeScript/Express SDK integration and Mezo Testnet configuration.
- CI-only unpaid HTTP 402 challenge, health and catalog endpoints.
- Conway B3/S23 simulation, budget checks, QR parser/generator unit tests.
- Negative security tests enforcing disabled paid, settlement-consumption and PQC endpoints.

## 4. Explicit gaps
- No paid service is currently unlocked or charged by the public API.
- No independently proven order-bound MUSD settlement, replay-safe durable journal, provider outputs, or fully integrated post-quantum key management.
- REA/Raven source inspection and bench reports are not proof that their runtime executed.
- A dependency audit identified 19 high and 15 moderate vulnerabilities in the tested graph.
- No production, global legal or mainnet approval.

## 5. Engineering roadmap
See `docs/GLOBAL_PRODUCTION_BLUEPRINT.md` for concrete gates on payment, PQC, supply-chain, UX, reliability, compliance and independent verification.

## 6. Success measures
Verified legitimate payment completion and exactly-once fulfillment, failed fake/wrong-asset/replay payments, provider availability, p95 latency, incident response, conversion and user retention. Only measured results may be reported.
