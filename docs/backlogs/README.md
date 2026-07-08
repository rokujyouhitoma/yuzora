# Yuzora Backlogs Registry

本ドキュメントは、「ゆうぞら (Yuzora)」プロジェクトにおける将来の要望、未計画の機能、および改善のためのアイデア（バックログ）の管理台帳です。

---

## 1. バックログ一覧 (Backlog Table)

| ID | 種別 | 優先度 | ステータス | タイトル | 関連ファイル |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | Feature | Medium | Draft | 横書き表示モードのサポート | [001-horizontal-layout-support.md](001-horizontal-layout-support.md) |
| **002** | Feature | Low | Draft | しおり手動一覧管理 | [002-manual-bookmark-management.md](002-manual-bookmark-management.md) |
| **003** | Feature | Low | Draft | PDF/EPUB形式のインポート対応 | [003-pdf-epub-import.md](003-pdf-epub-import.md) |
| **004** | Refactor | Medium | Draft | CSSスタイルのモジュール化 | [004-css-module.md](004-css-module.md) |
| **005** | Feature | High | Closed | 目次表示およびジャンプ機能 (TOC) | [005-table-of-contents-toc.md](closed/005-table-of-contents-toc.md) |
| **006** | Enhancement | Low | Promoted | 非同期処理による目次抽出および描画の高速化 | [006-async-toc-generation.md](closed/006-async-toc-generation.md) |
| **007** | Feature | High | Draft | 大容量テキストのインクリメンタルパースおよびレンダリング（Web Worker対応） | [007-incremental-text-parsing.md](007-incremental-text-parsing.md) |
| **008** | Enhancement | Medium | Draft | レイアウト診断レポート生成の非同期・タイムスライス化 | [008-async-layout-diagnostics.md](008-async-layout-diagnostics.md) |
| **009** | Refactor | Medium | Draft | しおり（進捗）書き込み処理の非同期アイドル実行化 | [009-async-bookmark-storage.md](009-async-bookmark-storage.md) |
| **010** | Enhancement | Low | Closed | 起動時オススメ書籍グリッドの遅延レンダリング | [010-lazy-loading-predefined-books.md](closed/010-lazy-loading-predefined-books.md) |
| **011** | Refactor | Medium | Closed | 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化 | [011-modularize-src-by-screen-and-bundle.md](closed/011-modularize-src-by-screen-and-bundle.md) |
| **012** | Feature | Medium | Closed | Commandパターンによるユーザー操作履歴の抽象化とデバッグ用シリアライズ対応 | [012-command-pattern-operation-history.md](closed/012-command-pattern-operation-history.md) |
| **013** | Enhancement | Low | Draft | 目次ドロワーのキーボード・スクリーンリーダー向けアクセシビリティ向上 | [013-toc-accessibility-enhancement.md](013-toc-accessibility-enhancement.md) |
| **014** | Enhancement | Medium | Promoted | デバッグ画面の拡大表示（大部分をカバーする広幅ウィンドウ化） | [014-full-screen-debug-window.md](closed/014-full-screen-debug-window.md) |
| **015** | Feature | Medium | Closed | Closure Compiler の導入とビルド自動化 | [015-integrate-closure-compiler.md](closed/015-integrate-closure-compiler.md) |
| **016** | Refactor | Medium | Closed | サイクロマティック複雑度の計測とリファクタリング基準の導入 | [016-cyclomatic-complexity-measurement.md](closed/016-cyclomatic-complexity-measurement.md) |
| **017** | Feature | High | Closed | GitHub Actions CI パイプラインと GitHub Pages デプロイ自動化の導入 | [017-github-actions-ci-and-pages-deploy.md](closed/017-github-actions-ci-and-pages-deploy.md) |
| **018** | Feature | Medium | Promoted | CommandパターンによるUI表示操作の記録と再現 | [018-command-pattern-ui-interactions.md](closed/018-command-pattern-ui-interactions.md) |
| **019** | Refactor | Medium | Closed | Locatorパターンによるグローバル変数の削減と依存関係の明確化 | [019-implement-locator-pattern.md](closed/019-implement-locator-pattern.md) |
| **020** | Feature | Medium | Promoted | Routerの実装とURLによる状態ディスパッチ機能 | [020-implement-router.md](closed/020-implement-router.md) |
| **021** | Refactor | Medium | Promoted | Eventクラスの実装とイベントディスパッチャーによるモジュール疎結合化 | [021-implement-event-emitter.md](closed/021-implement-event-emitter.md) |
| **022** | Refactor | Medium | Promoted | ビジネスロジック固有のイベント定義 | [022-define-domain-events.md](closed/022-define-domain-events.md) |
| **023** | Refactor | Medium | Closed | Publish/Subscribe パターンによるイベント通知モデルの実装 | [023-implement-pubsub.md](closed/023-implement-pubsub.md) |
| **024** | Refactor | Medium | Closed | Scene遷移（画面遷移）フレームワークの実装によるモジュール分離 | [024-implement-scene-framework.md](closed/024-implement-scene-framework.md) |
| **025** | Refactor | Medium | Closed | Repositoryパターンの導入による永続化・ストレージ処理の隠蔽化 | [025-implement-repository.md](closed/025-implement-repository.md) |
| **026** | Refactor | Medium | Closed | JavaScriptの "use strict" 有効化 | [026-enable-use-strict.md](closed/026-enable-use-strict.md) |
| **027** | Enhancement | Medium | Closed | Closure Compilerのコンパイルオプション厳格化 | [027-strict-closure-compiler-options.md](closed/027-strict-closure-compiler-options.md) |
| **028** | Enhancement | Medium | Closed | Closure CompilerのADVANCED_OPTIMIZATIONS適用と警告の全面エラー化 | [028-advanced-closure-compiler-options.md](closed/028-advanced-closure-compiler-options.md) |
| **029** | Refactor | Medium | Closed | クラス設計の統合とすべての状態・プロパティのカプセル化 | [029-consolidate-class-design-belonging-properties.md](closed/029-consolidate-class-design-belonging-properties.md) |
| **030** | Refactor | Medium | Closed | Yuzoraクラスのファイル分割とPublisher連携 | [030-extract-yuzora-class-and-use-publisher.md](closed/030-extract-yuzora-class-and-use-publisher.md) |
| **031** | Refactor | Medium | Closed | SceneライフサイクルによるUI初期化・クリーンアップ処理の定義 | [031-scene-lifecycle-ui-initialization-cleanup.md](closed/031-scene-lifecycle-ui-initialization-cleanup.md) |
| **032** | Refactor | Medium | Closed | JavaScriptモジュールの汎用化・フレームワーク抽出とディレクトリ分離 | [032-generalize-and-extract-frameworks.md](closed/032-generalize-and-extract-frameworks.md) |
| **033** | Refactor | Medium | Closed | AssetクラスとResourceDirectorの導入によるリソース管理の抽象化 | [033-introduce-asset-and-resource-director.md](closed/033-introduce-asset-and-resource-director.md) |
| **034** | Enhancement | Medium | Closed | ウェルカム画面オススメ本グリッドのローディングプレースホルダーの導入 | [034-welcome-books-loading-placeholder.md](closed/034-welcome-books-loading-placeholder.md) |
| **035** | Enhancement | Medium | Closed | 起動時のデフォルトルート自動リダイレクト機能 | [035-auto-redirect-to-welcome-route.md](closed/035-auto-redirect-to-welcome-route.md) |
| **036** | Refactor | Medium | Closed | レンダラー（Renderer）クラスの導入による描画ロジック of 分離 | [036-introduce-renderer-class.md](closed/036-introduce-renderer-class.md) |
| **037** | Refactor | Medium | Closed | 永続化層（Repository）の完全非同期対応と抽象化 | [037-async-repository-abstraction.md](closed/037-async-repository-abstraction.md) |
| **038** | Refactor | Medium | Closed | イベント駆動（EDA）の名前空間化とスコープ分離 | [038-scoped-event-namespaces.md](closed/038-scoped-event-namespaces.md) |
| **039** | Feature | Medium | Closed | セキュリティ・バイ・デザインに基づくセキュアレンダラーパターンの強制 | [039-secure-dom-renderer.md](closed/039-secure-dom-renderer.md) |
| **040** | Feature | Medium | Draft | オフライン自律稼働とPWA（Progressive Web App）化の導入 | [040-pwa-offline-support.md](040-pwa-offline-support.md) |
| **041** | Refactor | Medium | Closed | CSS変数の完全活用による「CSSテーマエンジン」の導入 | [041-css-theme-engine.md](closed/041-css-theme-engine.md) |
| **042** | Refactor | Medium | Closed | JSDocとtsc（TypeScript Compiler）による静的型チェックの導入 | [042-jsdoc-tsc-type-check.md](closed/042-jsdoc-tsc-type-check.md) |
| **043** | Feature | High | Closed | コマンド履歴入力検証とCSPの導入 | [043-command-history-validation-and-csp.md](closed/043-command-history-validation-and-csp.md) |

---

## 2. 状態（ステータス）定義

* **Draft**: アイデアまたは初期の要望レベルであり、詳細な要件精査が行われていない状態。
* **Approved**: 要件が精査され、実装の意義が認められ、将来的に実装が予定された状態。
* **Postponed**: 検討の結果、現在のロードマップから除外され、当面は実装を見送る状態。
* **Promoted**: 開発の着手が決定し、`docs/issues/` ディレクトリにアクティブな Issue として起票され、クローズされた状態。
* **Closed**: 実装や検証が完全に終了し、完了したバックログ項目（[closed/](closed/) ディレクトリ配下に移動されます）。
