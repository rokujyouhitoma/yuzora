# Custom Agent Rules for Yuzora

This file contains project-scoped rules and instructions for all AI agents working in this workspace.

## Development Workflow Rules

You MUST follow this structured, issue-driven development lifecycle for all modifications and new features:

1. **Issue Creation (`create-issue`)**:
   - Every task, bug fix, or feature MUST start with an issue file under the `docs/issues/` directory.
   - Use the `create-issue` skill to initialize a new issue using `docs/issues/template.md`.

2. **Issue Refinement (`polish-issue`)**:
   - Before writing any code or making source modifications, the issue MUST be polished.
   - Use the `polish-issue` skill to refine requirements, map dependencies, outline implementation steps, define target files, choose a branch name, and establish verification criteria.

3. **Implementation**:
   - Follow the detailed plan outlined in the polished issue.
   - Run tests and make sure the code compiles.

4. **Code Review (`review-diff-code`)**:
   - Prior to making a commit, review the code diff thoroughly using the `review-diff-code` skill.
   - Run review checks for correctness, security, performance, design alignment, style guidelines, error handling, and tests.

5. **Commit and Changelog (`git-workflow`, `changelog-workflow`)**:
   - Use `changelog-workflow` to document the changes in `CHANGES.md`.
   - Use `git-workflow` to commit your changes with a conventional commit message referencing the issue.

## Threat Modeling Rules

- Threat modeling results MUST be outputted to the `docs/threat-modeling/` directory.
- Threat modeling results MUST be maintained in a dateless, single source-of-truth file (e.g., `comprehensive-threat-modeling.md` or a descriptively named dateless file) to represent the latest system status. Do NOT include dates in the filename.
- For any identified threats that have been addressed or fixed, you MUST include a link to the corresponding issue file under `docs/issues/closed/` (e.g., `[Issue 005](../issues/closed/005-fix-xss-vulnerability-t-e1.md)`) within the threat analysis details.
