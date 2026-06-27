# Changelog / 変更履歴

All notable changes to this project will be documented in this file.

## [Unreleased]

- Fixed [T-E2] HTMLファイル読み込み時のXSS脆弱性の解消。ホワイトリスト方式のHTMLサニタイズ処理 (sanitizeDOM) を実装し、危険なタグやイベントハンドラを除去するように改善 (ID: 006)。
- Changed ドキュメント内のファイルリンクにおいて環境依存の絶対パスを禁止し、相対パスの使用を義務付けるルールを docs/MNG-02-development_process.md および .agents/AGENTS.md に追加 (ID: 006)。

- Fixed [T-E1] parseAozoraText の開始時にHTML特殊文字を一括エスケープし、タイトルや著者メタデータ等も含めたXSS脆弱性を解消 (ID: 005)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) に、システムデータフロー図 (DFD) および STRIDE詳細脅威分析結果シートを追記 (ID: 004)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) および脅威モデリング実行スキル (.agents/skills/threat-modeling/SKILL.md) を新設 (ID: 003)。
- Changed 開発哲学・マニフェスト (MNG-00) に「セキュリティ・バイ・デザイン」および「セキュア・バイ・デフォルト」を核心原則として追加 (ID: 003)。
- Changed 開発プロセス、問題管理、変更管理ドキュメント (MNG-02〜04) および既存スキル (polish-issue, review-diff-code) を脅威モデリングプロセスに適合するよう改定 (ID: 003)。
- Changed ドキュメント (MNG-01〜MNG-04) およびスキル (.agents/skills/*) を `MNG-00` に適合させ、三位一体モデルやドキュメント駆動開発の追跡性を強化 (ID: 002)。
- Fixed `docs/MNG-02-development_process.md` 内の文字コード崩れをクレンジング修復 (ID: 002)。
- Added [MNG-00] 開発哲学・マニフェスト (`docs/MNG-00-development_philosophy.md`) を新設し、プロダクト理念、UI/UX設計思想、運用統制の管理策、および三位一体連携モデルを集約。
- Added [REQ-04] バックログ管理簿 (`docs/REQ-04-backlog.md`) を新設し、将来の要望やロードマップのプールを分離。
- Added [MNG-06] Active Issues台帳 (`docs/issues/README.md`) を新設し、現在進行中のオープンな課題を一元追跡。
- Added 完了（Closed）したIssueチケットを `docs/issues/closed/` に移動するアーカイブ規則を導入。
- Changed `create-issue`, `polish-issue`, `git-workflow` の各スキル手順書を更新し、メタデータブロックによるステータス（Open/Closed）の明示管理および台帳・移動ワークフローとの連携を組み込み。
- Changed [MNG-01] (文書台帳) および [MNG-02] (開発プロセス) から散らばっていた哲学解説をカットし、`MNG-00` への参照リンクへ一元・簡素化。
- Changed 既存の `docs/issues/001-page-left-right-overrun.md` のフォーマットを新バグテンプレートへ追従。
- Changed `src/css/style.css` のカラム幅（`column-width`）の計算式を `vw` ベースに修正し、端数計算誤差によるカラムズレを解消 (ID: 001)。
- Added テストキャプチャ自動化用の E2E 検証スクリプト (`tests/e2e/diagnose.spec.js`) をリポジトリに追加。
