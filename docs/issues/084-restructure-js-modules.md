---
ID: 084
種別: Feature
優先度: Medium
ステータス: Open (In Progress)
---

# [FEAT/ENH] JSモジュールの構造化とサブディレクトリ整理 (ID: 084)

## 1. 概要 / Summary
現在、`src/js/modules/` 配下に多くのモジュールファイル（19個）がフラットに配置されており、モジュール間の関係性や責務のまとまり（例：パース・トークナイズ・評価、UI・描画など）が把握しづらくなっています。

本イシューでは、バックログ #066 に基づき、`src/js/modules/` 配下のファイルを機能ごとに適切にサブディレクトリ（`parser/`, `ui/`, `storage/`, `core/`）へと分類して移動し、これに伴うHTMLファイルやMakefileのパス修正、およびビルドとテストが正常に通るための設定調整を実施します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし (技術的負債解消・リファクタリング)
- 関連要件 (SRD): なし
- 関連デザイン: [DSN-01-high_level_design.md](../DSN-01-high_level_design.md) (1.1節 構成図, 1.2節 コンポーネント定義)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [index.html](file:///workspace/yuzora/index.html) (Script読み込みパス)
- [ ] [Makefile](file:///workspace/yuzora/Makefile) (`JS_SRCS` 定義)
- [ ] [DSN-01-high_level_design.md](file:///workspace/yuzora/docs/DSN-01-high_level_design.md) (デザイン記述更新)
- [ ] `src/js/modules/` 配下の全19ファイル (各サブフォルダへの移動)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/084-restructure-js-modules`

1. **デザインドキュメントの更新**
   - [DSN-01-high_level_design.md](../DSN-01-high_level_design.md) のMermaid図における `JSModules` のサブグラフを整理し、`parser/`, `ui/`, `storage/`, `core/` に分類する。
   - 1.2節のコンポーネント表の `src/js/modules/` の記述をサブディレクトリに対応させる。

2. **ディレクトリの作成とファイル移動**
   - `src/js/modules/` 配下に以下のサブディレクトリを作成し、ファイルを移動する。
     - `core/` : `commands.js`, `config.js`, `diagnostics.js`, `event.js`, `locator.js`, `publisher.js`, `yuzora.js`
     - `parser/` : `ast-nodes.js`, `tokenizer.js`, `semantic-analyzer.js`, `evaluator.js`, `parser.js`
     - `storage/` : `repository.js`, `asset.js`, `resource-director.js`
     - `ui/` : `ui.js`, `renderer.js`, `viewer.js`, `scene.js`

3. **ビルド設定とHTMLの更新**
   - `Makefile` の `JS_SRCS` のリストを新しいパスで更新する。依存関係（Locatorのロード順）に留意し、`core` 関連のモジュールを先にロードする順番を維持する。
   - `index.html` に記述されている各モジュールの `<script>` タグの参照先パスを移動先に合わせて更新する。

4. **ビルドおよびテスト実行**
   - `make` を実行して `main-min.js` が警告・エラーなく生成されることを確認。
   - `npm test` を実行して、ESLint、TypeScript型チェック、ユニットテスト、PlaywrightによるE2Eテストがすべて正常に通過することを確認。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `make` コマンドで `main-min.js` が警告なくビルドされること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 開発用の [index.html](../../index.html) をブラウザで直接開いた際、コンソールエラーなしで書籍読み込みや設定切り替えなどの各機能が動くこと。
- [ ] 変更内容が [DSN-01-high_level_design.md](../DSN-01-high_level_design.md) に反映され、実際のファイル配置と整合していること。
