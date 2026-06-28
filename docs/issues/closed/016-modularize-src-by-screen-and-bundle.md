---
ID: 016
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化 (ID: 016)

## 1. 概要 / Summary
現在、JavaScript (`app.js` - 約2100行) および CSS (`style.css` - 約1300行) は巨大な単一ファイルとなっており、保守性や開発効率が低下している。
本 Issue では、開発ソースを画面や機能単位のモジュールファイルへ分割し、配布・デプロイ用の成果物として単一の `style.css` および `main-min.js` へバンドル・統合するビルドパイプラインを確立する。
本ビューアーの根幹哲学である「軽量かつクライアントサイド専用の静的SPA（サーバーレス）」の原則を維持する。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-011 (ビルド自動化)
- 関連バックログ: [011-modularize-src-by-screen-and-bundle.md](../backlogs/011-modularize-src-by-screen-and-bundle.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [Makefile](../../Makefile) [MODIFY]
- [ ] [src/js/app.js](../../src/js/app.js) [DELETE] (モジュールに分割するため削除)
- [ ] [src/js/modules/config.js](../../src/js/modules/config.js) [NEW] (DOM要素、config、共通State定義)
- [ ] [src/js/modules/commands.js](../../src/js/modules/commands.js) [NEW] (Command パターンと CommandManager)
- [ ] [src/js/modules/parser.js](../../src/js/modules/parser.js) [NEW] (青空文庫テキスト/HTMLパースとサニタイズ処理)
- [ ] [src/js/modules/diagnostics.js](../../src/js/modules/diagnostics.js) [NEW] (レイアウト診断計算ヘルパー群)
- [ ] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) [NEW] (画面レンダリング、スクロール、ページ・進捗計算)
- [ ] [src/js/modules/ui.js](../../src/js/modules/ui.js) [NEW] (モーダル/ドロワー開閉、キーボード・タップ制御、setupEventListeners)
- [ ] [src/css/style.css](../../src/css/style.css) [MODIFY] (モジュール結合した生成物として再定義)
- [ ] [src/css/modules/base.css](../../src/css/modules/base.css) [NEW] (リセット、CSS変数、共通テーマ)
- [ ] [src/css/modules/welcome.css](../../src/css/modules/welcome.css) [NEW] (起動ウェルカム画面)
- [ ] [src/css/modules/reader.css](../../src/css/modules/reader.css) [NEW] (閲覧ビューポート、カラム、ページ送り)
- [ ] [src/css/modules/drawers.css](../../src/css/modules/drawers.css) [NEW] (設定ドロワー、目次ドロワー)
- [ ] [src/css/modules/debug.css](../../src/css/modules/debug.css) [NEW] (デバッグ画面、タブ、ログ表示)
- [ ] [docs/DSN-01-high_level_design.md](../DSN-01-high_level_design.md) [MODIFY] (ディレクトリ構造、コンポーネント構成の変更反映)
- [ ] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md) [MODIFY] (モジュール/関数分割と結合順序の設計記述)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/016-modularize-src-by-screen-and-bundle`

### 4.1 ディレクトリ設計とモジュール抽出
- `src/js/modules/` および `src/css/modules/` を新設し、既存のコードから各モジュールへ関数・クラス・スタイルルールを抽出・分割する。
- 共通変数やDOM要素定義が全モジュールで参照できるように、結合順序（読み込み順）に沿ってファイル構造を設計する。

### 4.2 JS 結合順序の設計 (Makefile に適用)
Closure Compiler のコンパイル時に入力ファイルを明示的に指定して結合する。
1. `src/js/modules/config.js`（グローバル定義と初期化）
2. `src/js/modules/commands.js`（Command パターン）
3. `src/js/modules/parser.js`（テキスト解釈・パース）
4. `src/js/modules/diagnostics.js`（レイアウト診断）
5. `src/js/modules/viewer.js`（ビューアーコア処理）
6. `src/js/modules/ui.js`（イベントセットアップと DOMContentLoaded コールバック）

### 4.3 CSS 結合処理 (Makefile に適用)
- `Makefile` 内に、`src/css/modules/` 配下のモジュールファイルを順に結合して `src/css/style.css` を生成するターゲットを追加する。
  `cat src/css/modules/base.css src/css/modules/welcome.css src/css/modules/reader.css src/css/modules/drawers.css src/css/modules/debug.css > src/css/style.css`

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] JavaScript コードが画面や機能単位のモジュールファイル（`src/js/modules/` 配下）に完全に分割されていること。
- [ ] CSS コードが画面や機能単位のモジュールファイル（`src/css/modules/` 配下）に完全に分割されていること。
- [ ] `make` コマンドを実行した際、モジュール群から最終生成物である単一の `main-min.js` および `src/css/style.css` が正常に生成されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] `npm run lint` が正常にパスし、分割後のコードでも複雑度エラーが発生しないこと。
- [ ] 基本設計書 [DSN-01](../DSN-01-high_level_design.md) および詳細設計書 [DSN-02](../DSN-02-low_level_design.md) の記述内容が、今回導入したモジュール構造およびバンドル仕様と完全に同期・整合していること。
- [ ] The implementation is fully consistent with DSN-01 and DSN-02 design specs (no dead documents).
