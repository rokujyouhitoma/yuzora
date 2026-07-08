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
| **010** | Feature | Medium | Closed | デバッグ画面の拡大表示（大部分をカバーする広幅ウィンドウ化） | AI Agent | [010-large-debug-window.md](closed/010-large-debug-window.md) |
| **011** | Feature | Medium | Closed | Closure Compiler の導入とビルド自動化 | AI Agent | [011-integrate-closure-compiler.md](closed/011-integrate-closure-compiler.md) |
| **012** | Feature | Medium | Closed | サイクロマティック複雑度の計測とリファクタリング基準の導入 | AI Agent | [012-cyclomatic-complexity-measurement.md](closed/012-cyclomatic-complexity-measurement.md) |
| **013** | Feature | High | Closed | GitHub Actions CI パイプラインと GitHub Pages デプロイ自動化の導入 | AI Agent | [013-github-actions-ci-and-pages-deploy.md](closed/013-github-actions-ci-and-pages-deploy.md) |
| **014** | Bug | Medium | Closed | オススメ書籍ロード時のShift_JISデコード警告ログの発生 | AI Agent | [014-predefined-book-decoding-warning.md](closed/014-predefined-book-decoding-warning.md) |
| **015** | Bug | High | Closed | GitHub Actions CI でのスクリーンショット保存先権限エラー | AI Agent | [015-github-actions-ci-permission-denied.md](closed/015-github-actions-ci-permission-denied.md) |
| **016** | Feature | Medium | Closed | 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化 | AI Agent | [016-modularize-src-by-screen-and-bundle.md](closed/016-modularize-src-by-screen-and-bundle.md) |
| **017** | Bug | Medium | Closed | キーボードの上・下矢印キーによるメニュー表示切替が機能しない | AI Agent | [017-toggle-menu-with-arrow-keys.md](closed/017-toggle-menu-with-arrow-keys.md) |
| **018** | Bug | High | Closed | デバッグ画面で「レイアウト診断」タブに切り替わらない | AI Agent | [018-fix-debug-tab-switching.md](closed/018-fix-debug-tab-switching.md) |
| **019** | Feature | Medium | Closed | CommandパターンによるUI表示操作の記録と再現 | AI Agent | [019-command-pattern-ui-interactions.md](closed/019-command-pattern-ui-interactions.md) |
| **020** | Feature | Low | Closed | 非同期処理による目次抽出および描画の高速化 | AI Agent | [020-async-toc-generation.md](closed/020-async-toc-generation.md) |
| **021** | Feature | Medium | Closed | Locatorパターンによるグローバル変数の削減と依存関係の明確化 | AI Agent | [021-implement-locator-pattern.md](closed/021-implement-locator-pattern.md) |
| **022** | Bug | High | Closed | 右から左（RTL/標準）送り時のページナビゲーション不具合 | AI Agent | [022-rtl-page-navigation-issue.md](closed/022-rtl-page-navigation-issue.md) |
| **023** | Refactor | Medium | Closed | JavaScriptの "use strict" 有効化 | AI Agent | [023-enable-use-strict.md](closed/023-enable-use-strict.md) |
| **024** | Enhancement | Medium | Closed | Closure Compilerのコンパイルオプション厳格化 | AI Agent | [024-strict-closure-compiler-options.md](closed/024-strict-closure-compiler-options.md) |
| **025** | Enhancement | Medium | Closed | Closure CompilerのADVANCED_OPTIMIZATIONS適用と警告の全面エラー化 | AI Agent | [025-advanced-closure-compiler-options.md](closed/025-advanced-closure-compiler-options.md) |
| **026** | Feature | Medium | Closed | Eventクラスの実装とイベントディスパッチャーによるモジュール疎結合化 | AI Agent | [026-implement-event-emitter.md](closed/026-implement-event-emitter.md) |
| **027** | Refactor | Medium | Closed | クラス設計の統合とすべての状態・プロパティのカプセル化 | AI Agent | [027-consolidate-class-design-belonging-properties.md](closed/027-consolidate-class-design-belonging-properties.md) |
| **028** | Refactor | Medium | Closed | 読書ビューアーのドメイン固有イベントの定義 | AI Agent | [028-define-domain-events.md](closed/028-define-domain-events.md) |
| **029** | Bug | High | Closed | ESLint循環的複雑度警告の修正 | AI Agent | [029-fix-lint-complexity-errors.md](closed/029-fix-lint-complexity-errors.md) |
| **030** | Refactor | Medium | Closed | Publish/Subscribe パターンによるイベント通知モデルの実装 | AI Agent | [030-implement-pubsub.md](closed/030-implement-pubsub.md) |
| **031** | Refactor | Medium | Closed | Yuzoraクラスのファイル分割とPublisher連携 | AI Agent | [031-extract-yuzora-class-and-use-publisher.md](closed/031-extract-yuzora-class-and-use-publisher.md) |
| **032** | Refactor | Medium | Closed | Repositoryパターンの導入による永続化・ストレージ処理の隠蔽化 | AI Agent | [032-implement-repository.md](closed/032-implement-repository.md) |
| **002** | Bug | High | Closed | E2Eテスト「RTLモードでのスワイプジェスチャー」が失敗する | AI Agent | [002-e2e-swipe-gesture-test-failure-rtl.md](closed/002-e2e-swipe-gesture-test-failure-rtl.md) |
| **033** | Bug | High | Closed | GitHub Actions デプロイワークフローで `eslint: not found` エラーが発生する | AI Agent | [033-ci-deploy-npm-install-missing.md](closed/033-ci-deploy-npm-install-missing.md) |
| **034** | Refactor | Medium | Closed | Scene遷移フレームワーク（SceneDirector）の実装によるモジュール分離 | AI Agent | [034-implement-scene-director.md](closed/034-implement-scene-director.md) |
| **035** | Refactor | Medium | Closed | SceneライフサイクルによるUI初期化・クリーンアップ処理の定義 | AI Agent | [035-scene-lifecycle-ui-initialization-cleanup.md](closed/035-scene-lifecycle-ui-initialization-cleanup.md) |
| **036** | Feature | Medium | Closed | Routerの実装とURLによる状態ディスパッチ機能 | AI Agent | [036-implement-router.md](closed/036-implement-router.md) |
| **037** | Refactor | Medium | Closed | JavaScriptモジュールの汎用化・フレームワーク抽出とディレクトリ分離 | AI Agent | [037-generalize-and-extract-frameworks.md](closed/037-generalize-and-extract-frameworks.md) |
| **038** | Bug | High | Closed | スマートフォン（Android, Chrome）で本文をタップしてもヘッダーが表示されない | AI Agent | [038-mobile-tap-header-not-showing.md](closed/038-mobile-tap-header-not-showing.md) |
| **039** | Feature | Medium | Closed | 起動時のデフォルトルート自動リダイレクト機能 | AI Agent | [039-auto-redirect-to-welcome-route.md](closed/039-auto-redirect-to-welcome-route.md) |
| **040** | Feature | Medium | Closed | AssetクラスとResourceDirectorの導入によるリソース管理の抽象化 | AI Agent | [040-introduce-asset-and-resource-director.md](closed/040-introduce-asset-and-resource-director.md) |
| **041** | Enhancement | Medium | Closed | ウェルカム画面オススメ本グリッドのローディングプレースホルダーの導入 | AI Agent | [041-welcome-books-loading-placeholder.md](closed/041-welcome-books-loading-placeholder.md) |
| **042** | Refactor | Medium | Closed | JSDocとtscによる静的型チェックの導入 | AI Agent | [042-jsdoc-tsc-type-check.md](closed/042-jsdoc-tsc-type-check.md) |
| **043** | Feature | High | Closed | コマンド履歴デシリアライズ入力検証とCSPの導入 | AI Agent | [043-command-history-validation-and-csp.md](closed/043-command-history-validation-and-csp.md) |
| **044** | Feature | Medium | Closed | レンダラー（Renderer）クラスの導入による描画ロジックの分離 | AI Agent | [044-introduce-renderer-class.md](closed/044-introduce-renderer-class.md) |
| **045** | Feature | Medium | Closed | セキュリティ・バイ・デザインに基づくセキュアレンダラーパターンの強制 | AI Agent | [045-secure-dom-renderer.md](closed/045-secure-dom-renderer.md) |
| **046** | Refactor | Medium | Closed | CSS変数の完全活用による「CSSテーマエンジン」の導入 | AI Agent | [046-css-theme-engine.md](closed/046-css-theme-engine.md) |
| **047** | Refactor | Medium | Closed | イベント駆動（EDA）の名前空間化とスコープ分離 | AI Agent | [047-scoped-event-namespaces.md](closed/047-scoped-event-namespaces.md) |
| **048** | Refactor | Medium | Closed | 永続化層（Repository）の完全非同期対応と抽象化 | AI Agent | [048-async-repository-abstraction.md](closed/048-async-repository-abstraction.md) |
| **049** | Enhancement | Low | Closed | 起動時オススメ書籍グリッドの遅延レンダリング | AI Agent | [049-lazy-loading-predefined-books.md](closed/049-lazy-loading-predefined-books.md) |
| **050** | Enhancement | Medium | Closed | レイアウト診断レポート生成の非同期・タイムスライス化 | AI Agent | [050-async-layout-diagnostics.md](closed/050-async-layout-diagnostics.md) |


## 2. 状態（ステータス）定義

* **New**: 課題が起票され、初期分析や担当アサインを待っている状態。
* **Analyzing**: 課題の根本原因調査（バグの場合）や要件・設計の精査を行っている状態。
* **In Progress**: 実装方針および完了条件が確定し、実際のコーディングおよびテスト作成を進めている状態。
* **Resolved**: 修正コードが適用され、すべてのテスト（E2E、単体等）を通過して、解決が確認された状態。
* **Closed**: 本番環境またはマスターブランチへマージが完了し、完了確認が取れた状態。
