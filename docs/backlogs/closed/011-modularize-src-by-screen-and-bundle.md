---
ID: 011
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACT] 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化 (ID: 011)

## 1. 概要 / Summary
現在、JavaScript (`app.js` - 約2100行) および CSS (`style.css` - 約1300行) はそれぞれ巨大な単一ファイル（モノリス）となっており、保守性や開発スケール時の見通しが悪くなっている。
本バックログでは、メンテナンス性と開発効率向上のため、これらを「画面（ウェルカム画面、リーダー画面、デバッグ画面）や機能コンポーネント単位」で個別のモジュールファイルに分割して設計・管理します。

一方で、本ビューアーの根幹哲学である「軽量かつブラウザ単体で即時実行可能な静的SPA（サーバーレス）」を維持するため、**配布・デプロイされる最終生成物としては単一の `style.css` および `main-min.js` へバンドル・統合するビルドプロセスを導入**する。当面は最終デプロイ資産の1ファイル化の方針を維持する。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

| ファイル / ディレクトリ | 変更種別 | 備考 |
|---|---|---|
| `Makefile` | 変更 | 複数 JS / CSS ファイルを統合・難読化するためのビルドルール定義 |
| `src/js/` | 変更 | `app.js` をモジュールへ分割、新規モジュールファイルを配置するサブフォルダ (`modules/` 等) の追加 |
| `src/css/` | 変更 | `style.css` を分割し、新規モジュールファイルを配置するサブフォルダの追加 |
| `docs/DSN-01-high_level_design.md` | 変更 | ディレクトリ構造の変更に伴う設計書の更新 |
| `docs/DSN-02-low_level_design.md` | 変更 | クラス・モジュール構成の変更に伴う更新 |

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 JavaScript の分割とビルド

- **分割設計案**:
  - `src/js/modules/config.js` (状態管理、共通設定情報)
  - `src/js/modules/commands.js` (Command パターンクラス群と CommandManager)
  - `src/js/modules/parser.js` (青空文庫テキストパース、HTMLサニタイズ、ルビ・字下げ処理)
  - `src/js/modules/diagnostics.js` (レイアウト診断計算、カラム幅・アライメント・見切れ検証ヘルパー群)
  - `src/js/modules/ui.js` (イベントリスナーのセットアップ、各モーダル/ドロワー開閉、キーボードショートカット制御)
  - `src/js/modules/viewer.js` (表示レンダリング、スクロール、論理ページ計算、自動非表示タイマーなど)
- **ビルド・バンドル**:
  - 依存管理に複雑な Node モジュール（WebpackやViteなど）を導入するのを避け、すでに Makefile に存在する **Google Closure Compiler (compiler.jar)** を活用する。
  - Closure Compiler の引数に複数のファイルを指定することで、自動的に連結・最適化・単一ファイル（`main-min.js`）化を行う。
    例: `java -jar compiler.jar --js src/js/modules/*.js --js_output_file main-min.js`

### 3.2 CSS の分割とビルド

- **分割設計案**:
  - `src/css/modules/base.css` (リセット、CSS変数、共通テーマ定義)
  - `src/css/modules/welcome.css` (起動時のウェルカム画面、オススメ本カードグリッド)
  - `src/css/modules/reader.css` (本文表示ビューポート、ページネーション、段組みカラム設定)
  - `src/css/modules/drawers.css` (設定ドロワー、目次ドロワー、オーバレイデザイン)
  - `src/css/modules/debug.css` (デバッグウィンドウ、タブ切り替え、レイアウト診断テキストエリア)
- **ビルド・バンドル**:
  - CSS は単純なテキスト連結（`cat` コマンドなど）で十分連結可能なため、`Makefile` に CSS 統合ルールを定義し、最終的な `src/css/style.css` を自動生成する。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [ ] JavaScript ソースコードが画面や機能単位のモジュールファイル（`src/js/modules/` 配下）に分割されていること。
- [ ] CSS ソースコードがモジュールファイル（`src/css/modules/` 配下）に分割されていること。
- [ ] `make` コマンドを実行した際、分割されたモジュール群から最終生成物である単一の `main-min.js` および `src/css/style.css` が生成されること。
- [ ] ビルドされた JavaScript/CSS を読み込む HTML (`compiled.html` 等) で本アプリを起動した際、モジュール化前と全く同等に動作すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 変更後のディレクトリ構造やビルドパイプラインが設計書 `DSN-01` および `DSN-02` に同期・反映されていること。
