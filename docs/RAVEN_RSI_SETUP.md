# QMOOSA MEZO — Raven RSI Setup & Isolation Architecture
**Tool:** Raven (Recursive Self-Improvement & Multi-Agent Framework)  
**Source Repository:** https://github.com/EverMind-AI/Raven  
**Documentation:** https://evermind-ai.github.io/Raven/  
**Pinned Commit:** `6b938a4267cb1f3bf1453a39ccc7d580e0eea9fd`  
**License:** Apache License 2.0  
**Version:** 0.2.4  

---

## 1. Safety and Pre-Alpha Isolation Policy
Raven is treated as experimental pre-alpha software:
1. **Isolated Sandbox:** Cloned into `sandbox/tools/raven`.
2. **Credential Firewalls:** Production funds, wallet signing keys, and privileged deployment tokens are physically isolated outside Raven's access boundary.
3. **Proposal-Only Permissions:** Raven is restricted to read-only research and proposal-only code patches.
4. **Immutable Benchmark Guarantee:** Raven must **never** modify its own acceptance criteria, gate thresholds, evidence records, or release permissions to make an experiment appear successful.

---

## 2. Specialized Multi-Agent Roster

| Agent Role | Scope & Responsibility | Permissions |
| :--- | :--- | :--- |
| **Research Agent** | Find official sources, Mezo testnet RPC status, x402 protocol specifications, and upstream issues. | Read-Only |
| **Code Agent** | Implement narrowly scoped changes from approved task specifications. | Proposal Only |
| **Test Agent** | Execute unit and real integration tests without rewriting expected results. | Execution Only |
| **Security Agent** | Review permissions, secrets, authentication, supply chain, and transaction safety. | Audit & Report |
| **Mezo Agent** | Verify network configuration (Chain 31611), canonical MUSD token, x402 requests, and on-chain explorer evidence. | RPC Verification |
| **PQC Agent** | Verify NIST FIPS 204 ML-DSA signatures, known-answer tests, and tamper rejection. | Cryptographic Verification |
| **On-Call Agent** | Triage failures, prepare minimal patches, and request review for risky changes. | Triage & Patch |
| **Independent Evaluation Agent** | Evaluate every RSI candidate against immutable benchmarks and unmodified security rules. | Benchmark Evaluation |

---

## 3. RSI Self-Improvement Protocol
All autonomous improvements follow the scientific protocol declared in `docs/RSI_EXPERIMENT_PROTOCOL.md`:
- Falsifiable hypothesis definition.
- Predeclared evaluation metrics.
- Frozen evaluation datasets.
- Pre- and post-patch benchmark comparison.
- Regressions rejected even if a single headline metric improves.
