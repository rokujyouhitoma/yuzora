---
name: run-poc
description: Generate and run a Proof-of-Concept (PoC) script or test case to verify security vulnerabilities and validate remediation efficacy.
---
# run-poc

This skill dictates how to formulate, execute, and document a Proof-of-Concept (PoC) security test case to verify that a vulnerability exists and that a applied fix effectively mitigates it.

## Instructions

1. **Formulate PoC Exploit Vector**:
   - Construct a controlled test payload demonstrating the vulnerability (e.g., XSS string injection, prototype pollution payload, oversized file upload).

2. **Execute PoC Verification**:
   - Run the PoC against the unpatched code to confirm exploitability.
   - Apply the security patch/mitigation.
   - Re-run the PoC against the patched code to confirm that the vulnerability is completely neutralized (returns safe response / throws validation error / sanitizes output).

3. **Integrate into Automated Test Suite**:
   - Convert the PoC test case into a permanent unit test in `tests/unit/` to prevent regressions.

4. **Document PoC Verification**:
   - Record PoC execution results and mitigation proof in the issue file or walkthrough artifact.
