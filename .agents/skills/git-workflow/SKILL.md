---
name: git-workflow
description: Standardize Git operations including branch naming conventions and conventional commit messages.
---
# git-workflow

This skill ensures that all Git branches and commits adhere to a clean, standardized format referencing local issue IDs.

## Instructions

1. **Branch Naming**:
   - All work must be conducted on a specific branch created for the task.
   - Format: `<type>/<issue-id>-<lowercase-hyphenated-description>`
   - Available types:
     - `feat`: New features or features extensions
     - `fix`: Bug fixes
     - `docs`: Documentation-only updates
     - `refactor`: Structural code changes without adding features or fixing bugs
     - `test`: Adding or modifying tests only
   - Example: `feat/003-layout-diagnosis-shortcuts`

2. **Commit Message Format**:
   - Use Conventional Commits formatting.
   - Format: `<type>(<optional-scope>): <summary> (ID: <issue-id>)`
   - Body format: List details using bullet points if the commit contains multiple components.
   - Example:
     ```
     feat(debug): add hotkeys for tab switching (ID: 003)

     - Support pressing 1 and 2 keys to switch tabs
     - Trigger automatic diagnosis run on active viewport
     ```

3. **Issue Completion / Close Workflow**:
   - When a task is fully implemented, verified, and ready to be merged/closed, perform the following steps to update the issue status and verify traceability:
     1. **Verify Document Consistency**: Ensure that all changes implemented in the source code have been fully backported or kept consistent with the design specifications ([DSN-01](../docs/DSN-01-high_level_design.md), [DSN-02](../docs/DSN-02-low_level_design.md)). Verify that no technical documentation has become outdated/dead.
     2. **Record changes in CHANGES.md**: Trigger the `changelog-workflow` to record detailed user-facing and architectural changes in `CHANGES.md` at the workspace root, mapping them to the local Issue ID.
     3. Open the active issue file under `docs/issues/`.
     4. Update the `ステータス` in the metadata block at the top from `Open (...)` to `Closed`.
     5. Move the issue file from the `docs/issues/` root directory to the `docs/issues/closed/` directory.
        - Command: `mv docs/issues/<issue-id>-<title>.md docs/issues/closed/`
     6. Open [docs/issues/README.md](README.md) (Issue台帳).
     7. Update the status column of the closed issue to `Closed`.
     8. Update the link path of the closed issue to point to the new location: `[<issue-id>-<title>.md](closed/<issue-id>-<title>.md)`.
