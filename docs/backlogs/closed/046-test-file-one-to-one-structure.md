---
ID: 046
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACT] テキストモジュールとテストファイルの1対1対応リファクタリング (ID: 046)

## 1. 概要 / Summary
現在の単体テスト（`tests/unit/`）は、`app.test.js` 内にパーサー（`parser.js`）、ロケーター（`locator.js`）、コマンドパターン（`commands.js`）、レイアウト診断（`diagnostics.js`）などのテストが混在しています。これによりテストファイルが肥大化し、特定のモジュールを変更した際にどのテストが影響を受けるかが不透明になっています。
本変更では、テストファイルを整理し、「JSモジュール1ファイルにつき、テストファイルも1ファイル」の原則（例: `parser.js` ➔ `parser.test.js`、`locator.js` ➔ `locator.test.js`）に適合するようにテストスイートを細分化・再構成します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[tests/unit/app.test.js](tests/unit/app.test.js)** (MODIFY / REDUCE):
  - 混在している各モジュールのテストコードをそれぞれの独立したテストファイルに切り出します。
  - 残った yuzora 自体の基本初期化テストのみを保持するか、`yuzora.test.js` に改名します。
- **[tests/unit/parser.test.js](tests/unit/parser.test.js)** (NEW):
  - パーサーのテスト（ルビ、傍点、太字、斜体、見出し、配置指定、XSSサニタイズ）を格納します。
- **[tests/unit/locator.test.js](tests/unit/locator.test.js)** (NEW):
  - `locator.js` に定義されたサービスロケーターのテストを格納します。
- **[tests/unit/commands.test.js](tests/unit/commands.test.js)** (NEW):
  - コマンドパターンおよびコマンド履歴マネージャー関連のテストを格納します。
- **[tests/unit/diagnostics.test.js](tests/unit/diagnostics.test.js)** (NEW):
  - レイアウト診断（`runLayoutDiagnosis` 等）関連のテストを格納します。
- **[package.json](package.json)** (MODIFY):
  - `test:unit` スクリプトの実行ファイル一覧に、新規テストファイルを追加します。

---

## 3. 実装方針 / Implementation Plan
Target Branch: `refactor/046-test-file-one-to-one-structure`

1. **テストコードの抽出**:
   - `app.test.js` から、各モジュールの `test('...', ...)` または `describe('...', ...)` のブロックをそのまま切り出し、対応する新規の `*.test.js` ファイルを作成します。
2. **実行設定の更新**:
   - `package.json` の `test:unit` コマンドで、新設されたすべての `tests/unit/*.test.js` ファイルが node 単体テストランナー経由で自動実行されるように登録します。
3. **互換性の検証**:
   - 分割後もテストが全く同じアサーション数および正当性を維持したまま、完全に成功することを確認します。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] `app.test.js` 内の混在テストが各モジュールに対応するテストファイル（`parser.test.js`, `locator.test.js`, `commands.test.js`, `diagnostics.test.js`）に完全に分割されていること。
- [ ] 各テストファイルが `js` ソースファイルと 1対1 の関係を満たしていること。
- [ ] `package.json` の `test:unit` スクリプトが更新され、新設されたテストがすべて自動実行されること。
- [ ] 静的解析（`npm run lint`）、型チェック、および分割されたユニットテストがすべて正常にパスすること。

