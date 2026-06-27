---
name: adr-workflow
description: Standardize the creation, lifecycle management, and updating of Architecture Decision Records (ADR).
---
# adr-workflow

This skill guides the agent in documenting architecture design decisions, technology selections, or trade-offs in ADRs before implementing key source code changes.

## Instructions

1. **Evaluate Trigger Criteria**:
   - Check if the task requires key design decisions:
     - Introducing new libraries/dependencies or changing the technology stack.
     - Changing module/layer relationships or adding permanent components.
     - Altering core data storage schemas (e.g. bookmarks/settings structures in LocalStorage).
     - Designing complex custom algorithms (e.g. text parsing regexes or page calculations).
   - If ANY of these criteria are met, you MUST create or update an ADR in the `docs/adr/` directory.

2. **Draft a New ADR (Proposed)**:
   - List existing ADRs in `docs/adr/` to determine the next serial number.
     - Format: `ADR-<2-digit-padded-number>-<lowercase-hyphenated-title>.md` (e.g., `ADR-02-new-parsing-strategy.md`).
   - Create the file under the `docs/adr/` directory using the template defined in [[MNG-08] Architecture Decision Record Process Definition](../../docs/MNG-08-adr_process.md):
     - Set `ステータス` to `Proposed (提案中)`.
     - Set `日付` to today's date in `YYYY-MM-DD` format.
     - Fill out the **Context (コンテキスト)** detailing problem, constraints, and alternative approaches.
     - Fill out the **Decision (意思決定)** with the finalized choice and design details.
     - Fill out the **Consequences (結果)** listing pros, cons, tasks, and side-effects.

3. **Supersede Previous Decisions**:
   - If the new decision updates, replaces, or overrides an existing decision, you MUST update the status of the old ADR:
     - Change the status of the old ADR to `Superseded (置き換え済)`.
     - Add a link pointing to the new ADR: `[ADR-YY](ADR-YY-description.md) に置き換えられました。`
     - Inside the new ADR, reference the old ADR: `本決定は [ADR-XX](ADR-XX-description.md) を置き換えるものです。`

4. **Review and Verification**:
   - Verify that your proposed ADR aligns with [MNG-00](../../docs/MNG-00-development_philosophy.md) (Philosophy), [DSN-01](../../docs/DSN-01-high_level_design.md) (HLD), and [DSN-02](../../docs/DSN-02-low_level_design.md) (LLD).
   - Once the ADR draft is created, present it to the User for review and feedback.
   - **Obtain User Approval**: The status of the ADR must remain `Proposed` until the User approves the decision. Upon approval, change the status to `Accepted (承認済)`.
