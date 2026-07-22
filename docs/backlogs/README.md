# Yuzora Backlogs Registry

本ドキュメントは、「ゆうぞら (Yuzora)」プロジェクトにおける将来の要望、未計画の機能、および改善のためのアイデア（バックログ）の管理台帳です。

---

## 1. バックログ一覧 (Backlog Table)

| ID | 種別 | 優先度 | ステータス | タイトル | 関連ファイル |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | Feature | Medium | Draft | 横書き表示モードのサポート | [001-horizontal-layout-support.md](001-horizontal-layout-support.md) |
| **002** | Feature | Low | Draft | しおり手動一覧管理 | [002-manual-bookmark-management.md](002-manual-bookmark-management.md) |
| **003** | Feature | Low | Draft | PDF/EPUB形式のインポート対応 | [003-pdf-epub-import.md](003-pdf-epub-import.md) |
| **004** | Refactor | Medium | Closed | CSSスタイルのモジュール化 | [004-css-module.md](closed/004-css-module.md) |
| **005** | Feature | High | Closed | 目次表示およびジャンプ機能 (TOC) | [005-table-of-contents-toc.md](closed/005-table-of-contents-toc.md) |
| **006** | Enhancement | Low | Promoted | 非同期処理による目次抽出および描画の高速化 | [006-async-toc-generation.md](closed/006-async-toc-generation.md) |
| **007** | Feature | High | Closed | 大容量テキストのインクリメンタルパースおよびレンダリング（Web Worker対応） | [007-incremental-text-parsing.md](closed/007-incremental-text-parsing.md) |
| **008** | Enhancement | Medium | Closed | レイアウト診断レポート生成の非同期・タイムスライス化 | [008-async-layout-diagnostics.md](closed/008-async-layout-diagnostics.md) |
| **009** | Refactor | Medium | Closed | しおり（進捗）書き込み処理の非同期アイドル実行化 | [009-async-bookmark-storage.md](closed/009-async-bookmark-storage.md) |
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
| **044** | Enhancement | Medium | Closed | 青空文庫「地付き」「地寄せ」「地から○字上げ」レイアウトおよび装飾対応 | [044-aozora-chitsuki-jitsage-decorations.md](closed/044-aozora-chitsuki-jitsage-decorations.md) |
| **045** | Refactor | High | Closed | 抽象構文木（AST）ベースのパーサーおよび評価器への移行 | [045-ast-based-parser-architecture.md](closed/045-ast-based-parser-architecture.md) |
| **046** | Refactor | Medium | Closed | テキストモジュールとテストファイルの1対1対応リファクタリング | [046-test-file-one-to-one-structure.md](closed/046-test-file-one-to-one-structure.md) |
| **047** | Enhancement | High | Closed | 厳密な文字レベル境界診断の導入と自動テスト検証ループの構築 | [047-strict-boundary-diagnostics-and-e2e-loop.md](closed/047-strict-boundary-diagnostics-and-e2e-loop.md) |
| **048** | Feature | High | Closed | 自己修復レイアウトエンジン（動的改ページ自動挿入）の実装 | [048-self-correcting-page-breaks.md](closed/048-self-correcting-page-breaks.md) |
| **049** | Refactor | Low | Closed | CSSリセット（初期化CSS）の導入検討 | [049-introduce-css-reset.md](closed/049-introduce-css-reset.md) |
| **050** | Enhancement | Medium | Closed | レイアウト自己修復の観測機能と視覚的デバッグ補助の導入 | [050-layout-repair-observability-and-debugging.md](closed/050-layout-repair-observability-and-debugging.md) |
| **051** | Feature | High | Closed | 青空文庫ルビ仕様（漢字・記号判定、グループルビ、アルファベット対応）への準拠 | [051-support-aozora-ruby-specifications.md](closed/051-support-aozora-ruby-specifications.md) |
| **052** | Enhancement | Medium | Closed | ビルドバージョン番号をデバッグメニューで確認できるようにする | [052-show-build-version-in-debug-menu.md](closed/052-show-build-version-in-debug-menu.md) |
| **053** | Feature | Medium | Promoted | ページ移動完了後のPAGE_CHANGEDイベント発火と自己修復連動 | [053-publish-page-changed-event.md](closed/053-publish-page-changed-event.md) |
| **054** | Feature | Medium | Closed | 青空文庫ヘッダーフォーマットの解析と作品名・著者名の表示サポート | [054-aozora-header-parsing-support.md](closed/054-aozora-header-parsing-support.md) |
| **055** | Refactor | Medium | Closed | parser.js からトークナイザー、パーサー、意味解析器、評価器、および AST ノードへのクラス・ファイル分離 | [055-separate-parser-evaluator-and-nodes.md](closed/055-separate-parser-evaluator-and-nodes.md) |
| **056** | Refactor | High | Closed | ページ移動パフォーマンスの改善とトレーシングログの導入 | [056-page-transition-performance.md](closed/056-page-transition-performance.md) |
| **057** | Refactor | Medium | Closed | Parser からの HTML 組み立て処理の完全排除と Evaluator への責務集約 | [057-parser-evaluator-responsibility-separation.md](closed/057-parser-evaluator-responsibility-separation.md) |
| **058** | Refactor | High | Closed | 初期レイアウト修復アルゴリズムの1パス化によるロード処理の最適化 | [058-optimize-initial-layout-repair-algorithm.md](closed/058-optimize-initial-layout-repair-algorithm.md) |
| **059** | Refactor | High | Closed | 段落のドキュメント絶対座標キャッシュ導入によるページ遷移判定の高速化 | [059-cache-paragraph-absolute-bounds-on-scroll.md](closed/059-cache-paragraph-absolute-bounds-on-scroll.md) |
| **060** | Enhancement | Medium | Promoted | CSSファイルのブラウザキャッシュ回避用バージョン付与 | [060-cache-busting-for-css-files.md](closed/060-cache-busting-for-css-files.md) |
| **061** | Bug | High | Closed | 本文中の青空文庫改ページ記法「［＃改ページ］」のパース不具合の修正 | [061-fix-aozora-page-break-parsing.md](closed/061-fix-aozora-page-break-parsing.md) |
| **062** | Enhancement | Medium | Closed | 見出しの直前での自動改ページ機能の追加 | [062-page-break-before-headings.md](closed/062-page-break-before-headings.md) |
| **063** | Enhancement | Medium | Closed | 表示設定に依存しない明示的改ページの完全なレイアウト担保と余白最適化 | [063-robust-page-break-layout-under-extreme-settings.md](closed/063-robust-page-break-layout-under-extreme-settings.md) |
| **064** | Feature | Medium | Closed | 見出し自動改ページ設定のユーザーカスタマイズ機能の追加 | [064-user-customization-for-heading-page-break.md](closed/064-user-customization-for-heading-page-break.md) |
| **065** | Enhancement | High | Closed | カラムまたぎ時の段落見切れ防止の精度向上と非同期タイムスライス処理による最適化 | [065-improve-overrun-repair-precision-and-performance.md](closed/065-improve-overrun-repair-precision-and-performance.md) |
| **066** | Refactor | Medium | Closed | JSモジュールの構造化とサブディレクトリ整理 | [066-restructure-js-modules.md](closed/066-restructure-js-modules.md) |
| **067** | Refactor | Medium | Closed | AozoraEvaluator.escapeHTML のエスケープ完全化とタイトル表示不整合の解消 | [067-complete-escape-html-and-resolve-title-escaping.md](closed/067-complete-escape-html-and-resolve-title-escaping.md) |
| **068** | Refactor | Medium | Closed | サニタイズロジック (sanitizeDOM) の共通化によるコード重複の排除 | [068-consolidate-sanitize-dom-method.md](closed/068-consolidate-sanitize-dom-method.md) |
| **069** | Refactor | Medium | Closed | DOMParser インスタンスの再利用化によるメモリリーク低減 | [069-reuse-dom-parser-instance.md](closed/069-reuse-dom-parser-instance.md) |
| **070** | Refactor | Medium | Closed | ITストラテジスト (ST) の立場に基づくドキュメント管理・役割定義の見直しプラン | [070-align-st-role-as-it-strategist.md](closed/070-align-st-role-as-it-strategist.md) |
| **071** | Enhancement | High | Closed | 難読化ビルドに対するE2Eの100%適用 | [071-enforce-e2e-on-minified-build.md](closed/071-enforce-e2e-on-minified-build.md) |
| **072** | Enhancement | High | Closed | セキュリティ・スキャンツールのCI統合 | [072-integrate-security-scanner-in-ci.md](closed/072-integrate-security-scanner-in-ci.md) |
| **073** | Feature | Medium | Approved | Visual Regression Testing (VRT) の導入 | [073-introduce-visual-regression-testing.md](073-introduce-visual-regression-testing.md) |
| **074** | Enhancement | Medium | Approved | 自動テスト用サンプル書籍の拡充 | [074-expand-sample-books-for-layout-diagnostics.md](074-expand-sample-books-for-layout-diagnostics.md) |
| **075** | Enhancement | Low | Approved | テストカバレッジ・品質メトリクス可視化 | [075-visualize-test-coverage-and-quality-metrics.md](075-visualize-test-coverage-and-quality-metrics.md) |
| **076** | Refactor | Medium | Closed | 情報処理技術者試験区分に基づく他のエージェント定義ファイルのブラッシュアップ | [076-align-other-agents-definition.md](closed/076-align-other-agents-definition.md) |
| **077** | Feature | High | Draft | IndexedDBを用いた本棚機能（マイライブラリ）の構築 | [077-indexeddb-book-shelf.md](077-indexeddb-book-shelf.md) |
| **078** | Enhancement | Medium | Draft | リリース準備・バージョン管理のCI/CD自動化 | [078-release-ci-automation.md](078-release-ci-automation.md) |
| **079** | Refactor | Medium | Closed | ドキュメントパーサーインターフェースの抽象化とマルチフォーマット対応 | [079-parser-interface-abstraction.md](closed/079-parser-interface-abstraction.md) |
| **080** | Enhancement | Medium | Draft | クライアントサイドでのエラー境界と診断レポート出力 | [080-client-error-boundary.md](080-client-error-boundary.md) |
| **081** | Enhancement | Low | Draft | クライアントサイドのSLA/SLO定義とパフォーマンス監視 | [081-client-performance-slo.md](081-client-performance-slo.md) |
| **082** | Enhancement | High | Closed | インポートデータ（設定/履歴）の厳格なスキーマ検証によるプロトタイプ汚染対策 | [082-strict-schema-validation.md](closed/082-strict-schema-validation.md) |
| **083** | Enhancement | Medium | Draft | 最初期フェーズにおけるインポートファイルサイズ制限によるDoS対策 | [083-early-file-size-check.md](083-early-file-size-check.md) |
| **084** | Enhancement | Low | Draft | Webフォントおよび主要アセットのpreloadとfont-display最適化 | [084-webfont-preload-optimization.md](084-webfont-preload-optimization.md) |
| **085** | Feature | High | Draft | DOM仮想化（Virtual Scroll）による大容量書籍表示時のメモリ負荷低減 | [085-dom-virtualization.md](085-dom-virtualization.md) |
| **086** | Refactor | Medium | Draft | フレームワークのライフサイクルにおける明示的なインスタンス破棄（dispose）の徹底 | [086-lifecycle-dispose-garbage-collection.md](086-lifecycle-dispose-garbage-collection.md) |
| **087** | Enhancement | Medium | Draft | CIパイプラインにおける要件・設計・コード・テストのトレーサビリティ検証自動化 | [087-ci-traceability-verification.md](087-ci-traceability-verification.md) |
| **088** | Feature | Medium | Draft | コマンド履歴エクスポート時へのチェックサム付与とインポート時整合性検証 | [088-command-history-checksum.md](088-command-history-checksum.md) |

---

## 2. 状態（ステータス）定義

* **Draft**: アイデアまたは初期の要望レベルであり、詳細な要件精査が行われていない状態。
* **Approved**: 要件が精査され、実装の意義が認められ、将来的に実装が予定された状態。
* **Postponed**: 検討の結果、現在のロードマップから除外され、当面は実装を見送る状態。
* **Promoted**: 開発の着手が決定し、`docs/issues/` ディレクトリにアクティブな Issue として起票され、クローズされた状態。
* **Closed**: 実装や検証が完全に終了し、完了したバックログ項目（[closed/](closed/) ディレクトリ配下に移動されます）。
