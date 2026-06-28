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
| **006** | Enhancement | Low | Approved | 非同期処理による目次抽出および描画の高速化 | [006-async-toc-generation.md](006-async-toc-generation.md) |
| **007** | Feature | High | Draft | 大容量テキストのインクリメンタル（段階的）パースおよびレンダリング | [007-incremental-text-parsing.md](007-incremental-text-parsing.md) |
| **008** | Enhancement | Medium | Draft | レイアウト診断レポート生成の非同期・タイムスライス化 | [008-async-layout-diagnostics.md](008-async-layout-diagnostics.md) |
| **009** | Refactor | Medium | Draft | しおり（進捗）書き込み処理の非同期アイドル実行化 | [009-async-bookmark-storage.md](009-async-bookmark-storage.md) |
| **010** | Enhancement | Low | Draft | 起動時オススメ書籍グリッドの遅延レンダリング | [010-lazy-loading-predefined-books.md](010-lazy-loading-predefined-books.md) |
| **011** | Refactor | Medium | Closed | 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化 | [011-modularize-src-by-screen-and-bundle.md](closed/011-modularize-src-by-screen-and-bundle.md) |
| **012** | Feature | Medium | Closed | Commandパターンによるユーザー操作履歴の抽象化とデバッグ用シリアライズ対応 | [012-command-pattern-operation-history.md](closed/012-command-pattern-operation-history.md) |
| **013** | Enhancement | Low | Draft | 目次ドロワーのキーボード・スクリーンリーダー向けアクセシビリティ向上 | [013-toc-accessibility-enhancement.md](013-toc-accessibility-enhancement.md) |
| **014** | Enhancement | Medium | Promoted | デバッグ画面の拡大表示（大部分をカバーする広幅ウィンドウ化） | [014-full-screen-debug-window.md](closed/014-full-screen-debug-window.md) |
| **015** | Feature | Medium | Closed | Closure Compiler の導入とビルド自動化 | [015-integrate-closure-compiler.md](closed/015-integrate-closure-compiler.md) |
| **016** | Refactor | Medium | Closed | サイクロマティック複雑度の計測とリファクタリング基準の導入 | [016-cyclomatic-complexity-measurement.md](closed/016-cyclomatic-complexity-measurement.md) |
| **017** | Feature | High | Closed | GitHub Actions CI パイプラインと GitHub Pages デプロイ自動化の導入 | [017-github-actions-ci-and-pages-deploy.md](closed/017-github-actions-ci-and-pages-deploy.md) |

---

## 2. 状態（ステータス）定義

* **Draft**: アイデアまたは初期の要望レベルであり、詳細な要件精査が行われていない状態。
* **Approved**: 要件が精査され、実装の意義が認められ、将来的に実装が予定された状態。
* **Postponed**: 検討の結果、現在のロードマップから除外され、当面は実装を見送る状態。
* **Promoted**: 開発の着手が決定し、`docs/issues/` ディレクトリにアクティブな Issue として起票され、クローズされた状態。
* **Closed**: 実装や検証が完全に終了し、完了したバックログ項目（[closed/](closed/) ディレクトリ配下に移動されます）。
