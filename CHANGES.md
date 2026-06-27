# Changelog / 変更履歴

All notable changes to this project will be documented in this file.

## [Unreleased]
- Added [REQ-04] バックログ管理簿 (`docs/REQ-04-backlog.md`) を新設し、将来の要望やロードマップのプールを分離。
- Added [MNG-06] Active Issues台帳 (`issues/README.md`) を新設し、現在進行中のオープンな課題を一元追跡。
- Added 完了（Closed）したIssueチケットを `issues/closed/` に移動するアーカイブ規則を導入。
- Changed `create-issue`, `polish-issue`, `git-workflow` の各スキル手順書を更新し、メタデータブロックによるステータス（Open/Closed）の明示管理および台帳・移動ワークフローとの連携を組み込み。
- Changed 既存の `issues/001-page-left-right-overrun.md` のフォーマットを新バグテンプレートへ追従。
- Changed `src/css/style.css` のカラム幅（`column-width`）の計算式を `vw` ベースに修正し、端数計算誤差によるカラムズレを解消 (ID: 001)。
- Added テストキャプチャ自動化用の E2E 検証スクリプト (`tests/e2e/diagnose.spec.js`) をリポジトリに追加。
