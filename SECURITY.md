# Security Policy — QMOOSA Mezo

## Supported status
No globally production-certified release exists. The current testnet gateway and paid-service integration are EVIDENCE_GATED; mainnet operations are LOCKED.

## Reporting vulnerabilities
Use GitHub's **Report a vulnerability** private disclosure feature on this repository if available. Do not post exploit details, private keys, seed phrases, wallet signatures, personal data or credentials in public issues, PR comments or CI logs.

## Minimum response
- Acknowledge and triage reports privately when possible.
- Reproduce on an isolated environment, not a funded wallet.
- Fix on a dedicated branch with negative regression tests.
- Publish a verified advisory/release note after remediation.
- Rotate any disclosed credentials. Redacting a public log does not restore a compromised private key.

## Release-blocking examples
Unauthenticated paid service execution, replayable settlement, incorrect chain/recipient/asset/amount, crypto misrepresentation, secret disclosure, unresolved high/critical dependency advisories, or missing operational recovery evidence.

A green workflow is not a financial, legal, cryptographic or production certification.
