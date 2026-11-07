# QMOOSA Mezo — Buildathon submission DRAFT (not certified)

**Status: DRAFT, EVIDENCE_GATED.** Earlier 100/100 and "fully functional" assertions are withdrawn.

## Problem and proposed product
Autonomous AI tools need granular paid access with transparent authorization, identity and receipts. This project explores an MUSD/x402 agent-service marketplace on Mezo Testnet (`eip155:31611`).

## Verified engineering scope to date
- Mezo Testnet configuration and canonical MUSD contract reference.
- A test-only x402 HTTP 402 challenge probe, using official SDK interfaces.
- Conway cellular automaton and agent budget-policy unit tests.
- TypeScript build, Node 20/22 Lane 1 and Lane 2 checks on the current PR.
- Source-level security findings documented; fail-closed paid and PQC routes.

## Not yet delivered (release blockers)
- Authenticated merchant order lifecycle, durable replay-resistant x402 settlement, on-chain receipt proof, exactly-once fulfillment.
- Actual AI inference / DeFi analytics providers and correct dynamic responses.
- Vetted ML-DSA-65 key lifecycle with lockfile, vectors and negative tests.
- Actual Raven RSI/REA execution, measured experiments, usable wallet UX and real purchase proof.
- Clean dependency audit (19 high, 15 moderate on November 6), independent audit and operational/legal approval.

## Release policy
Do not claim an eligible official judging score or production certification. Mainnet is locked. See `docs/GLOBAL_PRODUCTION_BLUEPRINT.md`, `SECURITY.md` and GitHub Actions results for SHA-bound evidence.
