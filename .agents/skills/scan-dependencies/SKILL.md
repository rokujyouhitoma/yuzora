---
name: scan-dependencies
description: Validate package safety and run dependency vulnerability scanning before adding or updating npm packages.
---
# scan-dependencies

This skill dictates how to validate dependencies and verify package safety prior to adding, updating, or importing third-party packages in Yuzora.

## Instructions

1. **Pre-Import Package Validation**:
   - Check proposed package name, version, and license before adding to `package.json`.
   - Verify that the package does not introduce supply-chain vulnerabilities, malicious post-install scripts, or incompatible open-source licenses.

2. **Run Dependency Scan**:
   - Execute `npm audit` to check for known CVEs.
   - Check if the package relies on native C/C++ bindings or binary executables that violate client-side static application constraints.

3. **Client-Side Compatibility Verification**:
   - Ensure the package works in browser static SPA environment or JSDOM without requiring Node.js server runtime modules (`fs`, `net`, `child_process`).

4. **Record Approval**:
   - Document approved package version, hash/integrity, and security clearance in the implementation issue or ADR doc.
