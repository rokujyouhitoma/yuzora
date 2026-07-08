---
ID: 045
種別: Refactor
優先度: High
ステータス: Approved
---

# [REFACT] 抽象構文木 (AST) ベースのパーサーおよび評価器への移行 (ID: 045)

## 1. 概要 / Summary
現在の青空文庫形式テキストパーサー（[parser.js](src/js/modules/parser.js)）は、正規表現による文字列置換で直接 HTML 文字列を生成する設計となっています。この方法では、マークアップの入れ子（ネスト）や構文エラーの処理が複雑化しやすく、HTML 特殊文字のエスケープ処理順序への過度な依存などセキュリティ（XSS）の脆弱性要因となり得ます。
本変更では、テキストファイルを一度トークン分割し、文書構造を表す中間データ構造「抽象構文木（AST: Abstract Syntax Tree）」のノード階層へとパースした上で、その AST を評価（Evaluate）して DOM 要素や安全な HTML を出力する本格的なコンパイラ型アーキテクチャへとリファクタリングします。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[parser.js](src/js/modules/parser.js)** (MODIFY / REWRITE):
  - トークナイザー（字句解析器）および構文解析器（Parser）を再設計し、テキストから AST を生成します。
  - AST 階層モデルを巡回して安全な HTML 文字列または DOM ノードを出力する評価器（Evaluator / Code Generator）を追加します。
- **[app.test.js](tests/unit/app.test.js)** (MODIFY / ADD):
  - 複雑な入れ子マークアップ（例: 太字の中にさらにルビと傍点が存在するケース）や構文エラーに対するテストスイートを拡張します。

---

## 3. 実装方針 / Implementation Plan
Target Branch: `refactor/045-ast-based-parser-architecture`

### 3.1. AST ノードの基本モデル設計
AST を構成するノードは、ノードタイプと子ノードの配列を保持するオブジェクトで表現します。
```typescript
interface ASTNode {
    type: 'Root' | 'Paragraph' | 'Heading' | 'Text' | 'Ruby' | 'Bold' | 'Italic' | 'Bouten' | 'PageBreak';
    value?: string;           // テキストノード等の文字列値
    attributes?: {            // 配置や属性情報
        level?: number;       // 見出しレベル (2: 大, 3: 中, 4: 小)
        jisage?: number;      // 字下げ数
        align?: 'chitsuki' | 'chiyose' | 'chitage';
        alignValue?: number;  // 字上げの文字数
    };
    children?: ASTNode[];
}
```

### 3.2. 構文解析プロセスのパイプライン化
1. **字句解析 (Lexer / Tokenizer)**:
   - プレーンテキストを行単位、または文字単位でスキャンし、通常の文字列トークンと青空マークアップの指示トークン（例: `RUBY_START`, `BOLD_START`）のストリームに分割します。
2. **構文解析 (Parser)**:
   - トークンストリームを巡回し、ネスト優先順位に基づいてノードを木構造（AST）に組み立てます（再帰降下型パーサーなど）。不整合な開始・終了マークアップは、パース時に自動で安全なテキストトークンとしてフォールバックし、壊れた HTML が生成されるのを防ぎます。
3. **評価器 (Evaluator / Code Generator)**:
   - 完成した AST のルートから深さ優先探索（DFS）で巡回し、ホワイトリストに適合する HTML タグ（`<ruby>`, `<strong>`, `<p class="...">` 等）へセキュアにマッピングします。
   - テキストノードの出力時に自動で HTML 特殊文字をエスケープするため、XSS が構造レベルで完全に防止されます。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] パース結果の中間表現として AST 階層が正しくメモリ上に生成され、任意の AST が安全な HTML に評価されること。
- [ ] 入れ子マークアップ（例: `［＃ここから太字］漢字《かんじ》［＃ここで太字終わり］`）が正しいネスト木構造としてパースされ、`<strong><ruby>漢字<rt>かんじ</rt></ruby></strong>` のように描画されること。
- [ ] エスケープ処理と置換処理が AST の木構造の評価時に一体化され、XSS 脆弱性が排除されていること。
- [ ] 静的解析（`npm run lint`）、型チェック、および既存のユニット・E2Eテストがすべて正常にパスすること。
