# QMOOSA Mezo — Dependency and supply-chain register

**Status: BLOCKED. This table does not assert every installed dependency is safe.**

## Runtime dependencies
`@x402/core`, `@x402/evm`, `@x402/express`, `@x402/paywall`, `viem`, `express`, `dotenv`, and `qrcode` are declared in `package.json`. Reproducible versions and transitive dependencies are governed by `package-lock.json`.

## Current factual audit
GitHub Actions `npm audit --omit=dev --audit-level=high`, on the initial safety-remediation commit in November 2026, reported **19 high and 15 moderate** findings. The production dependency gate failed. It must not be bypassed with `|| true`, and `npm audit fix --force` may introduce breaking x402 compatibility changes.

## Remediation strategy
1. Regenerate the full dependency advisory tree and identify direct versus transitive ownership and affected methods.
2. Assess compatible `@x402/*` updates against Mezo Testnet support and its canonical settlement scheme.
3. Stage reviewed dependency + lockfile updates on a separate branch, not an unreviewed forced downgrade.
4. Run `npm ci`, TypeScript build, complete unit and negative tests, live read-only network tests, and an isolated end-to-end testnet settlement verification.
5. Remove unused packages only when features are safely disabled and no contract/API dependency remains.
6. Archive an SBOM and package/license review; require 0 unresolved release-blocking high/critical issues prior to certification.

## PQC dependency
The attempted `@noble/post-quantum` import on the prior mainline lacked a consistent dependency/lockfile and broke TypeScript CI. Cryptographic interfaces are disabled pending a reviewed, tested installation. No FIPS compliance is claimed.

## Scheduled monitoring
`.github/dependabot.yml` proposes reviewed security/dependency update PRs. `.github/workflows/codeql.yml` adds static analysis. Neither replaces independent review.
