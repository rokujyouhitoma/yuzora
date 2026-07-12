---
ID: 055
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] parser.js からトークナイザー、パーサー、意味解析器、評価器、および AST ノードへのクラス・ファイル分離 (ID: 055)

## 1. 概要 / Summary
現在、`src/js/modules/parser.js` には、青空文庫テキストを解析して AST (抽象構文木) を生成する「トークナイザー/パーサー」、AST ノードを解釈して HTML を構築する「評価器 (Evaluator)」、および AST の構造を表現する「ノードクラス群 (Node)」が単一のファイル・グローバル関数群として混在して定義されています。

この構成は単一責任の原則 (Single Responsibility Principle) に反しており、将来的な文法拡張や各コンポーネントに対する独立した単体テストの記述、モジュール間の疎結合性の維持においてボトルネックとなる可能性があります。

本バックログでは、これらを厳密に役割別のクラスとして再定義し、個別の物理ファイルに分離します。さらに、構文的に正しくても意味的に不正な構造（例：ルビタグのネスト等）をチェック・警告・補正する「意味解析器 (Semantic Analyzer)」のフェーズを導入し、堅牢なコンパイラパイプラインとしての設計を実現します。

---

## 2. 詳細仕様と設計アプローチ / Detailed Specifications

### 2.1 提案する分離設計とモジュール構成
1. **`ast-nodes.js` (AST ノードモデル)**:
   - すべての構文木ノードの基底となる `ASTNode` クラスを定義。
   - 具体的な構文要素（`RootNode`, `TextNode`, `RubyNode`, `BoldNode`, `ItalicNode`, `BoutenNode` など）を派生クラスとして定義。
   - 木構造の走査を容易にし型安全性を確保するため、ノード種別ごとのプロパティ（`type`, `children`, `value` など）を統一・整理する。
2. **`tokenizer.js` (トークナイザー/Tokenizer)**:
   - 文字列からトークン配列への変換を担当する `AozoraTokenizer` クラスを定義。
   - `tokenize(text)` メソッドを公開し、字句解析を行う。
3. **`parser.js` (パーサー/Parser)**:
   - トークン配列から構文解析を行い、AST (構文木) を構築する `AozoraParser` クラスを定義。
   - `parse(tokens)` メソッドを公開し、入れ子（Bold, Italic, Bouten など）を考慮した AST を組み立てる。
4. **`semantic-analyzer.js` (意味解析器/Semantic Analyzer)**:
   - 構築された AST を巡回・検査し、意味規則の検証を行う `AozoraSemanticAnalyzer` クラスを定義。
   - 例：青空文庫の仕様上、ルビ（《》）の中にルビを入れるような不正な二重ネストは許容されない。意味解析層においてこれらを検知し、適切な警告や木構造の自動補正を実行する。
5. **`evaluator.js` (評価器/Evaluator)**:
   - 検証済みの AST を巡回・評価して HTML 文字列へ変換する `AozoraEvaluator` クラスを定義。
   - HTML エスケープなどの安全対策（XSS防御）を含み、最終的な出力コード生成を担う。

### 2.2 意味規則の検証（Semantic Rules）
意味解析器（`AozoraSemanticAnalyzer`）では以下の規則を厳密にチェックします。
- **ルビのネスト制限**: `RubyNode` の子孫ノードとして別の `RubyNode` が存在してはならない。
- **装飾タグの不適切なネスト**: 対応関係が不正、または重複する同一装飾タグの適用を簡素化・平坦化する。
- **エラーハンドリング**: 規則違反を検出した際、パース全体をクラッシュさせるのではなく、安全なフォールバック（例：プレーンテキストとして描画、または木構造を補正して無視）を実施し、診断システムへログ/警告を記録する。

---

## 3. テストケース要件 (10作品に基づく検証) / Test Case Requirements (10 Books Verification)
本リファクタリングのデグレーションを防ぎ、新パーサー・評価器の堅牢性を保証するため、`src/books/` 配下に存在するプリセットの 10 作品を検証ソースとした統合テストケースを追加します。

### 3.1 対象作品と検証項目
1. **`773_yoko.txt` (夏目漱石「こころ」)**
   - 検証項目: 大規模テキストにおけるトークナイズ速度。大見出し（`上　先生と私`など）が正しく AST に抽出され、TOC リストと一致すること。多数のルビタグ（`<ruby>`）の出力整合性。
2. **`42939_yoko.txt` (魯迅「故郷」)**
   - 検証項目: 記号説明ブロックの正確な除外。作品名と著者名が正しく抽出され、モデルに反映されること。
3. **`52395_yoko.txt` (吉川英治「宮本武蔵 01 序、はしがき」)**
   - 検証項目: はしがき特有のテキスト構造のパース。
4. **`52396_yoko.txt` (吉川英治「宮本武蔵 02 地の巻」)**
   - 検証項目: 多数の章見出し（中見出し・小見出し）の AST マッピングと TOC 抽出。
5. **`52397_yoko.txt` (吉川英治「宮本武蔵 03 水の巻」)**
   - 検証項目: 地から○字上げ等のレイアウトタグ、字下げ指示の AST クラス（`jisage` 属性等）への変換整合性。
6. **`52398_yoko.txt` (吉川英治「宮本武蔵 04 火の巻」)**
   - 検証項目: 特殊な文字装飾や記号のパース。
7. **`52399_yoko.txt` (吉川英治「宮本武蔵 05 風 of the roll」)**
   - 検証項目: 英語混じりの表記、ルビ付与対象文字の判定。
8. **`52400_yoko.txt` (吉川英治「宮本武蔵 06 空の巻」)**
   - 検証項目: ルビ、字下げ、見出しの複合構造解析。
9. **`52401_yoko.txt` (吉川英治「宮本武蔵 07 二天の巻」)**
   - 検証項目: 段落の境界と改行コード処理。
10. **`52402_yoko.txt` (吉川英治「宮本武蔵 08 円明の巻」)**
    - 検証項目: 最終巻特有の見出し構成、末尾の注記。

### 3.2 共通のアサーションルール
各作品のパース処理をフックするユニットテストを追加し、以下の項目をアサートします：
- **クラッシュフリー**: 10作品の生テキストをパースする際、例外や無限ループが発生せず、正常に HTML 生成を完了すること。
- **メタデータの同期**: `BookModel` に抽出されたタイトル・著者が、`config.js` の `PREDEFINED_BOOKS` に設定された期待されるタイトル・著者情報と正確に一致すること。
- **HTMLタグサニタイズ**: 生成された HTML 全体が `DOMParser` を通過し、悪意あるタグを含まずに安全に描画可能な構造になっていること。

---


## 4. 影響範囲と関連ファイル / Scope and Affected Files

### [Core/Data Model & Compilers]
- **[NEW] [tokenizer.js](file:///workspace/yuzora/src/js/modules/tokenizer.js)** — `AozoraTokenizer` の定義。
- **[NEW] [ast-nodes.js](file:///workspace/yuzora/src/js/modules/ast-nodes.js)** — `ASTNode` および派生ノードクラスの定義。
- **[NEW] [semantic-analyzer.js](file:///workspace/yuzora/src/js/modules/semantic-analyzer.js)** — `AozoraSemanticAnalyzer` の定義。
- **[NEW] [evaluator.js](file:///workspace/yuzora/src/js/modules/evaluator.js)** — `AozoraEvaluator` の定義。
- **[MODIFY] [parser.js](file:///workspace/yuzora/src/js/modules/parser.js)** — `AozoraParser` の定義と、既存のグローバルパーサー処理の廃止（新モジュール群への委譲）。

### [System & Build Configurations]
- **[MODIFY] [yuzora.js](file:///workspace/yuzora/src/js/modules/yuzora.js)** — 各種新規クラスを locator や window プロキシに適切にバインド・公開するよう更新。
- **[MODIFY] [viewer.js](file:///workspace/yuzora/src/js/modules/viewer.js)** — `displayBook()` でのパース・HTML生成処理を新構成のコンパイラパイプライン（`Tokenizer` -> `Parser` -> `SemanticAnalyzer` -> `Evaluator`）呼び出しに書き換え。
- **[MODIFY] [types.d.ts](file:///workspace/yuzora/src/js/types.d.ts)** — 新しいクラス・インターフェースの型定義の追加。
- **[MODIFY] [externs.js](file:///workspace/yuzora/src/externs.js)** — Closure Compiler のコンパイルを通すため、新インターフェースおよび公開メソッドのプロトタイプを追加。
- **[MODIFY] [Makefile](file:///workspace/yuzora/Makefile)** — `JS_SRCS` に新規作成するファイルを追加。

### [Tests]
- **[MODIFY] [parser.test.js](file:///workspace/yuzora/tests/unit/parser.test.js)** — トークナイザー、パーサー、意味解析器、評価器それぞれの単体テストおよび検証ケースの追加。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 解析ロジックが `AozoraTokenizer`、`AozoraParser`、`AozoraSemanticAnalyzer`、`AozoraEvaluator`、および `ASTNode` クラスへ正しくリファクタリングされ、ファイルが物理的に分離されていること。
- [ ] AST ノードがオブジェクト指向的でかつ型安全なクラス群として設計・実装されていること。
- [ ] 意味解析器（`AozoraSemanticAnalyzer`）がルビの不適切なネストなどの規則違反を正しく検証・警告・自動補正できること。また、そのための単体テストが記述されていること。
- [ ] ビルドコマンド `make` が正常に終了し、Closure Compiler での型安全チェックおよびトランスパイルがパスすること。
- [ ] 既存のすべてのテスト（ユニットテストおよび Playwright E2E テスト）が 100% 成功すること。
