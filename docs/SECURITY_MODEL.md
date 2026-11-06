# Mezo security model — enforced boundaries

**State: EVIDENCE_GATED. Not globally production-ready. Mainnet locked.**

## High-priority threats and present controls

| Threat | Present release control | Missing production proof |
|---|---|---|
| Unauthenticated fake tx hash | Bazaar execute endpoint returns HTTP 503 | Real order-bound x402 authorization + delivered service |
| Receipt theft / replay across restarts | Public verify disabled (503), receipts listing denied (403) | Atomic durable unique ledger, replay/concurrency/restart tests |
| Incorrect MUSD amount/recipient | No public receipt consumption | Exact bigint validation of canonical MUSD, merchant, order and nonce |
| HMAC falsely labeled ML-DSA | Keygen/verify endpoints disabled (503) | Vetted ML-DSA-65 library, lockfile, known-answer vectors |
| Fake AI / oracle responses | Catalog execution rejects all paid calls | Real provider API, verified response, rate limits and budgets |
| Misleading "REA/Raven" evidence | Source hashes and unexecuted agent runs labeled NOT_VERIFIED | Pinned real runtime and independent evaluations |
| Unintended signing or deployment | No server-side signing keys | Manual separately approved mainnet launch |
| Exposed credentials | Environment variables only; no production secrets in repository | Review logs, key rotation and secret scanning |

## Minimum sign-off evidence
1. Commit-pinned clean install, TypeScript build, unit, negative, regression and network tests.
2. Non-forced, reviewed dependency remediation at high/critical severity; CodeQL/SAST.
3. Authenticated session-bound x402; successful testnet settlement and independently checked receipt.
4. Atomic exactly-once fulfillment tested under replay, parallel requests and restart.
5. Real provider execution, failure handling, abuse controls, logging, privacy disclosures and incident response.
6. External review, tested rollback, signed releases and explicit release approval.

No synthetic scores or read-only chain probes grant a production certification.
