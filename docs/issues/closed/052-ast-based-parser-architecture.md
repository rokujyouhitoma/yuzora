---
ID: 052
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACT] 抽象構文木 (AST) ベースのパーサーおよび評価器への移行 (ID: 052)

## 1. 概要 / Summary
現在の青空文庫形式テキストパーサー（[parser.js](src/js/modules/parser.js)）は、正規表現による文字列置換で直接 HTML 文字列を生成する設計となっています。この方法では、マークアップの入れ子（ネスト）や構文エラーの処理が複雑化しやすく、HTML 特殊文字のエスケープ処理順序への過度な依存などセキュリティ（XSS）の脆弱性要因となり得ます。
本変更では、テキストファイルを一度トークン分割し、文書構造を表す中間データ構造「抽象構文木（AST: Abstract Syntax Tree）」のノード階層へとパースした上で、その AST を評価（Evaluate）して DOM 要素や安全な HTML を出力する本格的なコンパイラ型アーキテクチャへとリファクタリングします。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [045-ast-based-parser-architecture.md](../backlogs/closed/045-ast-based-parser-architecture.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [parser.js](src/js/modules/parser.js) (パーサークラス群および AST / トークナイザー定義の全面移行)
- [ ] [app.test.js](tests/unit/app.test.js) (ネストマークアップ用テストケース追加)
- [ ] [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) (仕様の追記)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/052-ast-based-parser-architecture`

### 4.1. AST ノードの基本モデル設計
```typescript
interface ASTNode {
    type: 'Root' | 'Paragraph' | 'Heading' | 'Text' | 'Ruby' | 'Bold' | 'Italic' | 'Bouten' | 'PageBreak';
    value?: string;
    attributes?: {
        level?: number;
        jisage?: number;
        align?: 'chitsuki' | 'chiyose' | 'chitage';
        alignValue?: number;
    };
    children?: ASTNode[];
}
```

### 4.2. 解析パイプラインの実装仕様
1. **字句解析 (Lexer / Tokenizer)**:
   - 入力行または文字ストリームからスキャンを行います。
   - トークン一覧：
     - `TEXT(value)`: 通常文字列
     - `RUBY_START(target)`, `RUBY_END(rt)`: ルビ指定 (例: `｜漢字《かんじ》` は `RUBY_START(漢字)`, `RUBY_END(かんじ)`)
     - `BOUTEN_START`, `BOUTEN_END`: 傍点指定
     - `BOLD_START`, `BOLD_END`: 太字
     - `ITALIC_START`, `ITALIC_END`: 斜体
2. **構文解析 (Parser)**:
   - 字句解析で得られたトークンを処理し、AST を組み立てます。
   - 再帰降下型パーサーまたはループによるネストスタック処理を行い、不整合（閉じられていないタグ）はフォールバックして通常のテキストノードに復元させ、壊れた木構造が生成されないようにします。
3. **評価器 (Evaluator / Code Generator)**:
   - `ASTNode` を深さ優先探索（DFS）で巡回し、HTML を構築します。
   - **セキュアな出力エスケープ**:
     - `Text` ノードを出力する際、必ず `escapeHTML(value)` を呼び出して安全な文字列に変換します。これにより、パースされたテキストの内部からスクリプトがインジェクションされる脅威を構造レベルで排除します。
     - 生成された HTML を最終描画時に DOM サニタイザー（`sanitizeDOM`）へ引き渡し、二重の防壁を維持します。

### 4.3. 設計ドキュメントの更新
- **[DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md)**:
  - 「2.1 テキストファイルのパース (`parseAozoraText`)」に、AST パースのパイプライン（字句解析・構文解析・評価）および AST ノード定義、ネスト解決アルゴリズムを追記します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] パース処理が AST の構築と評価モデルに完全リファクタリングされ、既存のテスト（ルビ、傍点、地付き、太字、斜体等）がすべてパスすること。
- [ ] ネストしたマークアップ（例: `［＃ここから太字］重要箇所｜漢字《かんじ》［＃ここで太字終わり］`）が正しいネスト（`strong` の下に `ruby`）としてパースされ、適切に描画されること。
- [ ] テキストノード出力時に確実に実体参照エスケープが行われ、XSSインジェクション攻撃テストケースがパスすること。
- [ ] 静的解析（`npm run lint`）、型チェック（`npm run test:types`）、すべてのテストが正常にパスすること。
- [ ] 実装内容が `DSN-02-low_level_design.md` の記述と一致していること。

