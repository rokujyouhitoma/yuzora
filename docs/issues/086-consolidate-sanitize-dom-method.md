---
ID: 086
種別: Feature
優先度: Medium
ステータス: In Progress
---

# [FEAT/ENH] サニタイズロジック (sanitizeDOM) の共通化によるコード重複の排除 (ID: 086)

## 1. 概要 / Summary
`AozoraEvaluator` と `VerticalRenderer` に重複して存在するホワイトリスト方式の DOM サニタイザー `sanitizeDOM` を `AozoraEvaluator` に一本化し、コードベースの重複の排除と、将来のセキュリティ改修時の修正漏れ（CWE-79等の脆弱性）を防ぐメンテナビリティ向上を実施します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連デザイン: [DSN-01-high_level_design.md](../DSN-01-high_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [renderer.js](file:///workspace/yuzora/src/js/modules/ui/renderer.js) (`VerticalRenderer.prototype.sanitizeDOM` の削除、呼び出し元修正)
- [ ] [evaluator.js](file:///workspace/yuzora/src/js/modules/parser/evaluator.js) (共通化された `AozoraEvaluator.prototype.sanitizeDOM`)
- [ ] [renderer.test.js](file:///workspace/yuzora/tests/unit/ui/renderer.test.js) (モックの修正およびテスト影響範囲確認)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/084-restructure-js-modules`

1. **`VerticalRenderer` からの `sanitizeDOM` 削除と呼び出し修正 (SA主導)**
   - `src/js/modules/ui/renderer.js` から重複する `sanitizeDOM` 定義を削除します。
   - `VerticalRenderer.prototype.render` 内でサニタイズを実行する際、`this.locator.resolve(AozoraEvaluator)` 経由で取得した `AozoraEvaluator` インスタンスの `sanitizeDOM` を呼び出すように変更します。
2. **テストコードの修正 (SA主導)**
   - `renderer.test.js` 内で `VerticalRenderer` をテストする際、`locator` のモックが `AozoraEvaluator` インスタンスを正しく返し、かつテスト中のサニタイズ処理が意図通りに動作するようにモック設定を補強します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `renderer.js` 内に重複する `sanitizeDOM` 関数コードが存在しないこと。
- [ ] 不正なHTML（`<script>` 等を含むもの）がレンダラーに送られた際、共通化された `sanitizeDOM` によって確実に無害化されること。
- [ ] `npm test` がすべてパスすること。
