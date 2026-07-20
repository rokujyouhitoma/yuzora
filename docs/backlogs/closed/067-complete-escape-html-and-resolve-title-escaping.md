---
ID: 067
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [Refactor] AozoraEvaluator.escapeHTML のエスケープ完全化とタイトル表示不整合の解消 (ID: 067)

## 1. 概要 / Summary
XSS防御（CWE-79）の堅牢性向上として `escapeHTML` でのエスケープ対象文字を拡張するとともに、パーサーが返却する書籍タイトル（`title`）のエスケープ処理に起因する表示上の不整合を解消します。

## 2. 影響範囲と関連ファイル (Scope & Affected Files)
- `src/js/modules/parser/evaluator.js` (AozoraEvaluator.escapeHTML)
- `src/js/modules/parser/parser.js` (AozoraParser.parseAozoraText)
- `tests/unit/parser/parser.test.js` (AozoraParser のテスト)
- `tests/unit/core/yuzora.test.js` (Yuzora 全体のタイトル取得テスト等)

## 3. 要件と技術的詳細 (Requirements & Technical Details)

### 3.1. エスケープ関数の安全化 (SC主導)
- **対象**: `AozoraEvaluator.prototype.escapeHTML`
- **修正内容**: ダブルクォーテーション `"` (`&quot;`) およびシングルクォーテーション `'` (`&#x27;`) を置換ルールに追加。これにより、将来属性コンテキスト（`<span title="USER_INPUT">` 等）へエスケープ値を挿入する設計変更が行われた際にも属性の抜け出しを防ぎます。
```javascript
escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;');
}
```

### 3.2. タイトル返却処理の生テキスト化 (SA主導)
- **対象**: `AozoraParser.prototype.parseAozoraText`
- **修正内容**: 現在、タイトルおよび著者名は `escapeHTML` を適用して返されていますが、画面出力側（`viewer.js`）はセキュアな `textContent` を使用してタイトルタグを更新しているため、二重エスケープが発生して特殊記号がそのまま文字参照として画面表示されます。これを防ぐため、パーサーは生テキストを返すように統一します。
```javascript
title: title + (author ? ` (${author})` : '')
```

### 3.3. 既存機能への影響検証
- `displayBook` 等でタイトルを DOM に出力する箇所が `textContent` 以外の `innerHTML` 等を介して出力されていないか（直接タグ埋め込みされていないか）を確認し、安全性（XSSが発生しないこと）を確認します。

## 4. 受入基準 (Definition of Done)
1. `escapeHTML` に `"` や `'` を含む文字列を渡した際、正しくエスケープされることのユニットテストが追加・パスすること。
2. 特殊記号を含む書籍名（例: `A & B "C"`）のテキストファイルを読み込んだ際、画面上のタイトル表示部に二重エスケープ（`&amp;` や `&quot;`）が発生せず、正しくデコードされた状態で表示されること。
3. `npm test` がすべてパスすること。
