# Yuzora Active Issues Registry

本ドキュメントは、「ゆうぞら (Yuzora)」プロジェクトにおいて現在アクティブに進行している（着手決定または進行中）課題の管理台帳です。

> [!NOTE]
> 将来のアイデア、計画外の機能、未決定の要望は、ここではなく [[MNG-09] バックログ管理プロセス定義書](../MNG-09-backlog_process.md) に登録してプールします。

## 1. アクティブIssue一覧 (Active Issues Table)

| ID | 種別 | 優先度 | ステータス | タイトル | 担当 | 関連ドキュメント・ファイル |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | Bug | High | Closed | ページの左右が見切れてしまう | AI Agent | [001-page-left-right-overrun.md](closed/001-page-left-right-overrun.md) |
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
| **051** | Enhancement | Medium | Closed | 青空文庫「地付き」「地寄せ」「地から○字上げ」レイアウトおよび装飾対応 | AI Agent | [051-aozora-chitsuki-jitsage-decorations.md](closed/051-aozora-chitsuki-jitsage-decorations.md) |
| **052** | Refactor | High | Closed | 抽象構文木（AST）ベースのパーサーおよび評価器への移行 | AI Agent | [052-ast-based-parser-architecture.md](closed/052-ast-based-parser-architecture.md) |
| **053** | Refactor | Medium | Closed | テキストモジュールとテストファイルの1対1対応リファクタリング | AI Agent | [053-test-file-one-to-one-structure.md](closed/053-test-file-one-to-one-structure.md) |
| **054** | Feature | Low | Closed | CSSリセット（初期化CSS）の導入 | AI Agent | [054-introduce-css-reset.md](closed/054-introduce-css-reset.md) |
| **055** | Feature | High | Closed | 厳密な文字レベル境界診断の導入と自動テスト検証ループの構築 | AI Agent | [055-strict-boundary-diagnostics-and-e2e-loop.md](closed/055-strict-boundary-diagnostics-and-e2e-loop.md) |
| **056** | Feature | High | Closed | 自己修復レイアウトエンジン（動的改ページ自動挿入）の実装 | AI Agent | [056-self-correcting-page-breaks.md](closed/056-self-correcting-page-breaks.md) |
| **057** | Enhancement | Medium | Closed | レイアウト自己修復の観測機能と視覚的デバッグ補助の導入 | AI Agent | [057-layout-repair-observability-and-debugging.md](closed/057-layout-repair-observability-and-debugging.md) |
| **058** | Feature | High | Closed | 青空文庫ルビ仕様への準拠 | AI Agent | [058-support-aozora-ruby-specifications.md](closed/058-support-aozora-ruby-specifications.md) |
| **059** | Bug | High | Closed | `｜`なし自動ルビが非漢字文字の後ろに続く漢字に適用されない | AI Agent | [059-fix-ruby-not-applied-when-preceded-by-non-kanji.md](closed/059-fix-ruby-not-applied-when-preceded-by-non-kanji.md) |
| **060** | Feature | High | Closed | ビルド時にキャッシュバスターを付与してブラウザキャッシュ問題を解消 | AI Agent | [060-cache-buster-on-build-to-fix-stale-js-cache.md](closed/060-cache-buster-on-build-to-fix-stale-js-cache.md) |
| **061** | Enhancement | Medium | Closed | ビルドバージョン番号をデバッグメニューで確認できるようにする | AI Agent | [061-show-build-version-in-debug-menu.md](closed/061-show-build-version-in-debug-menu.md) |
| **062** | Bug | High | Closed | E2Eテスト「Verify layout boundaries have zero overruns」がCIで失敗する | AI Agent | [062-e2e-layout-overrun-ci-failure.md](closed/062-e2e-layout-overrun-ci-failure.md) |
| **063** | Feature | High | Closed | ページ移動後にはみ出し検査を行い問題があればレイアウト自己修復する | AI Agent | [063-repair-on-page-navigate.md](closed/063-repair-on-page-navigate.md) |
| **064** | Feature | Medium | Closed | ページ移動確定後のPAGE_CHANGEDイベント発火と自己修復連動 | AI Agent | [064-publish-page-changed-event.md](closed/064-publish-page-changed-event.md) |
| **065** | Feature | Medium | Closed | 青空文庫ヘッダーフォーマットの解析と作品名・著者名の表示サポート | AI Agent | [065-aozora-header-parsing-support.md](closed/065-aozora-header-parsing-support.md) |
| **066** | Feature | Medium | Closed | parser.js からトークナイザー、パーサー、意味解析器、評価器、および AST ノードへのクラス・ファイル分離 | AI Agent | [066-separate-parser-evaluator-and-nodes.md](closed/066-separate-parser-evaluator-and-nodes.md) |
| **067** | Refactor | High | Closed | ページ移動パフォーマンスの改善とトレーシングログの導入 | AI Agent | [067-page-transition-performance.md](closed/067-page-transition-performance.md) |
| **068** | Bug | High | Closed | ページ境界のはみ出し文字検査処理のボトルネックによるページ遷移遅延 | AI Agent | [068-optimize-page-boundary-overrun-check.md](closed/068-optimize-page-boundary-overrun-check.md) |
| **069** | Feature | High | Closed | Parser からの HTML 組み立て処理の完全排除と Evaluator への責務集約 | AI Agent | [069-parser-evaluator-responsibility-separation.md](closed/069-parser-evaluator-responsibility-separation.md) |
| **070** | Refactor | High | Closed | 初期レイアウト修復アルゴリズムの1パス化によるロード処理の最適化 | AI Agent | [070-optimize-initial-layout-repair-algorithm.md](closed/070-optimize-initial-layout-repair-algorithm.md) |
| **071** | Refactor | High | Closed | 段落のドキュメント絶対座標キャッシュ導入によるページ遷移判定の高速化 | AI Agent | [071-cache-paragraph-absolute-bounds-on-scroll.md](closed/071-cache-paragraph-absolute-bounds-on-scroll.md) |
| **072** | Bug | High | Closed | スクロールでのページ遷移後にページの先頭位置が勝手に移動（カクつく）する問題 | AI Agent | [072-fix-layout-jumping-on-scroll.md](closed/072-fix-layout-jumping-on-scroll.md) |
| **073** | Bug | High | Closed | 縦書きマルチカラムレイアウトにおいて改ページ（.page-break）が機能しない問題 | AI Agent | [073-fix-page-break-not-working.md](closed/073-fix-page-break-not-working.md) |
| **074** | Bug | High | Closed | CSSの.page-breakでページがブレイクしていない問題 | AI Agent | [074-page-break-not-working.md](closed/074-page-break-not-working.md) |
| **075** | Bug | High | Closed | page-breakの幅計算誤りの修正 | AI Agent | [075-fix-page-break-width-calculation.md](closed/075-fix-page-break-width-calculation.md) |
| **076** | Feature | High | Closed | CSSファイルのキャッシュバスター自動付与およびバージョンアップ | AI Agent | [076-css-cache-busting-and-version-upgrade.md](closed/076-css-cache-busting-and-version-upgrade.md) |
| **077** | Bug | High | Closed | 自己修復レイアウトエンジンにおける動的改ページの動的サイズ計算適用 | AI Agent | [077-dynamic-page-break-sizing-on-repair.md](closed/077-dynamic-page-break-sizing-on-repair.md) |
| **078** | Bug | High | Closed | ページ読込時の自動スクロール完了後にレイアウト自己修復によるスクロール位置のズレ（跳ね）が発生する問題 | AI Agent | [078-fix-scroll-jumping-on-load-repair.md](closed/078-fix-scroll-jumping-on-load-repair.md) |
| **079** | Bug | High | Closed | 本文中の青空文庫改ページ記法「［＃改ページ］」のパース不具合の修正 | AI Agent | [079-fix-aozora-page-break-parsing.md](closed/079-fix-aozora-page-break-parsing.md) |
| **080** | Feature | Medium | Closed | 見出しの直前での自動改ページ機能の追加 | AI Agent | [080-page-break-before-headings.md](closed/080-page-break-before-headings.md) |
| **081** | Feature | Medium | Closed | 表示設定に依存しない明示的改ページの完全なレイアウト担保と余白最適化 | AI Agent | [081-robust-page-break-layout-under-extreme-settings.md](closed/081-robust-page-break-layout-under-extreme-settings.md) |
| **082** | Feature | Medium | Closed | 見出し自動改ページ設定のユーザーカスタマイズ機能の追加 | AI Agent | [082-user-customization-for-heading-page-break.md](closed/082-user-customization-for-heading-page-break.md) |
| **083** | Feature | High | Closed | カラムまたぎ時の段落見切れ防止の精度向上と非同期タイムスライス処理による最適化 | AI Agent | [083-improve-overrun-repair-precision-and-performance.md](closed/083-improve-overrun-repair-precision-and-performance.md) |
| **084** | Feature | Medium | Closed | JSモジュールの構造化とサブディレクトリ整理 | AI Agent | [084-restructure-js-modules.md](closed/084-restructure-js-modules.md) |
| **085** | Feature | Medium | Closed | AozoraEvaluator.escapeHTML のエスケープ完全化とタイトル表示不整合の解消 | AI Agent | [085-complete-escape-html-and-resolve-title-escaping.md](closed/085-complete-escape-html-and-resolve-title-escaping.md) |
| **086** | Feature | Medium | Closed | サニタイズロジック (sanitizeDOM) の共通化によるコード重複の排除 | AI Agent | [086-consolidate-sanitize-dom-method.md](closed/086-consolidate-sanitize-dom-method.md) |
| **087** | Feature | Medium | Closed | DOMParser インスタンスの再利用化によるメモリリーク低減 | AI Agent | [087-reuse-dom-parser-instance.md](closed/087-reuse-dom-parser-instance.md) |
| **088** | Refactor | Medium | Closed | ITストラテジスト (ST) の立場に基づくドキュメント管理・役割定義の見直し | AI Agent | [088-align-st-role-as-it-strategist.md](closed/088-align-st-role-as-it-strategist.md) |
| **089** | Feature | High | Closed | 難読化ビルドに対するE2Eの100%適用 | AI Agent | [089-enforce-e2e-on-minified-build.md](closed/089-enforce-e2e-on-minified-build.md) |
| **090** | Feature | High | Closed | セキュリティ・スキャンツールのCI統合 | AI Agent | [090-integrate-security-scanner-in-ci.md](closed/090-integrate-security-scanner-in-ci.md) |
| **091** | Feature | Medium | Closed | CSSスタイルのモジュール化 | AI Agent | [091-css-module-refactoring.md](closed/091-css-module-refactoring.md) |
| **092** | Refactor | Medium | Closed | しおり（進捗）書き込み処理の非同期アイドル実行化 | AI Agent | [092-async-bookmark-storage.md](closed/092-async-bookmark-storage.md) |
| **093** | Feature | High | Closed | 大容量テキストのインクリメンタルパースおよびレンダリング（Web Worker対応） | AI Agent | [093-incremental-text-parsing.md](closed/093-incremental-text-parsing.md) |
| **094** | Refactor | Medium | Closed | 他のエージェント定義ファイルのブラッシュアップ | AI Agent | [094-align-other-agents-definition.md](closed/094-align-other-agents-definition.md) |
| **095** | Refactor | Medium | Closed | ドキュメントパーサーインターフェースの抽象化とマルチフォーマット対応 | AI Agent | [095-parser-interface-abstraction.md](closed/095-parser-interface-abstraction.md) |
| **096** | Feature | High | Closed | インポートデータ（設定/履歴）の厳格なスキーマ検証によるプロトタイプ汚染対策 | AI Agent | [096-strict-schema-validation.md](closed/096-strict-schema-validation.md) |
| **097** | Feature | High | Closed | IndexedDBを用いた本棚機能（マイライブラリ）の構築 | AI Agent | [097-indexeddb-book-shelf.md](closed/097-indexeddb-book-shelf.md) |
| **098** | Feature | Medium | Closed | Visual Regression Testing (VRT) の導入 | AI Agent | [098-introduce-visual-regression-testing.md](closed/098-introduce-visual-regression-testing.md) |
| **099** | Enhancement | Medium | Closed | 自動テスト用サンプル書籍の拡充 | AI Agent | [099-expand-sample-books-for-layout-diagnostics.md](closed/099-expand-sample-books-for-layout-diagnostics.md) |
| **100** | Enhancement | Low | Closed | テストカバレッジ・品質メトリクス可視化 | AI Agent | [100-visualize-test-coverage-and-quality-metrics.md](closed/100-visualize-test-coverage-and-quality-metrics.md) |
| **101** | Enhancement | Medium | Closed | リリース準備・バージョン管理のCI/CD自動化 | AI Agent | [101-release-ci-automation.md](closed/101-release-ci-automation.md) |
| **102** | Enhancement | Medium | Closed | クライアントサイドでのエラー境界と診断レポート出力 | AI Agent | [102-client-error-boundary.md](closed/102-client-error-boundary.md) |
| **103** | Enhancement | Low | Closed | クライアントサイドのSLA/SLO定義とパフォーマンス監視 | AI Agent | [103-client-performance-slo.md](closed/103-client-performance-slo.md) |
| **104** | Enhancement | Medium | Closed | 最初期フェーズにおけるインポートファイルサイズ制限によるDoS対策 | AI Agent | [104-early-file-size-check.md](closed/104-early-file-size-check.md) |
| **105** | Enhancement | Low | Closed | Webフォントおよび主要アセットのpreloadとfont-display最適化 | AI Agent | [105-webfont-preload-optimization.md](closed/105-webfont-preload-optimization.md) |
| **106** | Feature | High | Closed | DOM仮想化（Virtual Scroll）による大容量書籍表示時のメモリ負荷低減 | AI Agent | [106-dom-virtualization.md](closed/106-dom-virtualization.md) |
| **107** | Refactor | Medium | Closed | フレームワークのライフサイクルにおける明示的なインスタンス破棄（dispose）の徹底 | AI Agent | [107-lifecycle-dispose-garbage-collection.md](closed/107-lifecycle-dispose-garbage-collection.md) |
| **108** | Enhancement | Medium | Closed | CIパイプラインにおける要件・設計・コード・テストのトレーサビリティ検証自動化 | AI Agent | [108-ci-traceability-verification.md](closed/108-ci-traceability-verification.md) |
| **109** | Feature | Medium | Closed | コマンド履歴エクスポート時へのチェックサム付与とインポート時整合性検証 | AI Agent | [109-command-history-checksum.md](closed/109-command-history-checksum.md) |
| **110** | Refactor | Medium | Closed | セキュリティスペシャリスト (SC) エージェント定義の洗練と体系化 | AI Agent | [110-align-security-specialist-agent.md](closed/110-align-security-specialist-agent.md) |
| **111** | Bug | High | Closed | brace-expansion パッケージの DoS 脆弱性 (GHSA-3jxr-9vmj-r5cp) の修正 | AI Agent | [111-fix-brace-expansion-vulnerability.md](closed/111-fix-brace-expansion-vulnerability.md) |


## 2. 状態（ステータス）定義

* **New**: 課題が起票され、初期分析や担当アサインを待っている状態。
* **Analyzing**: 課題の根本原因調査（バグの場合）や要件・設計の精査を行っている状態。
* **In Progress**: 実装方針および完了条件が確定し、実際のコーディングおよびテスト作成を進めている状態。
* **Resolved**: 修正コードが適用され、すべてのテスト（E2E、単体等）を通過して、解決が確認された状態。
* **Closed**: 本番環境またはマスターブランチへマージが完了し、完了確認が取れた状態。
