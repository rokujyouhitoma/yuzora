---
ID: 066
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] JSモジュールの構造化とサブディレクトリ整理 (ID: 066)

## 1. 概要 / Summary
現在、`src/js/modules/` 配下に多くのモジュールファイル（19個）がフラットに配置されており、モジュール間の関係性や責務のまとまり（例：パース・トークナイズ・評価、UI・描画など）が把握しづらくなっています。

本リファクタリングでは、`src/js/modules/` 配下のファイルを機能ごとに適切にサブディレクトリへと分類・整理し、それに伴うインポートパスの修正、テスト環境の適合、ビルド設定の調整を行うことで、コードベース of 保守性と見通しを向上させます。

## 2. 影響範囲と関連ファイル (Scope and Related Files)
1. **JSモジュールファイルの移動**
   - `src/js/modules/` 直下の19個 of ファイルを以下の4つのサブフォルダに分類して移動します。
     - **`parser/` (構文解析・コンパイル関連)**
       - `ast-nodes.js`
       - `tokenizer.js`
       - `semantic-analyzer.js`
       - `evaluator.js`
       - `parser.js`
     - **`ui/` (画面・描画・UI関連)**
       - `ui.js`
       - `renderer.js`
       - `viewer.js`
       - `scene.js`
     - **`storage/` (データ永続化・アセット管理関連)**
       - `repository.js`
       - `asset.js`
       - `resource-director.js`
     - **`core/` (システム共通・コアロジック)**
       - `commands.js`
       - `config.js`
       - `diagnostics.js`
       - `event.js`
       - `locator.js`
       - `publisher.js`
       - `yuzora.js`

2. **ブラウザ読み込み用HTMLの更新**
   - `index.html` にある各モジュール of `<script>` タグの参照先パスの更新

3. **ビルド設定の更新**
   - `Makefile` 内の `JS_SRCS` 配列のファイルパスを移動先に合わせて更新

## 3. 要件と技術的詳細 (Requirements and Technical Details)
- 各JSファイル自体は `Locator` (サービスロケーターパターン) を介して依存関係を解決しているため、ファイル内のインポート文の変更は不要です。
- 移動に伴い、`Makefile` のビルド順序 (依存性) が壊れないように配慮します。具体的には、共通基盤となる `core` を先にビルド・読み込みし、その後に各モジュールをロードするように設定します。
- `embed-build-info` ターゲットの `sed` 置換処理 (`src/js/modules/**/*.js` を `src/js/modules/**/*.js?v=...` に置き換える処理) がサブフォルダ対応で正しく機能することを確認します。

## 4. 受入基準 (DoD / Acceptance Criteria)
1. **ビルド成功**: `make` が警告・エラーなしで完了し、`main-min.js` が正しくビルドされること。
2. **テスト通過**: `npm test` (ESLint、TypeScriptによる静的型チェック、Unitテスト、PlaywrightによるE2Eテスト) がすべて正常に通過すること。
3. **ブラウザ動作確認**: `index.html` (開発モード) および `compiled.html` (本番ビルドモード) の両方で、ファイルの読み込みおよび基本的な機能 (ファイルのドロップ、レンダリング、設定変更、デバッグパネルなど) が正常に動作すること。
