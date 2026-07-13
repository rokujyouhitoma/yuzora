---
ID: 069
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] Parser からの HTML 組み立て処理の完全排除と Evaluator への責務集約 (ID: 069)

## 1. 概要 / Summary
`AozoraParser` (構文解析) と `AozoraEvaluator` (コード生成/HTML出力) の責務分担を厳格化します。
現状の設計では、`AozoraParser` 内で一部 HTML タグ文字列の直接組み立て（空行 `<p class="empty-line">`、カバーページ `<div class="book-cover-page">`、改ページ `<div class="page-break">`、段落 `<p>`、見出し `<h>`）が混入してしまっています。
これを完全に排除し、パーサーは純粋な抽象構文木 (AST) の構築のみに専念させます。HTML への具体的なコード生成処理はすべて `AozoraEvaluator` の責務として一元化します。これにより、構文パースと出力形式の依存結合を排除し、拡張性とセキュリティを向上させます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (縦書き・ルビ・青空文庫仕様準拠)
- 関連要件 (SRD): REQ-03-SRD-03 (パーサーモジュール)
- 関連バックログ: [057-parser-evaluator-responsibility-separation.md](../backlogs/057-parser-evaluator-responsibility-separation.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/ast-nodes.js](../../src/js/modules/ast-nodes.js) [MODIFY] — ブロック要素に対応する新たな AST ノードクラス (`DocumentNode`, `CoverPageNode`, `PageBreakNode`, `EmptyLineNode`, `HeadingNode`, `ParagraphNode`) の定義追加
- [x] [src/js/modules/parser.js](../../src/js/modules/parser.js) [MODIFY] — `AozoraParser` から HTML 文字列構築処理を完全排除し、ドキュメント全体を木構造 AST として表現・構築するようリファクタリング
- [x] [src/js/modules/evaluator.js](../../src/js/modules/evaluator.js) [MODIFY] — `AozoraEvaluator` に新規ブロックノードのコード生成ロジックを追加し、安全な HTML 出力を組み立てるよう実装
- [x] [src/externs.js](../../src/externs.js) [MODIFY] — 新規追加されたノードプロパティの Closure Compiler 用 extern 定義追加
- [x] [src/js/types.d.ts](../../src/js/types.d.ts) [MODIFY] — 各 AST ノードのインターフェース定義追加
- [x] [tests/unit/parser.test.js](../../tests/unit/parser.test.js) [MODIFY] — AST 構造および出力された HTML が従来と同一であることを検証するテスト

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/069-parser-evaluator-responsibility-separation`

1. `ast-nodes.js` に `DocumentNode`, `CoverPageNode`, `PageBreakNode`, `EmptyLineNode`, `HeadingNode`, `ParagraphNode` を追加する。
2. `parser.js` 内の `parseAozoraText` をリファクタリングし、HTML 文字列を直接組み立てる代わりに、上記のノードインスタンスから構成される `DocumentNode` を生成するように変更する。
3. `evaluator.js` の `evaluateNode` を拡張し、新しいブロックレベルノードの HTML 文字列生成処理を実装する。
4. `types.d.ts` と `externs.js` に新しいノードおよびプロパティの定義を追加して Closure Compiler 型安全を担保する。
5. `tests/unit/parser.test.js` にブロックレベル AST 評価のテストを追加し、出力された HTML がリファクタリング前と同一であることを検証する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `AozoraParser` のソースコード内に HTML タグ文字列が一切含まれていないこと。
- [x] すべてのブロック要素が `AozoraEvaluator` を通じて動的生成されていること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] `make` による Closure Compiler 圧縮ビルドが正常に完了すること。
