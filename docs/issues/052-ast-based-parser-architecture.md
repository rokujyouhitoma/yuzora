---
ID: 052
種別: Refactor
優先度: High
ステータス: Open (New)
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
- [ ] [parser.js](src/js/modules/parser.js)
- [ ] [app.test.js](tests/unit/app.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/052-ast-based-parser-architecture`

### 4.1. AST ノードモデルの設計
メモリ上で構築する AST ノード構造を以下のように規定します：
```typescript
interface ASTNode {
    type: 'Root' | 'Paragraph' | 'Heading' | 'Text' | 'Ruby' | 'Bold' | 'Italic' | 'Bouten' | 'PageBreak';
    value?: string;
    attributes?: {
        level?: number;       // 見出しレベル (2: 大, 3: 中, 4: 小)
        jisage?: number;      // 字下げ数
        align?: 'chitsuki' | 'chiyose' | 'chitage';
        alignValue?: number;  // 字上げの文字数
    };
    children?: ASTNode[];
}
```

### 4.2. 構文解析プロセスのパイプライン化
1. **字句解析 (Lexer / Tokenizer)**:
   - テキストを行単位で処理しつつ、文字スキャンにより文字列トークンと青空マークアップトークンに分割。
2. **構文解析 (Parser)**:
   - トークンをネスト規則に基づき木構造（AST）に組み立てる再帰降下型パーサーを実装。
3. **評価器 (Evaluator / Code Generator)**:
   - AST ノード階層を深さ優先探索（DFS）で巡回し、ホワイトリストに適合する安全な HTML 文字列に変換します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 中間表現として AST 階層構造が正しくメモリ上に生成され、任意の AST が安全な HTML に評価されること。
- [ ] 入れ子マークアップ（ルビ、太字、斜体、傍点）が壊れることなく、正しいネスト木構造としてパース・描画されること。
- [ ] 静的解析（`npm run lint`）、型チェック（`npm run test:types`）、すべてのテストが正常にパスすること。
