---
name: polish-backlog
description: Refine and polish a backlog file in the docs/backlogs/ directory to move it from Draft to Approved.
---
# polish-backlog

This skill guides the agent in refining a raw backlog item into a polished, approved feature candidate before it gets promoted to an active issue.

## Instructions

1. **Investigate Codebase & Requirements**:
   - Research the technical feasibility, target files, and potential dependencies.
   - Consult design docs and guidelines to identify potential integration side effects or architectural impacts.
   - Define the key user experience (UX) and design choices (e.g. alignment with the client-side serverless model in `MNG-00`).

2. **Establish Design Approach**:
   - Outline the design approach and sequence flow in the backlog file.
   - List the target files or components that are likely to be affected under Section 2 (影響範囲と関連ファイル).

3. **Define Requirements & Technical Details**:
   - Detail the requirements and tentative implementation steps in the backlog file.
   - Highlight any security requirements (e.g. data handling, sanitization) or performance considerations (e.g. script load times, rendering performance).

4. **Define Acceptance Criteria (DoD)**:
   - Specify high-level success criteria and verification methods (e.g. expected behavior, UI responsiveness, test scenarios to cover).

5. **Update Backlog Status & Ledger**:
   - Update the `ステータス` field in the metadata block at the top of the backlog file to `Approved`.
   - Open [docs/backlogs/README.md](README.md) (Backlog台帳).
   - Update the status of the polished backlog item to `Approved` to indicate it is ready to be promoted to an issue when scheduled.
