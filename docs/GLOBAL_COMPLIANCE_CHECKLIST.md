# Global market and compliance readiness — assessment checklist

**This is an engineering checklist, not legal advice or legal certification.**

The jurisdiction of the merchant, customer, facilitator, asset and service affects applicable obligations. No AML/sanctions/KYC, privacy or registration gate is declared PASS merely because example source code or test scripts exist.

## Required before commercial launch
1. Identify the contracting legal entity, merchant-of-record, treasury, beneficial ownership and supported countries.
2. Obtain qualified jurisdiction-specific advice on virtual-asset services, money transmission, consumer protection, taxation and disclosures.
3. Define sanctions/AML screening and escalation where applicable, with independent tests and documented procedures.
4. Publish an accurate privacy policy (personal data flows, controller/processor roles, data retention, deletion, cross-border transfers) and complete a DPIA when required.
5. Establish terms, acceptable-use rules, customer support, refunds/failed settlement handling, incidents and dispute resolution.
6. Verify third-party licenses and permission to use model/provider outputs, wallet SDKs, upstream REA/Raven, and datasets.
7. Record threat model, penetration test, accessibility review (WCAG 2.2 where applicable), usability testing, monitoring and recovery plans.
8. Conduct independent security assessment and capture explicit management approval prior to production; mainnet authorization is separate.

## Evidence fields
`owner | jurisdiction | control_id | risk | required_evidence | verifier | SHA | executed_at | status | exceptions | approval`.

Use `NOT_VERIFIED` for unexecuted tests; fail closed on production gates.
