---
ID: 057
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] Parser からの HTML 組み立て処理の完全排除と Evaluator への責務集約 (ID: 057)

## 1. 概要 / Summary
`AozoraParser` (構文解析) と `AozoraEvaluator` (コード生成/HTML出力) の責務分担を厳格化します。
現状の設計では、`AozoraParser` 内で一部 HTML タグ文字列の直接組み立て（空行 `<p class="empty-line">`、カバーページ `<div class="book-cover-page">`、改ページ `<div class="page-break">`、段落 `<p>`、見出し `<h>`）が混入してしまっています。
これを完全に排除し、パーサーは純粋な抽象構文木 (AST) の構築のみに専念させます。HTML への具体的なコード生成処理はすべて `AozoraEvaluator` の責務として一元化します。これにより、構文パースと出力形式の依存結合を排除し、拡張性とセキュリティを向上させます。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [src/js/modules/ast-nodes.js](../../src/js/modules/ast-nodes.js) [MODIFY] — ブロック要素に対応する新たな AST ノードクラス (`DocumentNode`, `CoverPageNode`, `PageBreakNode`, `EmptyLineNode`, `HeadingNode`, `ParagraphNode`) の定義追加
- [ ] [src/js/modules/parser.js](../../src/js/modules/parser.js) [MODIFY] — `AozoraParser` から HTML 文字列構築処理を完全排除し、ドキュメント全体を木構造 AST として表現・構築するようリファクタリング
- [ ] [src/js/modules/evaluator.js](../../src/js/modules/evaluator.js) [MODIFY] — `AozoraEvaluator` に新規ブロックノードのコード生成ロジックを追加し、安全な HTML 出力を組み立てるよう実装
- [ ] [src/externs.js](../../src/externs.js) [MODIFY] — 新規追加されたノードプロパティの Closure Compiler 用 extern 定義追加
- [ ] [src/js/types.d.ts](../../src/js/types.d.ts) [MODIFY] — 各 AST ノードのインターフェース定義追加
- [ ] [tests/unit/parser.test.js](../../tests/unit/parser.test.js) [MODIFY] — AST 構造および出力された HTML が従来と同一であることを検証するテスト

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 ブロックレベル AST の導入
テキスト全体を表現するブロックレベルの AST 設計を導入します。
- `DocumentNode`: ドキュメント全体のルートノード。子要素にブロック要素のノードを持つ。
- `CoverPageNode`: 表紙ページを表す。タイトルと著者名を保持する。
- `PageBreakNode`: 改ページを表す。
- `EmptyLineNode`: 空行を表す。
- `HeadingNode`: 見出しを表す。見出しレベル (`level`)、目次ID (`headingId`)、子要素にインライン AST を持つ。
- `ParagraphNode`: 段落を表す。字下げクラス (`jisageClass`)、配置クラス (`alignmentClass`)、子要素にインライン AST を持つ。

### 3.2 責務の明確な分離
- **AozoraParser**: 青空文庫テキストの行ループ処理を行い、行メタデータの解析（見出し注記、地付き、字下げなど）およびトークナイズを行い、それらを AST（`DocumentNode` をルートとする階層構造）に変換して返します。HTML の構築は行いません。
- **AozoraEvaluator**: 構築された AST を深さ優先探索でトラバースし、セキュアに HTML 文字列を出力（コード生成）します。HTML エスケープやサニタイズなどのセキュリティ原則はすべてこのモジュール内に完結させます。

### 3.3 後方互換性と結合テスト
- `AozoraParser.parseAozoraText()` の返却シグネチャ `{ title, body }` は変更せず、内部で `evaluator.evaluate(documentAST)` を呼び出して HTML 文字列を取得・返却することで、既存の `viewer.js` や `yuzora.js` の変更を最小限に抑えます。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `AozoraParser` のソースコード内に HTML タグ文字列（`<div`, `<p`, `<h`, `PAGE_BREAK` 置換など）が一切含まれていないこと。
- [ ] すべてのブロック要素（カバーページ、段落、空行、改ページ、見出し）が `AozoraEvaluator` を通じて動的生成されていること。
- [ ] 既存の 10 書籍のパースおよび HTML レンダリング結果が本リファクタリングの前後で完全に一致し、デモ動作に影響を与えないこと。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] `make` による Closure Compiler 圧縮ビルドが正常に完了すること。
