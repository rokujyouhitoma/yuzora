---
ID: 068
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [Refactor] サニタイズロジック (sanitizeDOM) の共通化によるコード重複の排除 (ID: 068)

## 1. 概要 / Summary
ホワイトリスト方式のセキュアな DOM サニタイズロジック (`sanitizeDOM`) が、`AozoraEvaluator` と `VerticalRenderer` の両方に二重定義されています。これを `AozoraEvaluator` に一本化し、コードの重複とメンテナンス時の脆弱性リスク（修正漏れ）を排除します。

## 2. 影響範囲と関連ファイル (Scope & Affected Files)
- `src/js/modules/ui/renderer.js` (`VerticalRenderer.prototype.sanitizeDOM` の削除、呼び出し元修正)
- `src/js/modules/parser/evaluator.js` (一元化された `AozoraEvaluator.prototype.sanitizeDOM`)
- `tests/unit/ui/renderer.test.js` (JSDOMでのサニタイズ動作テストへの影響確認)

## 3. 要件と技術的詳細 (Requirements & Technical Details)

### 3.1. 重複関数の削除と参照共通化 (SA主導)
- `src/js/modules/ui/renderer.js` 内の `VerticalRenderer.prototype.sanitizeDOM` 定義を完全に削除します。
- `VerticalRenderer` の `render(htmlContent)` メソッド内で、以下のように `locator` を経由して `AozoraEvaluator` を取得し、その `sanitizeDOM` メソッドを呼び出すように変更します。
```javascript
const evaluator = this.locator.resolve(AozoraEvaluator);
if (evaluator) {
    evaluator.sanitizeDOM(body);
}
```

### 3.2. 依存関係のチェック (SC主導)
- `VerticalRenderer` の `locator` に `AozoraEvaluator` が正しく登録されている必要があります。`src/js/modules/core/yuzora.js`（または各シーンのセットアップ箇所）で、`locator` に `AozoraEvaluator` がシングルトンとして登録されていることを保証します（現状、Locatorは `AozoraEvaluator` を登録済みです）。
- ユニットテスト (`tests/unit/ui/renderer.test.js`) において、モックの `Locator` が `AozoraEvaluator` を解決した際に適切なダミーまたは実体オブジェクトを返却するようにモック定義を補強します。

## 4. 受入基準 (Definition of Done)
1. `VerticalRenderer` 内から `sanitizeDOM` のプライベート実装が完全に削除されていること。
2. ブックロード・描画処理（`render`）が実行された際、XHTML やテキストファイル内の不正なタグ（`<script>` 等）が従来通り確実にサニタイズ除去されること。
3. `tests/unit/ui/renderer.test.js` がパスし、サニタイズテストケースが正常に動作すること。
4. `npm test` がすべてパスすること。
