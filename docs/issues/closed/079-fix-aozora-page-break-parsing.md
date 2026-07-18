---
ID: 079
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] 本文中の青空文庫改ページ記法「［＃改ページ］」のパース不具合の修正 (ID: 079)

## 1. 概要 / Summary
青空文庫形式のテキストにおける改ページ指定 `［＃改ページ］` が、本文中に存在する場合に正しくパースされず、空段落として無視されてしまう不具合を修正します。

### 再現手順 / Steps to Reproduce
1. 本文中に `［＃改ページ］` を含むテキストファイル（例: `本文第一段\n［＃改ページ］\n本文第二段`）を読み込む。
2. 出力された HTML を確認すると、改ページ記法のあった位置が空の段落 `<p></p>` になっており、改ページ要素 `<div class="page-break"></div>` が出力されていない。

### 再現環境 / Environment
- Browser / OS: 全ブラウザ環境
- Book / File: 本文中に `［＃改ページ］` を含むテキスト

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [parser.js](file:///workspace/yuzora/src/js/modules/parser.js)
- [x] [parser.test.js](file:///workspace/yuzora/tests/unit/parser.test.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
*   **不具合の原因**: `AozoraTokenizer` において、定義された特定のマークアップ（太字や傍点等）以外の `［＃` で始まる注記を一律スキップする設計になっているため、`［＃改ページ］` がインラインパースの前にスキップされてしまいます。その結果、パーサーは当該行を空段落（`ParagraphNode`）として処理してしまいます。
*   **テストの False Positive**: `parser.test.js` における検証アサーションが `result.body.includes('<div class="page-break"></div>')` であるため、カバーページ（表紙）の直後に自動挿入される `page-break` 要素の存在によってテストが意図せずパスしてしまい、バグが隠蔽されていました。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
*   **暫定対処 (Workaround)**: なし（パーサー自体の修正が必要）。
*   **恒久対策 (Permanent Fix)**:
    `AozoraParser` が各行をパースする際、行全体が `［＃改ページ］` に一致する場合に、トークナイザーを通さずに直接 AST に `PageBreakNode` を追加するように修正します（ブロックレベル解析への追加）。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/079-aozora-page-break-parsing`

1.  **`AozoraParser` (parser.js) の修正**:
    `parseAozoraText` の `lines` ループにおいて、行全体が `［＃改ページ］` であるかをチェックする処理を、空行判定の前後に追加します。
    ```javascript
    if (line.trim() === '［＃改ページ］') {
        documentChildren.push(new PageBreakNode());
        continue;
    }
    ```
2.  **`parser.test.js` の修正**:
    テスト `should parse page break marker` のアサーションを変更し、生成された HTML 内に `<div class="page-break"></div>` が2個（表紙用と本文中用）存在することを検証するようにします。
    ```javascript
    const pageBreaks = result.body.match(/<div class="page-break"><\/div>/g) || [];
    assert.strictEqual(pageBreaks.length, 2, '改ページ要素が表紙後と本文中の計2箇所に生成されること');
    ```

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] 本文中に `［＃改ページ］` が含まれるテキストをパースした際、出力されるHTML内に `<div class="page-break"></div>` が2個（表紙後＋本文中）存在すること。
- [ ] 修正後のテスト `should parse page break marker` が正常にパスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の既存設計スペックと一貫していること。
