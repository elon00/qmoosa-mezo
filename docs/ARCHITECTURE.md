# QMOOSA Mezo — Architecture (implemented versus target)

**Current stage: evidence-gated Mezo Testnet prototype. Mainnet: LOCKED.**

## Implemented, testable source
- Express HTTP server, health, and service catalog with explicit UNAVAILABLE statuses.
- x402 SDK resource-server setup; the unpaid 402 challenge is restricted to explicit CI smoke tests. No public paid routes.
- Mezo Testnet `eip155:31611` and canonical 18-decimal MUSD reference.
- Deterministic Conway B3/S23 automaton and in-memory agent policy unit tests.
- QR URI parsing/generation library with strict recipient and exact amount checks; public payment QR issuance disabled.
- Public settlement consumption/receipt enumeration and ML-DSA service endpoints fail closed.
- Read-only Lane 2 real Mezo RPC tests; they do not establish a paid transaction.

## Target architecture (not implemented as working end-to-end service)

```text
Buyer Wallet/Agent (authenticated)
  -> Service Order (server quote: resource, merchant, asset, amount, nonce, expiry)
  -> HTTP 402 Payment Required (official x402 EVM scheme)
  -> Wallet-signed authorization
  -> Authenticated facilitator verification and MUSD testnet settlement
  -> Independent chain receipt verification + finality
  -> Atomic PostgreSQL-backed consumption of order and receipt/log index
  -> Real AI/DeFi provider execution
  -> Idempotent fulfillment + private customer receipt
  -> Observability, refunds, operational review
```

## Security principles
- No source hash, response prefix, in-memory Set, HTTP status or mocked transfer counts as payment authorization.
- Store precise base-unit amounts using `bigint`, not floating-point comparisons.
- Bind payment to exact resource, price, merchant, chain, asset, signed payer and nonce.
- Keep REA/Raven isolated without wallet keys. Only audited, pinned execution may claim agent experiments.
- ML-DSA-65 must be a vetted, pinned algorithm with full NIST vectors and secure key lifecycle; never substitute HMAC.
- Detect/reject wrong network, token, amount, receiver, replay, reorg and concurrent requests.

## Releases and operations
Tests -> security review -> independent testnet settlement -> replay/rollback test -> privacy, consumer and regulatory review -> human approval. Mainnet requires a separate authorization, with no auto-spend.

See `docs/GLOBAL_PRODUCTION_BLUEPRINT.md`, `docs/GLOBAL_COMPLIANCE_CHECKLIST.md` and `SECURITY.md`.
