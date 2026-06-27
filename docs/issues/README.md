# Yuzora Active Issues Registry

本ドキュメントは、「ゆうぞら (Yuzora)」プロジェクトにおいて現在アクティブに進行している（着手決定または進行中）課題の管理台帳です。

> [!NOTE]
> 将来のアイデア、計画外の機能、未決定の要望は、ここではなく [[MNG-09] バックログ管理プロセス定義書](../MNG-09-backlog_process.md) に登録してプールします。

## 1. アクティブIssue一覧 (Active Issues Table)

| ID | 種別 | 優先度 | ステータス | タイトル | 担当 | 関連ドキュメント・ファイル |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | Bug | High | Analyzing | ページの左右が見切れてしまう | AI Agent | [001-page-left-right-overrun.md](001-page-left-right-overrun.md) |
| **002** | Feature | Medium | Closed | MNG-00に基づくskills, docsの見直し | AI Agent | [002-review-skills-and-docs-based-on-mng-00.md](closed/002-review-skills-and-docs-based-on-mng-00.md) |
| **003** | Feature | High | Closed | セキュリティ原則の統合と脅威モデリングスキルの新設 | AI Agent | [003-integrate-security-and-threat-modeling.md](closed/003-integrate-security-and-threat-modeling.md) |
| **004** | Feature | High | Closed | 包括的脅威モデリングの実施 | AI Agent | [004-perform-threat-modeling.md](closed/004-perform-threat-modeling.md) |
| **005** | Bug | High | Closed | グローバルHTMLエスケープの適用によるXSS脆弱性の解消 | AI Agent | [005-fix-xss-vulnerability-t-e1.md](closed/005-fix-xss-vulnerability-t-e1.md) |
| **006** | Bug | High | Closed | HTMLファイル読み込み時のXSS脆弱性の解消 | AI Agent | [006-fix-xss-vulnerability-t-e2.md](closed/006-fix-xss-vulnerability-t-e2.md) |
| **007** | Bug | High | Closed | CSPの定義による情報漏洩防止 | AI Agent | [007-enforce-csp-mitigation-t-i1.md](closed/007-enforce-csp-mitigation-t-i1.md) |
| **008** | Bug | Medium | Closed | 目次ジャンプ先がRTL縦書き時に微小にズレる問題 | AI Agent | [008-toc-jump-misalignment-in-rtl.md](closed/008-toc-jump-misalignment-in-rtl.md) |
| **009** | Feature | Medium | Closed | Commandパターンによるユーザー操作履歴の抽象化とデバッグ用シリアライズ対応 | AI Agent | [009-command-pattern-operation-history.md](closed/009-command-pattern-operation-history.md) |



## 2. 状態（ステータス）定義

* **New**: 課題が起票され、初期分析や担当アサインを待っている状態。
* **Analyzing**: 課題の根本原因調査（バグの場合）や要件・設計の精査を行っている状態。
* **In Progress**: 実装方針および完了条件が確定し、実際のコーディングおよびテスト作成を進めている状態。
* **Resolved**: 修正コードが適用され、すべてのテスト（E2E、単体等）を通過して、解決が確認された状態。
* **Closed**: 本番環境またはマスターブランチへマージが完了し、完了確認が取れた状態。
