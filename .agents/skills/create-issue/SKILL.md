---
name: create-issue
description: Create a new issue file under the issues/ directory in the workspace.
---
# create-issue

This skill dictates how to initialize a new issue file to ensure uniformity and clarity.

## Instructions

1. **Check Existing Issues**:
   - List the files under `issues/` to find the next sequential number.
   - If no issues exist, the first issue will be `001`.

2. **Filename Format**:
   - The file MUST be created under the `issues/` directory.
   - Format: `issues/<3-digit-padded-number>-<hyphenated-lowercase-title>.md`.
   - Example: `issues/001-implement-keyboard-shortcuts.md`

3. **Content Template**:
   - Copy the exact structure from `issues/template.md`.
   - Update the heading: `# <Title> (ID: <3-digit-padded-number>)`.
   - Populate **1. 概要 / Summary** with a concise description of the objective or problem.
   - Populate **2. 影響範囲と関連ファイル / Scope and Affected Files** with a list of the target files or folders that need to be investigated or edited.
   - Keep sections 3 (Implementation Plan) and 4 (Success Criteria) blank or placeholders. These will be filled in during the `polish-issue` phase.
