---
ID: 055
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] parser.js からトークナイザー、パーサー、評価器、および AST ノードへのクラス・ファイル分離 (ID: 055)

## 1. 概要 / Summary
現在、`src/js/modules/parser.js` には、青空文庫テキストを解析して AST (抽象構文木) を生成する「トークナイザー/パーサー」、AST ノードを解釈して HTML を構築する「評価器 (Evaluator)」、および AST の構造を表現する「ノードクラス群 (Node)」が単一のファイル・グローバル関数群として混在して定義されています。

この構成は単一責任の原則 (Single Responsibility Principle) に反しており、将来的な文法拡張や各コンポーネントに対する独立した単体テストの記述、モジュール間の疎結合性の維持においてボトルネックとなる可能性があります。

本バックログでは、これらを厳密に役割別のクラスとして再定義し、個別の物理ファイルに分離します。

### 提案する分離設計
1. **`tokenizer.js` (トークナイザー/Tokenizer)**:
   - 青空文庫テキストの字句解析を担当し、トークン（Tokens）の配列を生成するクラス（例: `AozoraTokenizer`）を定義。
2. **`parser.js` (パーサー/Parser)**:
   - 生成されたトークン配列から構文解析を行い、AST (抽象構文木) を構築するクラス（例: `AozoraParser`）を定義。
3. **`evaluator.js` (評価器/Evaluator)**:
   - 構築された AST を巡回・評価して HTML 文字列へ変換するクラス（例: `AozoraEvaluator`）を定義。
4. **`ast-nodes.js` (AST ノードモデル/AST Nodes)**:
   - 各種構文要素に対応するノードクラス（`TextNode`, `RubyNode`, `BoldNode`, `ItalicNode`, `GroupNode` 等）を定義。必要に応じて共通の基底クラス `ASTNode` を作成。

これにより、字句解析・構文解析・中間表現・コード生成というコンパイラパイプラインとしての設計をクリーンに整理し、各モジュールの保守性・拡張性を向上させます。
