---
name: review-diff-code
description: Thoroughly review local git changes (git diff) from multiple quality perspectives.
---
# review-diff-code

This skill guides the agent in conducting a rigorous self-review on the changes before committing them.

## Instructions

1. **Obtain the Diff**:
   - Check staged changes using `git diff --cached` and unstaged changes using `git diff`.

2. **Review Rounds**:
   - Perform at least 3 rounds of iterative reviews (maximum 5) to catch deep bugs, formatting issues, or logic leaks.

3. **Verify 7 Distinct Angles**:
   - **Correctness & Logic**: Ensure all logical branches are sound, loop boundaries are correct, and requirements are met.
   - **Security**: Verify input validation, HTML output escaping (to prevent XSS), absence of secrets/credentials, and conformity to secure web development practices.
   - **Performance**: Look out for memory leaks, redundant computations, heavy DOM manipulations, or slow DB queries.
   - **Design & Requirements Alignment**: Cross-check with high-level and low-level design specifications in `docs/`. **Ensure compliance with [MNG-00](file:///workspace/yuzora/yuzora/docs/MNG-00-development_philosophy.md) principles (e.g. strict RTL/LTR reading direction alignment, 1-column layout constraint for mobile viewports, serverless client-side execution, and synchronized manual/keyboard/touch interaction channels).**
   - **Code Style & Guidelines**: Check indentation, variable/function naming, documentation/comments, and language-specific best practices.
   - **Error & Exception Handling**: Ensure catch blocks, validation failure branches, and error states are correctly managed without crashing or leaving UI/state inconsistent.
   - **Test Coverage & Verification**: Ensure matching test cases exist and pass successfully (both unit and E2E).
