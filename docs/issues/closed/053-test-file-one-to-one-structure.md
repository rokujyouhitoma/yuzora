---
ID: 053
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACT] テキストモジュールとテストファイルの1対1対応リファクタリング (ID: 053)

## 1. 概要 / Summary
現在の単体テスト（`tests/unit/`）は、`app.test.js` 内にパーサー（`parser.js`）、ロケーター（`locator.js`）、コマンドパターン（`commands.js`）、レイアウト診断（`diagnostics.js`）、レンダラー（`renderer.js`）などのテストが混在しています。これによりテストファイルが肥大化し、特定のモジュールを変更した際にどのテストが影響を受けるかが不透明になっています。
本変更では、テストファイルを整理し、「JSモジュール1ファイルにつき、テストファイルも1ファイル」の原則（例: `parser.js` ➔ `parser.test.js`、`locator.js` ➔ `locator.test.js`）に適合するようにテストスイートを細分化・再構成します。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [046-test-file-one-to-one-structure.md](../backlogs/046-test-file-one-to-one-structure.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [app.test.js](file:///workspace/yuzora/yuzora/tests/unit/app.test.js) (DELETE または RENAME)
- [ ] [yuzora.test.js](file:///workspace/yuzora/yuzora/tests/unit/yuzora.test.js) (NEW/RENAME: yuzora.js の基本初期化テストのみ保持)
- [ ] [parser.test.js](file:///workspace/yuzora/yuzora/tests/unit/parser.test.js) (NEW: パーサーのテスト（ルビ、傍点、太字、斜体、見出し、配置指定、XSSサニタイズ）)
- [ ] [locator.test.js](file:///workspace/yuzora/yuzora/tests/unit/locator.test.js) (NEW: locator.js のテスト)
- [ ] [commands.test.js](file:///workspace/yuzora/yuzora/tests/unit/commands.test.js) (NEW: コマンドパターンおよびコマンド履歴マネージャー関連のテスト)
- [ ] [diagnostics.test.js](file:///workspace/yuzora/yuzora/tests/unit/diagnostics.test.js) (NEW: レイアウト診断関連のテスト)
- [ ] [renderer.test.js](file:///workspace/yuzora/yuzora/tests/unit/renderer.test.js) (NEW: renderer.js のテスト)
- [ ] [package.json](file:///workspace/yuzora/yuzora/package.json) (MODIFY: test:unit のテストスクリプト指定を更新)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/053-test-file-one-to-one-structure`

1. **テストコードの抽出**:
   - `app.test.js` から、各モジュールのテスト記述ブロックを抽出し、それぞれの新規の `*.test.js` ファイルを作成します。
   - 各新規テストファイルは共通の JSDOM セットアップやクリーンアップ処理（`before`/`after` フックなど）を踏襲して自己完結させます。
2. **実行設定の更新**:
   - `package.json` の `test:unit` コマンドで、新設・変更されたテストファイルをすべて node 単体テストランナー経由で自動実行するように登録します。
3. **互換性の検証**:
   - 分割後もテストが全く同じアサーション数および正当性を維持したまま、完全に成功することを確認します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `app.test.js` 内の混在テストが各モジュールに対応するテストファイル（`parser.test.js`, `locator.test.js`, `commands.test.js`, `diagnostics.test.js`, `renderer.test.js`, `yuzora.test.js`）に完全に分割されていること。
- [ ] 各テストファイルが JS ソースファイルと 1対1 の関係を満たしていること。
- [ ] `package.json` の `test:unit` スクリプトが更新され、すべてのテストが自動実行されること。
- [ ] すべての単体テスト、型チェック、静的解析が正常にパスすること。
