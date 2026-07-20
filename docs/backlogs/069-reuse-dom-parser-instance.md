---
ID: 069
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [Refactor] DOMParser インスタンスの再利用化によるメモリリーク低減 (ID: 069)

## 1. 概要 / Summary
書籍パース（`AozoraParser`）および描画処理（`VerticalRenderer`）において、都度 `new DOMParser()` が実行される設計を見直し、インスタンスを使い回す構造に変更します。これにより、SPAとして繰り返し書籍をロード・表示した際のメモリリークの可能性を低減し、GC（ガベージコレクション）スパイクの発生を予防します。

## 2. 影響範囲と関連ファイル (Scope & Affected Files)
- `src/js/modules/parser/parser.js` (`AozoraParser` クラス)
- `src/js/modules/ui/renderer.js` (`VerticalRenderer` クラス)
- `tests/unit/parser/parser.test.js` (ユニットテストでの DOMParser モック影響確認)
- `tests/unit/ui/renderer.test.js` (ユニットテストでの DOMParser モック影響確認)

## 3. 要件と技術的詳細 (Requirements & Technical Details)

### 3.1. インスタンス変数への移行 (SA主導)
- **`AozoraParser` への適用**:
  - コンストラクタ（`constructor`）内で `this.domParser = new DOMParser();` を実行し、メンバ変数に保持します。
  - `parseAozoraHTML(htmlString)` メソッド内で `const parser = new DOMParser();` となっていた箇所を `this.domParser` の利用に置き換えます。
- **`VerticalRenderer` への適用**:
  - コンストラクタ（`constructor`）内で `this.domParser = new DOMParser();` を実行し、メンバ変数に保持します。
  - `render(htmlContent)` メソッド内で `const parser = new DOMParser();` となっていた箇所を `this.domParser` の利用に置き換えます。

### 3.2. テスト環境 (JSDOM) での互換性 (SC主導)
- Node.js 環境（`tests/unit/`）でユニットテストを走らせる際、`before()` や初期モック化のフェーズで `global.DOMParser = window.DOMParser` などの設定が行われる前にクラスのインスタンス化が走ると、`DOMParser is not defined` エラーが発生します。
- そのため、テスト用 setup 時点、あるいはインスタンスが生成されるタイミングにおいて、確実に `global.DOMParser` がスタブまたは実体（JSDOMのDOMParser）として定義されていることを検証します。

## 4. 受入基準 (Definition of Done)
1. `parser.js` および `renderer.js` から `new DOMParser()` をメソッド内部でローカル生成しているコードが完全に排除されていること。
2. ユニットテストおよび Playwright E2E テストが正常にパスすること（特に JSDOM 環境下で `DOMParser` の参照エラーが発生しないこと）。
3. 書籍を複数回連続でロードした際、描画が正常に行われ、メモリエラーやフリーズが発生しないこと。
4. `npm test` がすべてパスすること。
