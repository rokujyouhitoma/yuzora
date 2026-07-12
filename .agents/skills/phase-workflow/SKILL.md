---
name: phase-workflow
description: Manage the lifecycle of development phases under docs/phases/ — creating, updating, and completing phase entries aligned with the MNG-02 V-model process.
---
# phase-workflow

このスキルは、[MNG-02 開発プロセス](../../docs/MNG-02-development_process.md) で定義された V 字開発プロセスの各フェーズファイルを `docs/phases/` ディレクトリで管理するための手順書です。
フェーズの起票・ステータス更新・完了処理を標準化します。

---

## Instructions

### A. フェーズファイルの新規起票

1. **台帳の確認**:
   - [docs/phases/README.md](../../docs/phases/README.md) を開き、対象フェーズ（例: `PHASE-03`）の「個別ファイル」列を確認する。
   - すでにファイルが存在する場合は手順 B（ステータス更新）を参照してください。

2. **ファイル作成**:
   - テンプレート [docs/phases/template.md](../../docs/phases/template.md) をコピーして、以下の命名規則でファイルを作成する。
   - 形式: `docs/phases/PHASE-<2桁ID>-<lowercase-hyphenated-name>.md`
   - 例: `docs/phases/PHASE-03-hld.md`, `docs/phases/PHASE-05-implementation.md`

3. **テンプレートの記入**:
   - メタデータブロック（`ID`, `フェーズ名`, `英名`, `ステータス`）を埋める。
   - ステータスは `Pending`（未着手）または `Active`（即座に着手する場合）で初期化する。
   - [MNG-02](../../docs/MNG-02-development_process.md) の対応セクション（3.1〜3.9）を参照し、**インプット**・**アウトプット**・**主担当**を記載する。
   - **完了定義（DoD）**: フェーズ固有のチェック項目を最低 3 つ定義する。特に：
     - 対応設計ドキュメントの更新・承認状態
     - 関連 Issue の完了状態
     - 次フェーズへの引き継ぎ条件

4. **台帳の更新**:
   - [docs/phases/README.md](../../docs/phases/README.md) の対象フェーズ行を更新する。
   - 「個別ファイル」列にファイルへの相対リンクを追加する。
   - 「ステータス」列を `Pending` または `Active` に更新する。

---

### B. フェーズのステータス更新

フェーズが進行・完了した際は、以下の手順でステータスを更新する。

1. **個別フェーズファイルの更新**:
   - `docs/phases/PHASE-<ID>-<name>.md` を開く。
   - メタデータブロックの `ステータス` を変更する（`Pending` → `Active` → `Done` / `Blocked`）。
   - `Done` に変更する場合は、セクション 2「完了定義 (DoD)」のすべてのチェックボックスが `[x]` になっていることを確認する。
   - セクション 5「進捗メモ」に変更の背景・日付・決定事項を記録する。

2. **台帳（README）の更新**:
   - [docs/phases/README.md](../../docs/phases/README.md) を開く。
   - 対象フェーズ行の「ステータス」列を更新する。

---

### C. フェーズ完了時の引き継ぎチェックリスト

フェーズを `Done` にする前に、以下を確認してください。

- [ ] **DoD の全項目が達成されている**: 個別フェーズファイルのセクション 2 を確認。
- [ ] **設計ドキュメントが最新**: 対応する HLD / LLD / REQ ドキュメントが実装内容と整合している。
- [ ] **Issue のトレーサビリティ**: 関連 Issue がすべて `Closed` であるか、または意図的にスコープ外であることが記録されている。
- [ ] **ADR の記録**: アーキテクチャ上の重要な決定があれば `adr-workflow` スキルを使って ADR が起票済みである。
- [ ] **次フェーズへの引き継ぎ**: 次フェーズのインプットとなる成果物がすべて揃っている。

---

### D. フェーズと他スキルの連携

| タイミング | 使用するスキル | 目的 |
| :--- | :--- | :--- |
| フェーズ開始前に Issue がない場合 | `create-issue` → `polish-issue` | フェーズ内の具体的なタスクを Issue 化する |
| 設計変更・技術選定が発生した場合 | `adr-workflow` | アーキテクチャ決定を ADR として記録する |
| フェーズ内でコードを変更した場合 | `review-diff-code` | コード差分のレビューと品質チェック |
| フェーズ完了・コミット時 | `git-workflow` → `changelog-workflow` | 変更を Conventional Commit でコミットし CHANGES.md を更新する |

---

## フェーズ ID マッピング

| PHASE ID | フェーズ名 | 英名 | MNG-02 参照 |
| :--- | :--- | :--- | :--- |
| PHASE-01 | 要求定義 | User Requirements Definition (URD) | セクション 3.1 |
| PHASE-02 | 要件定義 | System Requirements Definition (SRD) | セクション 3.2 |
| PHASE-03 | 基本設計 | High-Level Design (HLD) | セクション 3.3 |
| PHASE-04 | 詳細設計 | Low-Level Design (LLD) | セクション 3.4 |
| PHASE-05 | 実装 | Implementation (Make) | セクション 3.5 |
| PHASE-06 | 単体検証 | Unit Verification | セクション 3.6 |
| PHASE-07 | 結合検証 | Integration Verification | セクション 3.7 |
| PHASE-08 | システム検証 | System Verification | セクション 3.8 |
| PHASE-09 | 受入検証・リリース | Acceptance Verification & Release | セクション 3.9 |
