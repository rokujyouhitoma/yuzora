---
name: generate-security-audit-report
description: Compile a comprehensive security audit report detailing detected, mitigated, and verified vulnerabilities across the workspace.
---
# generate-security-audit-report

This skill dictates how to generate a formal Security Audit Report summarizing security scans, threat modeling updates, and vulnerability remediations in Yuzora.

## Instructions

1. **Gather Audit Metrics**:
   - Summarize security scanning results (`npm audit`, static checks).
   - Summarize threat modeling status in `docs/threat-modeling/comprehensive-threat-modeling.md`.
   - List all closed security issue files under `docs/issues/closed/` (e.g., Issue 005 XSS, Issue 006 XHTML XSS, Issue 007 CSP, Issue 082 Prototype Pollution, Issue 083 DoS limit).

2. **Structure Audit Report**:
   - Include Executive Summary, Scope, Methodology (STRIDE, CWE, CVSS), Scanned Components, Identified Risks, Remediations Applied, and Compliance/Verification Status.

3. **Verify Traceability Links**:
   - Ensure all fixed vulnerabilities link directly to closed issue files (`[Issue XXX](../issues/closed/XXX-....md)`).

4. **Output Report**:
   - Save the security audit report as a markdown document under `docs/references/` or `walkthrough.md`.
