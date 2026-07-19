---
ID: 061
種別: Bug
優先度: High
ステータス: Closed
---

# [Bug] 本文中の青空文庫改ページ記法「［＃改ページ］」のパース不具合の修正 (ID: 061)

## 1. 概要 / Summary
青空文庫形式のテキストにおける改ページ指定 `［＃改ページ］` が、本文中に存在する場合に正しくパースされず、空段落として無視されてしまう不具合を修正します。

### 不具合の詳細
*   **トークナイザーでのスキップ**: `AozoraTokenizer` において、`［＃` から始まる任意の文字列を一律スキップするロジック（注記スキップ処理）になっているため、`［＃改ページ］` がトークン化されず無視されています。
*   **テストの形骸化（False Positive）**: `parser.test.js` における改ページパースの検証コードは、自動挿入されるカバーページの直後の `page-break` 要素の存在を拾ってパスしてしまっており、テストとして機能していません。

## 2. 影響範囲と関連ファイル / Scope and Affected Files
*   [parser.js](file:///workspace/yuzora/src/js/modules/parser.js): `parseAozoraText` の行ループで、トリミング後の行が `［＃改ページ］` に完全一致する場合に `PageBreakNode` を直接 AST に挿入するように実装を追加します。
*   [parser.test.js](file:///workspace/yuzora/tests/unit/parser.test.js): テストケース `should parse page break marker` を改善し、表紙後の自動改ページと本文中の改ページの「計2箇所」に出力されていることを厳密に検証するようにアサーションを修正します。

## 3. 詳細要件と実装ステップ / Detailed Requirements and Implementation Steps
*   **要件 1**: 行全体が `［＃改ページ］` である場合、その行を空の段落（`<p></p>`）ではなく、ブロック要素としての `<div class="page-break"></div>` に変換する。
*   **要件 2**: カバーページ直後に自動挿入される `page-break` 要素への依存を防ぎ、テストの False Positive（誤検知）を排除する。
*   **設計方針**:
    1.  `AozoraParser.parseAozoraText` 内の `lines` に対する `for` ループで、各行のトリミングされた文字列 `line.trim()` が `'［＃改ページ］'` であるかを判定する。
    2.  判定が真の場合、`documentChildren.push(new PageBreakNode())` を実行し、当該行の処理を完了して次の行へ進む（`continue`）。
    3.  これにより、トークナイザーやインラインAST解析への突入を防ぎ、余分な `ParagraphNode` が作成されるのを防ぐ。

## 4. 受入基準 (DoD) / Acceptance Criteria
*   [ ] 本文中に `［＃改ページ］` が含まれるテキストをパースした際、出力 HTML 内の `<div class="page-break"></div>` が2個（表紙後＋本文中）存在すること。
*   [ ] テストケース `should parse page break marker` が厳密なカウント検証に変更された上で正常にパスすること。
*   [ ] 既存のパーサー関連の単体テストおよびE2Eテストがすべて正常にパスし、他の注記処理（太字や傍点等）にデグレードが発生しないこと。
