---
name: create-security-implementation-plan
description: Generate a security implementation and verification plan for fixing identified security vulnerabilities or adding security controls.
---
# create-security-implementation-plan

This skill dictates how to formulate a structured security implementation plan for addressing security risks, fixing CVE vulnerabilities, or implementing defense-in-depth security features in Yuzora.

## Instructions

1. **Vulnerability & Threat Context**:
   - Identify the target CWE / CVSS vulnerability, threat scenario (STRIDE), and affected components (e.g. parser, storage, renderer, workflow).

2. **Formulate Defense-in-Depth Plan**:
   - Outline primary defense (e.g., input sanitization, strict schema validation, pre-flight bounds check).
   - Outline secondary defense (e.g., CSP header enforcement, double-defense DOM sanitization, error boundary isolation).

3. **Define Verification Plan**:
   - Specify automated unit test payloads (e.g., XSS script vectors, prototype pollution keys, oversized file payloads).
   - Specify build/linter/scanner verification commands (`make`, `npm run test:unit`, `npm run test:types`, `npm run lint`).

4. **Document Plan**:
   - Record the security implementation plan in `implementation_plan.md` or the corresponding issue file under `docs/issues/`.
