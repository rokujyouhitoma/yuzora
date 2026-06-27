---
name: changelog-workflow
description: Standardize Changelog entries under CHANGES.md at the workspace root.
---
# changelog-workflow

This skill ensures that all user-facing and architectural changes are recorded in `CHANGES.md` at the workspace root.

## Instructions

1. **Changelog Section**:
   - Always place modifications under the `## [Unreleased]` section.
   - Do not create a new version heading unless specifically instructed to release a version.

2. **Categorize Changes**:
   - Group entries by type:
     - `- Added`: For new features or additions
     - `- Changed`: For modifications to existing functionality
     - `- Fixed`: For bug fixes
     - `- Security`: For security-related upgrades or patches
     - `- Documentation`: For changes to markdown or design files

3. **Format Entries**:
   - Write clear, concise descriptions.
   - Append the local issue ID (e.g. `(ID: 001)`) at the end of each bullet point.
   - Example:
     ```markdown
     - Added keyboard shortcut trigger `d`/`D` to open/close the debug console (ID: 001).
     ```
