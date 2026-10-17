# Mezo integration truth and REA/Raven rollout

## Immediate security corrections

- Previous README 100/100 badge and generated GitHub Action score table claimed a score without independent evidence. Those statements have been withdrawn.
- Previous `reality_gate.ts` awarded multiple gates automatically for source file presence or static strings. New checker only awards read-only live RPC/contract points when verified. All payment, business, cryptography, wallet and submission gates remain BLOCKED until independently tested.
- `src/crypto/mldsa.ts` uses HMAC-SHA512, **not NIST FIPS 204 ML-DSA**. Do not use it for production PQC or claim quantum resistance. Its keygen/verify HTTP endpoints are disabled.
- Direct paid service endpoint previously accepted a client-provided receipt hash without independently confirming order-bound settlement; it is now disabled (503).
- Merchant `PAY_TO` must be supplied explicitly. No default financial recipient.
- REA wrapper only computes file hashes, not REA analysis. Raven wrapper only runs local benchmarks, not an actual Raven agent. Reports must not advertise real runtime execution.
- Unpinned best-effort `git clone ... || true` was removed from CI. `npm audit` is no longer suppressed.

## Path to real functionality (PRs required)

1. **Payment correctness:** using official x402 SDK, build a real isolated testnet end-to-end flow: unpaid HTTP 402, signed authorization, facilitator settlement, on-chain receipt, resource delivery and replay failure. Bind payment to exact merchant, resource, amount, order and nonce. Add transaction-proof artifacts from a trusted verifier.
2. **PQC:** replace the HMAC prototype with a vetted, supported FIPS 204 ML-DSA implementation. Use test vectors and tamper/expiry/replay tests; independently verify algorithm and key management.
3. **AI marketplace:** wire real provider APIs behind server-side secrets, rate limits and budgets. Paid resources must never return synthetic model results as real.
4. **REA:** review upstream license, releases and transitive dependencies, pin a commit, run its actual CLI/MCP in isolated read-only environment. Archive command, version, source revision and analysis findings.
5. **Raven:** pin and review upstream, run actual sandboxed agent orchestration with no wallets/secrets/mainnet keys. Fixed regression suite and evaluator independent of candidate agent. Archive before/after runs, cost and results. No autonomous security-policy changes.
6. **Release:** use protected PRs, independent review, no funded/mainnet transactions, and official Mezo testnet proof. Mainnet is always a separate manual approval.

## Evidence and scoring rules

- The official Mezo categories are 30/30/20/10/10, but detailed scores in this repo are internal estimates, not judges' results.
- A successful HTTP status from the facilitator is **not** a successful MUSD payment.
- A source hash is **not** a security audit, a generated benchmark is **not** Raven RSI, and HMAC is **not** ML-DSA.
- Live contract checks verify only chain/asset configuration.
- Missing or unsupported evidence produces BLOCKED, never PASS. An API URL or README cannot verify a payment.
- Treat this PR as safety remediation, **not a finished Mezo Buildathon submission**.

## References

- https://github.com/morluto/rea
- https://github.com/EverMind-AI/Raven
- https://testnet.mezo.org/docs/developers/getting-started/musd-payments-x402/x402-quickstart/

## Additional verified blockers (2026-10-15)
- GitHub security job on run 38717623827 failed `npm audit --omit=dev --audit-level=high`: 31 reported vulnerabilities (4 high, 27 moderate) in the tested dependency graph. Affected chains include `ws`, `uuid`, wallet SDK dependencies. Do not use `npm audit fix --force` without reviewing breaking versions, lockfile and regression tests.
- `SettlementVerifier` uses a process-local Set/Map to mark consumed transactions, not a durable database or atomic unique constraint. After restart, receipts can be reused. It also used floating point amounts. Real payment protection requires durable order-bound validation, exact bigint parsing, event/log-index uniqueness, and idempotent atomic fulfillment.
- A public `/api/settlement/verify` could consume arbitrary genuine transfer hashes; public `/api/receipts` could enumerate receipts. Endpoints are now restricted/disabled until authenticated, order-bound implementation exists.
- Zero-mock reality lane: do not award x402 settlement or replay points until cross-process restart/concurrency/replay negative cases pass with live testnet evidence.
