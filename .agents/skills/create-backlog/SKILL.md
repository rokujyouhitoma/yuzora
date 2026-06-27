---
name: create-backlog
description: Register a new backlog item under the docs/REQ-04-backlog.md file in the workspace.
---
# create-backlog

This skill dictates how to register a new backlog item in the Backlog Registry (`docs/REQ-04-backlog.md`) systematically.

## Instructions

1. **Check Existing Backlog Items**:
   - List the files under `docs/backlogs/` to find the next sequential number.
   - If no backlogs exist, the first backlog will be `001`.

2. **Filename Format**:
   - The file MUST be created under the `docs/backlogs/` directory.
   - Format: `docs/backlogs/<3-digit-padded-number>-<hyphenated-lowercase-title>.md`.
   - Example: `docs/backlogs/001-horizontal-layout-support.md`

3. **Content Template**:
   - Copy the following template for the backlog file:
     ```markdown
     ---
     ID: <3-digit-padded-number>
     種別: <Feature/Bug/Refactor/Enhancement>
     優先度: <High/Medium/Low>
     ステータス: Draft
     ---

     # [<TYPE>] <Title> (ID: <3-digit-padded-number>)

     ## 1. 概要 / Summary
     <Description of the feature or idea>
     ```
   - Populate the header block and description.

4. **Register in Backlog Ledger**:
   - Right after creating the backlog file, open [docs/backlogs/README.md](README.md) (Backlog台帳).
   - Append a new row to the **1. バックログ一覧** table with the status set to `Draft` and linking to the newly created backlog file.

5. **Verify and Commit**:
   - Verify the markdown table formatting is clean and aligned.
   - Commit the change with a conventional commit message.
