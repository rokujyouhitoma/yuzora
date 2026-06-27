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
   - **If design documents (e.g. [DSN-01](file:///workspace/yuzora/yuzora/docs/DSN-01-high_level_design.md) or [DSN-02](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md)) or architectural decisions (ADR) were updated, explicitly mention them in the description to preserve traceability (e.g., "... and updated DSN-02 (ID: 001)").**
   - Example:
     ```markdown
     - Added keyboard shortcut trigger `d`/`D` to open/close the debug console and updated DSN-02 (ID: 001).
     ```
