---
ID: 068
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [Refactor] サニタイズロジック (sanitizeDOM) の共通化によるコード重複の排除 (ID: 068)

## 1. 概要 / Summary
セキュリティの多層防御（Defense in Depth）のために定義されているホワイトリスト方式の DOM サニタイズ（`sanitizeDOM`）が、`AozoraEvaluator` と `VerticalRenderer` の両方に二重実装されています。本バックログでは、このサニタイズ処理を一元化し、将来のホワイトリスト改修時における修正漏れリスク（メンテナンス上の脆弱性）を排除します。

## 2. 詳細設計 & 対応策 (SC/SA 検討内容)

### 2.1. サニタイズロジックの一元化
- `src/js/modules/ui/renderer.js` に実装されている `sanitizeDOM` メソッドを完全に削除します。
- `VerticalRenderer` からは、`locator` 経由で解決した `AozoraEvaluator` インスタンス、または `Evaluator` が提供する静的/動的な共通ユーティリティとしての `sanitizeDOM` を呼び出して利用する設計に変更します。

### 2.2. ロケーター依存関係の確認
- `VerticalRenderer` 内で、`AozoraEvaluator` へのアクセスを確保するため、依存関係を解決します。
```javascript
// VerticalRenderer の render メソッド等の内部で
const evaluator = this.locator.resolve(AozoraEvaluator);
evaluator.sanitizeDOM(body);
```
- このリファクタリングにより、テスト用スタブやモックの挙動にも影響が出ないか検証を行います（特にユニットテスト `tests/unit/ui/renderer.test.js` 内の Mock 定義を確認します）。
