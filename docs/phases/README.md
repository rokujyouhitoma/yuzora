# [MNG-10] フェーズ管理台帳 (Phase Management Ledger) - ゆうぞら (Yuzora)

本ドキュメントは、「ゆうぞら (Yuzora)」プロジェクトにおける V 字開発プロセスの各フェーズの進行状況を追跡・一元管理する台帳です。
各フェーズは [MNG-02 開発プロセスおよび成果物定義書](../processes/MNG-02-development_process.md) で定義された 9 つの工程に対応します。

フェーズ個別ファイルの起票・更新・完了手順については、`phase-workflow` スキルに従ってください。

---

## 1. フェーズ一覧 (Phase Table)

| ID | フェーズ名 | 英名 | ステータス | 対応ドキュメント | 個別ファイル |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PHASE-01** | 要求定義 | User Requirements Definition (URD) | — | [REQ-01](../requirements/REQ-01-user_requirements.md), [REQ-02](../requirements/REQ-02-feature_list.md) | — |
| **PHASE-02** | 要件定義 | System Requirements Definition (SRD) | — | [REQ-03](../requirements/REQ-03-system_requirements.md) | — |
| **PHASE-03** | 基本設計 | High-Level Design (HLD) | — | [DSN-01](../designs/DSN-01-high_level_design.md) | — |
| **PHASE-04** | 詳細設計 | Low-Level Design (LLD) | — | [DSN-02](../designs/DSN-02-low_level_design.md) | — |
| **PHASE-05** | 実装 | Implementation (Make) | — | [index.html](../../index.html), [app.js](../../src/js/app.js) | — |
| **PHASE-06** | 単体検証 | Unit Verification | — | [MNG-05](../processes/MNG-05-test_cases.md) Section 4 | — |
| **PHASE-07** | 結合検証 | Integration Verification | — | [MNG-05](../processes/MNG-05-test_cases.md) Section 3 | — |
| **PHASE-08** | システム検証 | System Verification | — | [MNG-05](../processes/MNG-05-test_cases.md) Section 2 | — |
| **PHASE-09** | 受入検証・リリース | Acceptance Verification & Release | — | [MNG-05](../processes/MNG-05-test_cases.md) Section 1 | — |

---

## 2. ステータス定義 (Status Definitions)

| ステータス | 説明 |
| :--- | :--- |
| **Pending** | 未着手。前フェーズが完了していない、または着手条件が未成立の状態。 |
| **Active** | 現在進行中のフェーズ。対応する設計・実装・検証作業が行われている。 |
| **Done** | フェーズの完了条件（DoD）が満たされ、次フェーズへの引き継ぎが完了した状態。 |
| **Blocked** | 依存関係や問題により、フェーズの進行が停止している状態。Issue を参照。 |

---

## 3. 運用ルール (Operation Rules)

1. **フェーズ起票**: 新しいフェーズを開始する際は、`phase-workflow` スキルを使って `docs/phases/PHASE-<2桁>-<name>.md` を作成し、本台帳の「個別ファイル」列にリンクを追加してください。
2. **ステータス更新**: フェーズのステータス変更（Pending → Active → Done 等）は、`phase-workflow` スキルに従い、個別ファイルと本台帳の両方を同時に更新してください。
3. **Issue との紐付け**: フェーズは複数の Issue を含む場合があります。個別フェーズファイルに関連 Issue の一覧を記載し、トレーサビリティを維持してください。
4. **DoD の遵守**: フェーズを `Done` に変更するには、個別フェーズファイルに定義された「完了定義（DoD）」をすべて満たしていることを確認してください。
