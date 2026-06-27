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
