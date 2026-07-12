---
ID: 066
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] parser.js からトークナイザー、パーサー、意味解析器、評価器、および AST ノードへのクラス・ファイル分離 (ID: 066)

## 1. 概要 / Summary
`src/js/modules/parser.js` に混在している字句解析（トークナイザー）、構文解析（パーサー）、意味規則検証（意味解析器）、コード生成（評価器/Evaluator）、および AST ノードモデルを、単一責任の原則に基づきそれぞれ独立したクラスおよび物理ファイルにリファクタリングします。
これにより、コードの保守性・拡張性・テスト容易性を大幅に向上させます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (縦書き・ルビ・青空文庫仕様準拠)
- 関連要件 (SRD): REQ-03-SRD-03 (パーサーモジュール)
- 関連バックログ: [055-separate-parser-evaluator-and-nodes.md](../backlogs/closed/055-separate-parser-evaluator-and-nodes.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/tokenizer.js](../../src/js/modules/tokenizer.js) [NEW] — `AozoraTokenizer` クラスの定義
- [x] [src/js/modules/ast-nodes.js](../../src/js/modules/ast-nodes.js) [NEW] — `ASTNode` および派生ノードクラスの定義
- [x] [src/js/modules/semantic-analyzer.js](../../src/js/modules/semantic-analyzer.js) [NEW] — `AozoraSemanticAnalyzer` クラスの定義
- [x] [src/js/modules/evaluator.js](../../src/js/modules/evaluator.js) [NEW] — `AozoraEvaluator` クラスの定義
- [x] [src/js/modules/parser.js](../../src/js/modules/parser.js) [MODIFY] — `AozoraParser` クラスの定義と、既存の非構造化関数の廃止
- [x] [src/js/modules/yuzora.js](../../src/js/modules/yuzora.js) [MODIFY] — locator / window へのクラス登録
- [x] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) [MODIFY] — パース呼び出しの変更
- [x] [src/js/types.d.ts](../../src/js/types.d.ts) [MODIFY] — 新クラスの型定義追加
- [x] [src/externs.js](../../src/externs.js) [MODIFY] — Closure Compiler 用プロトタイプ定義
- [x] [Makefile](../../Makefile) [MODIFY] — `JS_SRCS` に新規ファイルを追加
- [x] [tests/unit/parser.test.js](../../tests/unit/parser.test.js) [MODIFY] — 新規テストおよび 10 作品横断検証の追加

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/066-separate-parser-evaluator-and-nodes`

### 4.1 新規モジュール群の実装
1. **`ast-nodes.js`**:
   - `ASTNode` 基底クラス：`constructor(type, value, rt, children)` を持つ。
   - `RootNode`, `TextNode`, `RubyNode`, `BoldNode`, `ItalicNode`, `BoutenNode` などの具象クラスを定義し、それぞれ型安全に `type` 文字列（`"Root"`, `"Text"`, `"Ruby"` 等）や子配列などを初期化する。
   - Closure Compiler でプロパティがクラッシュするのを防ぐため、各ノードのプロパティ（`type`, `value`, `rt`, `children`）を公開。
2. **`tokenizer.js`**:
   - `AozoraTokenizer` クラス：`tokenizeInline(text)` メソッド。
   - ルビや装飾などの字句解析（トークン化）ロジックを `parser.js` から移植し、トークンオブジェクトの配列を返す。
3. **`semantic-analyzer.js`**:
   - `AozoraSemanticAnalyzer` クラス：`analyze(astRoot)` メソッド。
   - AST 構造を巡回し、意味的妥当性を検証・補正する。
   - **規則1**: ルビ（`RubyNode`）の下位ツリーに別の `RubyNode` が存在してはならない。検知した場合、ネストされた内側の `RubyNode` をプレーンな `TextNode` に変換する（警告をコンソールに記録）。
   - **規則2**: 不正な装飾ネストの正規化（木構造の補正）。
4. **`evaluator.js`**:
   - `AozoraEvaluator` クラス：`evaluate(astRoot)` メソッド。
   - AST ノードを再帰的に走査し、HTML文字列へ出力。
   - `escapeHTML` 等の XSS 防御サニタイズ（T-E1対策）を完全に統合。
5. **`parser.js`**:
   - `AozoraParser` クラス：`parseTokensToAST(tokens)` メソッド。
   - トークン配列から AST（`RootNode` 等）を構築する。
   - ファイル全体の行スキャン（`parseAozoraText`）を担当する部分（ヘッダー解析、記号説明スキップ、表紙HTML生成、行レベルのアライメント・字下げパース）は、`AozoraParser` のメソッド（例: `parseAozoraText(text)`) として再構成し、内部で `Tokenizer` -> `Parser` -> `SemanticAnalyzer` -> `Evaluator` のコンパイラパイプラインを順に呼び出すように統合する。
   - XHTML用パース `parseAozoraHTML()` も `AozoraParser` 内へクラスメソッドとして移譲する。

### 4.2 システム連携とビルド設定
1. **`yuzora.js`**:
   - 新しいクラス（`AozoraTokenizer`, `AozoraParser`, `AozoraSemanticAnalyzer`, `AozoraEvaluator`）を `Yuzora` オブジェクトや `window` プロキシに露出。
   - locator への新規登録（依存注入の準備）。
2. **`viewer.js`**:
   - `displayBook()` のパース呼び出し箇所を、新クラス `AozoraParser` のインスタンス解決＆メソッド呼び出しに更新。
3. **`Makefile`**:
   - `JS_SRCS` の適切な順序（`tokenizer.js`, `ast-nodes.js`, `semantic-analyzer.js`, `evaluator.js`, `parser.js` の順。パーサーはノードやトークナイザーに依存するため後方に配置）にファイルを追加。
4. **`externs.js` / `types.d.ts`**:
   - Closure Compiler が新クラスのプロパティやメソッド名を難読化により破壊するのを防ぐため、新しいインターフェース名とプロトタイプ定義を追加。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] クラスが `AozoraTokenizer`、`AozoraParser`、`AozoraSemanticAnalyzer`、`AozoraEvaluator`、および `ASTNode` に正しく分割され、個別のファイルに分離されていること。
- [x] 意味解析器（`AozoraSemanticAnalyzer`）がルビのネスト違反を正常に検知・補正でき、テストでアサートされていること。
- [x] 収録されているプリセットの10作品（「こころ」「故郷」「宮本武蔵 01〜08」）を検証用として、以下の横断的観点がすべてユニットテストでパスすること。
  - **メタデータ・表紙**: タイトル・著者名抽出、エスケープ済表紙HTML生成。
  - **記号ブロック除外**: 記号解説テキストのスキップ。
  - **見出しと目次**: 見出し記法が正しい `h` タグに変換され、TOCに正確な階層レベルで登録されていること。
  - **レイアウト装飾**: 字下げ、アライメント、太字・斜体・傍点がすべて正しいクラス属性とタグに変換されていること。
  - **パフォーマンス・堅牢性**: 全作品がクラッシュせずに高速にパースされること。
- [x] ビルドコマンド `make` が正常に終了し、Closure Compiler での型安全チェックおよびトランスパイルがパスすること。
- [x] 既存のすべてのテスト（ユニットテストおよび Playwright E2E テスト）が 100% 成功すること。
- [x] 本リファクタリングが [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に整合していること（必要に応じて LLD を更新）。
