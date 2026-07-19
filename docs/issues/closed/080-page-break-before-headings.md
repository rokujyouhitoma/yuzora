---
ID: 080
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 見出しの直前での自動改ページ機能の追加 (ID: 080)

## 1. 概要 / Summary
「見出し（大・中・小見出し）」が表示される際、その直前の要素が別の「見出し」や「ページブレイク（改ページ要素）」ではない場合に、自動的に改ページを発生させ、見出しが新しいページ（カラム）の先頭に配置されるようにするレイアウト改善機能です。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (レイアウト品質の向上)
- 関連要件 (SRD): REQ-02 (見出しおよび改ページ表示仕様)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [parser.js](../../src/js/modules/parser.js)
- [x] [parser.test.js](../../tests/unit/parser.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/080-page-break-before-headings`

1.  **`AozoraParser` (parser.js) の変更**:
    `parseAozoraText` の `lines` ループ内で `isHeading === true` と判定された場合の処理に、直前要素の判定および自動改ページの挿入処理を追加します。
    *   **判定ロジック**:
        `documentChildren` 配列を末尾から走査し、`EmptyLineNode`（空行）以外の最初のノード（実質的な直前ノード `prevNode`）を取得します。
        ```javascript
        let prevNode = null;
        for (let j = documentChildren.length - 1; j >= 0; j--) {
            if (documentChildren[j].type !== 'EmptyLine') {
                prevNode = documentChildren[j];
                break;
            }
        }
        ```
    *   **挿入条件**:
        対象の見出しが「大見出し（`headingLevel === 2`）」または「中見出し（`headingLevel === 3`）」であり、かつ `prevNode` が存在し、その `type` が `'Heading'`、`'PageBreak'`、`'CoverPage'` のいずれでもない場合に、見出しノードを追加する直前に `documentChildren.push(new PageBreakNode())` を実行します。

2.  **`parser.test.js` への検証テストの追加**:
    自動改ページ機能の動作確認およびエッジケース（例外パターン）を網羅するテストケースを追加します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] **大・中見出しの自動改ページ**: `本文\n［＃大見出し］` などのテキストをパースした際、出力されるHTML内に `<div class="page-break"></div>` が2個（表紙後＋見出し前）存在すること。
- [ ] **小見出しの除外**: `本文\n［＃小見出し］` をパースした際、見出しの前に自動改ページが挿入されず、改ページ要素が1個（表紙後のみ）であること。
- [ ] **連続見出し時の重複排除**: `［＃大見出し］\n［＃中見出し］` （または空行を挟む場合）のように見出しが連続した場合、中見出しの前に余分な改ページが挿入されず、改ページ要素が1個（表紙後のみ）であること。
- [ ] **明示的改ページ直後**: `本文\n［＃改ページ］\n［＃大見出し］` のパターンで、大見出しの前に余分な自動改ページが挿入されず、改ページ要素が2個（表紙後＋明示的改ページ）のみであること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の既存設計スペックと一貫していること。
