---
name: run-security-scanner
description: Run security scanner and audit checks on workspace source files and dependencies to detect vulnerabilities (XSS, Prototype Pollution, DoS, Path Traversal, CSP bypass).
---
# run-security-scanner

This skill dictates how to perform static security scans and vulnerability analysis across Yuzora workspace source files, HTML, CSS, workflows, and dependencies.

## Instructions

1. **Dependency Audit**:
   - Run `npm audit --audit-level=high` to check for known high/critical CVEs in installed dependencies.
   - If any vulnerabilities are detected, analyze affected package versions and recommend update or replacement options.

2. **Static Code Vulnerability Checks**:
   - Scan JavaScript source files (`src/js/`) for common CWE vulnerability patterns:
     - **XSS (CWE-79)**: Check for unescaped `innerHTML`, template literals containing user inputs without HTML escaping, `javascript:` URLs, or dangerous script/iframe insertions.
     - **Prototype Pollution (CWE-1321)**: Check for un-sanitized bracket notation property assignment (`obj[key] = val`) or missing prototype pollution key checks (`__proto__`, `constructor`, `prototype`).
     - **Denial of Service (CWE-400)**: Check for missing file size pre-flight limits, unbounded regex matching (ReDoS), or synchronous blocking operations on large inputs.
     - **Path Traversal (CWE-22)**: Check for dynamic file path resolution with un-normalized user input.

3. **Content Security Policy & HTML Security Checks**:
   - Verify `index.html` and `compiled.html` `<meta http-equiv="Content-Security-Policy">` directive.
   - Ensure inline scripts (`'unsafe-inline'`) and external untrusted origins are blocked.

4. **Document Scanner Findings**:
   - Classify findings by CVSS / CWE severity (Critical, High, Medium, Low).
   - If vulnerabilities are found, create an issue file under `docs/issues/` using `create-issue` and update the threat model in `docs/threat-modeling/comprehensive-threat-modeling.md`.
