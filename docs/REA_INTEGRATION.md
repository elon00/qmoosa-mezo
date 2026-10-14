# QMOOSA MEZO — REA Integration Document
**Tool:** REA (Reverse Engineer Anything)  
**Source Repository:** https://github.com/morluto/rea  
**Pinned Commit:** `a732c859ddd005a0179854897a645b531bf163d3`  
**License:** MIT License (Copyright 2026 morluto)  
**Version:** 6.5.0  

---

## 1. Role and Boundaries of REA
REA is an engineering inspection and software reverse-engineering tool. It is **NOT** the runtime payment processor and does **NOT** substitute for a functioning MUSD product or real Mezo blockchain settlement.

### Safe Sandboxing Rules
1. **Isolated Engineering Environment:** REA is cloned and referenced strictly within `sandbox/tools/rea`.
2. **Access Restrictions:** Access is limited to authorized inspection targets (such as validating contract bytecode interfaces, checking `@x402` SDK export structures, and auditing package distributions).
3. **No Secret Extraction:** REA is prohibited from inspecting environment files containing user credentials, private keys, or signing payloads.
4. **No Unrestricted System Access:** Execution occurs strictly with read-only analysis parameters.

---

## 2. Upstream Verification & Provenance
- Upstream Git Remote: `https://github.com/morluto/rea`
- Validated Commit SHA: `a732c859ddd005a0179854897a645b531bf163d3`
- MCP Specification Schema: `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`
- Package Identifier: `rea-agents@6.5.0`
- Transport Protocol: `stdio` (`npx rea-agents mcp`)

---

## 3. Analysis Evidence & Execution
REA analysis for this repository inspects:
1. `@x402/*` TypeScript types and export signatures.
2. Canonical MUSD token contract binary layout and standard ERC-20 method selectors (`0xa9059cbb`, `0x70a08231`, etc.).
3. Conway automaton transition matrix.

Evidence findings are serialized to `reports/REA_ANALYSIS.json`.
