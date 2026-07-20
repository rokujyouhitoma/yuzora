---
ID: 088
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [Refactor] Align ST Role as IT Strategist (ID: 088)

## 1. 概要 / Summary
ITストラテジスト (ST) の役割定義とドキュメント管理プロセスの見直しを行い、ビジネス戦略とITシステム（ゆうぞらプロジェクト）のトレーサビリティと整合性を向上させるためのプラン。
具体的には、STが主導する超上流工程（REQ-01 要求定義書、REQ-03 要件定義書）および受入検証プロセスの見直し、TOGAF EA (Enterprise Architecture) に基づくビジネスアーキテクチャ(BA)と他アーキテクチャ(AA/DA/TA)のアライメント強化、およびドキュメント台帳 (MNG-01) や開発プロセス定義書 (MNG-02) におけるSTの責任と権限の明確化を実施しました。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01-user_requirements.md](../../requirements/REQ-01-user_requirements.md)
- 関連要件 (SRD): [REQ-03-system_requirements.md](../../requirements/REQ-03-system_requirements.md)
- 関連デザイン: なし

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [MNG-01-document_ledger.md](../processes/MNG-01-document_ledger.md)
- [x] [MNG-02-development_process.md](../processes/MNG-02-development_process.md)
- [x] [MNG-05-test_cases.md](../processes/MNG-05-test_cases.md)
- [x] [REQ-01-user_requirements.md](../requirements/REQ-01-user_requirements.md)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/084-restructure-js-modules`

1. **ドキュメント台帳の更新 (PM主導)**
   - 各ドキュメント（MNG-00, MNG-02, REQ-01, REQ-03, DSN-01等）の「想定読者」「作成・更新主担当」における「ST」を「ITストラテジスト (ST)」に明記しました。
2. **開発プロセスの役割・アクター是正 (PM/ST主導)**
   - PM / ST (IT Strategist) / SA / SC / 検証チーム (QA) のアクター定義を追加しました。
   - V字モデル各フェーズ（3.1 〜 3.9）の担当をこれらアクターの枠組みに更新しました。
3. **要求定義のビジネス価値追記 (ST主導)**
   - 完全静的SPA構成によるTCOの極小化、およびローカル完結型によるプライバシー＆セキュリティ保護のビジネス差別化（事業強み）を `REQ-01` に明記しました。
4. **テスト検証チームの明確化 (ST/PM主導)**
   - `MNG-05` にて、従来の「システムテスト」等の表現を「検証チーム (QA/Tester) 主導」と明文化し、ITストラテジスト (ST) との役割呼称の重複を解消しました。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] ドキュメント台帳（MNG-01）において、ITストラテジスト（ST）のレビュー責任と承認フローが一貫して定義されていること。
- [x] 開発プロセス（MNG-02）において、V字モデル上のSTの立ち位置（ビジネス妥当性レビュー、ビジネスゴール受入評価）が明記されていること。
- [x] 要求定義（REQ-01）にITストラテジスト視点でのビジネス要求分析が組み込まれていること。
- [x] すべてのテスト（E2E、ユニットテスト等）が正常にパスすること。
