# QMOOSA MEZO — Dependency Register
**Target:** 100/100 Internal Readiness  
**Audit Standard:** Supply Chain Integrity, License Compliance & Pinning  

---

## 1. Production Runtime Dependencies

| Package | Version Range | Installed | License | Purpose & Role |
| :--- | :--- | :--- | :--- | :--- |
| `@x402/core` | `^2.16.0` | `2.16.0` | MIT / Apache | Core x402 protocol interfaces, client/server models |
| `@x402/evm` | `^2.16.0` | `2.16.0` | MIT / Apache | ExactEvmScheme implementation, chain definitions |
| `@x402/express` | `^2.16.0` | `2.16.0` | MIT / Apache | Express middleware for payment intercept & challenge |
| `@x402/paywall` | `^2.16.0` | `2.16.0` | MIT / Apache | Paywall UI bundle with EVM network support |
| `express` | `^4.21.2` | `4.21.2` | MIT | Core HTTP application server |
| `viem` | `^2.23.0` | `2.23.0` | MIT | EVM interaction, typed contracts, RPC calls |
| `qrcode` | `^1.5.4` | `1.5.4` | MIT | QR code generation for mobile payments |
| `dotenv` | `^16.4.7` | `16.4.7` | BSD-2-Clause | Environment configuration management |

---

## 2. Developer & Verification Dependencies

| Package | Version Range | Installed | License | Purpose & Role |
| :--- | :--- | :--- | :--- | :--- |
| `typescript` | `^5.8.2` | `5.8.2` | Apache-2.0 | Type checking and compilation |
| `tsx` | `^4.19.3` | `4.19.3` | MIT | Fast TypeScript script execution |
| `@types/express` | `^4.17.21` | `4.17.21` | MIT | TypeScript type definitions for Express |
| `@types/node` | `^22.13.0` | `22.13.0` | MIT | TypeScript type definitions for Node.js runtime |
| `@types/qrcode` | `^1.5.5` | `1.5.5` | MIT | TypeScript type definitions for qrcode library |

---

## 3. Analysis & Self-Improvement Subsystems (Sandbox)

| Subsystem | Upstream Repository | Version | Commit SHA | License | Isolation Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REA Tools** | `morluto/rea` | `6.5.0` | `a732c859ddd005a0179854897a645b531bf163d3` | MIT | Read-Only MCP / Sandbox inspection |
| **Raven RSI** | `EverMind-AI/Raven` | `0.2.4` | `6b938a4267cb1f3bf1453a39ccc7d580e0eea9fd` | Apache-2.0 | Isolated Agent Sandbox, Proposal-only |

---

## 4. Supply Chain Security Verification
- **Vulnerability Audit:** Evaluated via continuous reality gate.
- **Transitive Lock:** Package-lock guarantees reproducible builds.
- **Credential Segregation:** No private signing keys or production API tokens are bundled into client distributions or committed to repository.
