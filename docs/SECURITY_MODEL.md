# QMOOSA MEZO — Security Model & Threat Assessment
**Version:** 4.0.0  
**Classification:** Public Engineering Specification  
**Enforcement:** Zero-Mock Reality Engine • Fail-Closed Release Gate  

---

## 1. Threat Matrix & Defense-in-Depth

| Threat Vector | Attack Scenario | Mitigation Control | Verification Mechanism |
| :--- | :--- | :--- | :--- |
| **Replay Attacks** | Attacker re-submits a previously settled x402 payment payload to unlock multiple paid services. | Replay-resistant cache recording transaction hashes and nonces; single-use token invalidation. | Negative integration test verifying repeated submission failure (`Lane 1`). |
| **Tampered Authorization** | Attacker tampers with recipient (`payTo`), amount, or chain ID in challenge header. | Exact cryptographic verification matching payment authorization with server configuration. | Negative test verifying rejection of manipulated recipient or lower amount. |
| **False-Positive Settlement** | Unverified or failed transaction claimed as successful payment. | Verification against Mezo Testnet RPC / Facilitator settlement proof; strict check on `status == 1`. | Lane 2 external RPC confirmation. |
| **Agent Budget Exhaustion** | Autonomous AI agent enters infinite loop, draining user funds. | Server-side spending controller enforcing maximum per-request and per-day caps. | Agent spending limit unit and stress tests. |
| **Quantum Adversary** | Quantum computer executing Shor's algorithm to forge ECDSA signatures. | Post-quantum cryptographic authentication layer utilizing NIST FIPS 204 ML-DSA. | ML-DSA verification test vectors and tamper tests. |
| **Mainnet Premature Launch** | Inadvertent spending of real mainnet assets during development or testing. | Hardcoded `MAINNET_LOCKED = true` policy gate returning exit code 1 if mainnet RPC is targeted without authorization. | Reality release gate check. |

---

## 2. Agent Policy & Spending Guardrails
- **Per-Request Limit:** Default maximum 0.01 MUSD per transaction.
- **Daily Budget Cap:** Default maximum 1.0 MUSD per agent wallet per 24-hour sliding window.
- **High-Risk Operation Gate:** Any transaction exceeding budget or requesting administrative functions requires explicit out-of-band user approval.
- **Log Redaction:** All sensitive API keys, authorization signatures, and private credentials are automatically redacted before logging.

---

## 3. Cryptographic Hygiene
- Off-chain state transitions are canonically serialized using RFC 8785 JSON canonicalization.
- Hashes are computed using standard SHA-256 and Keccak-256.
- PQC keys follow NIST FIPS 204 parameter sets.
