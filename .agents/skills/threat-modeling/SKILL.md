---
name: threat-modeling
description: Conduct a STRIDE-based threat modeling to identify security risks and design mitigations.
---
# threat-modeling

This skill dictates how to identify, analyze, and mitigate security risks systematically using the STRIDE model before implementing code changes.

## Instructions

1. **Map Data Flows (DFD)**:
   - Identify how data enters, flows through, is stored in, and leaves the application.
   - For Yuzora, pay close attention to:
     - **Inputs**: Drag & Drop text files, file picker inputs, predefined book fetching.
     - **Processing**: Text decoding (Shift_JIS/UTF-8), Aozora syntax parsers (ruby,改ページ,傍点).
     - **Storage**: LocalStorage read/write operations (bookmarks, UI configuration).
     - **Outputs**: Rendering text and HTML structures into the DOM.

2. **Analyze STRIDE Threats**:
   - For every component or flow identified in step 1, evaluate potential security threats using the STRIDE checklist:
     - **Spoofing**: Can someone spoof the source of books? (e.g. loading a malicious book payload from an external link).
     - **Tampering**: Can a user or a script modify the LocalStorage config/bookmark data to crash the app or inject HTML?
     - **Repudiation**: Can an action occur without verification? (Since there is no server, ensure local state integrity is verifiable).
     - **Information Disclosure**: Does the app leak book content or reading history to external servers? (Ensure zero outbound network requests).
     - **Denial of Service (DoS)**: Can a huge file or recursive HTML input freeze the browser during text parsing?
     - **Elevation of Privilege**: Can an attacker execute arbitrary JavaScript inside the application context? (XSS via Aozora text/XHTML parser).

3. **Design Security Mitigations**:
   - Define concrete code mitigations for each identified threat:
     - Use secure HTML escaping for raw text rendering.
     - Validate type, size, and bounds of inputs before processing.
     - Implement try-catch blocks and default rollbacks for LocalStorage parsing.
     - Establish size limits (e.g. 2MB max) for loaded files.

4. **Document and Integrate**:
   - Update [MNG-07-threat_modeling.md](../docs/MNG-07-threat_modeling.md) or the issue ticket's implementation plan with the threat modeling findings.
   - Explicitly list the security mitigations in the "実装方針 / Implementation Plan" section.
   - Add verification test cases for the security mitigations (e.g. trying XSS injection payloads) in the "完了条件 / Success Criteria (DoD)" section of the issue.
