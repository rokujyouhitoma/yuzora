---
name: create-backlog
description: Register a new backlog item under the docs/REQ-04-backlog.md file in the workspace.
---
# create-backlog

This skill dictates how to register a new backlog item in the Backlog Registry (`docs/REQ-04-backlog.md`) systematically.

## Instructions

1. **Check Existing Backlog Items**:
   - Open `docs/REQ-04-backlog.md` and read the "2. バックログ一覧" table.
   - Find the next sequential backlog ID (e.g. if the last item is `BACKLOG-004`, the next will be `BACKLOG-005`).

2. **Add Backlog Item**:
   - Append a new row to the table in `docs/REQ-04-backlog.md` using the following format:
     `| **BACKLOG-XXX** | <種別> | <優先度> | Draft | **<タイトル>**: <概要説明> | - |`
   - Parameters:
     - **バックログID**: `BACKLOG-` の後に3桁の連番（例: `BACKLOG-005`）。
     - **種別**: `Feature`, `Bug`, `Refactor`, `Enhancement` など。
     - **優先度**: `High`, `Medium`, `Low` のいずれか。
     - **ステータス**: `Draft`（初期登録時は必ず Draft とする）。
     - **タイトル・概要**: 太字のタイトルと、具体的な機能説明やユーザーメリットの簡潔な記述。
     - **関連Issue ID**: `-`（初期登録時は未割り当てのためハイフンとする）。

3. **Verify and Commit**:
   - Verify the markdown table formatting is clean and aligned.
   - Commit the change with a conventional commit message.
