---
ID: 069
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [Refactor] DOMParser インスタンスの再利用化によるメモリリーク低減 (ID: 069)

## 1. 概要 / Summary
HTML書籍データのロードや画面描画（`VerticalRenderer.render`）の都度 `new DOMParser()` が実行されています。ブラウザおよびエンジンによっては、`DOMParser` の頻繁な破棄と生成が GC（ガベージコレクション）のオーバーヘッドやメモリリークの原因となります。本バックログでは、`DOMParser` のインスタンスを再利用する設計に変更し、SPA（Single Page Application）としての長期稼働時の安定性を向上させます。

## 2. 詳細設計 & 対応策 (SC/SA 検討内容)

### 2.1. インスタンスの長寿命化と再利用
`new DOMParser()` をメソッド内のローカル生成から、クラス寿命（ライフサイクル）に紐づくインスタンス変数として保持する設計に変更します。

- **`AozoraParser` (src/js/modules/parser/parser.js)**
  - コンストラクタで `this.domParser` をインスタンス化し、`parseAozoraHTML` ではこれを使い回します。
  ```javascript
  constructor(tokenizer, semanticAnalyzer, evaluator, configModel) {
      ...
      /** @private @const {!DOMParser} */
      this.domParser = new DOMParser();
  }
  ```
- **`VerticalRenderer` (src/js/modules/ui/renderer.js)**
  - コンストラクタで同様に `this.domParser` を保持し、`render` メソッドで再利用します。

### 2.2. テスト環境 (JSDOM) での互換性検証
- ユニットテスト環境（Node.js + JSDOM）において、グローバルな `DOMParser` を stub するタイミングや挙動に問題が生じないかを確認します。
- `tests/unit/ui/renderer.test.js` や `tests/unit/parser/parser.test.js` の `before`/`setup` 処理にて、クラス初期化時点で `DOMParser` がグローバルスコープ上に存在することを担保します。
