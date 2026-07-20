---
ID: 067
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [Refactor] AozoraEvaluator.escapeHTML のエスケープ完全化とタイトル表示不整合の解消 (ID: 067)

## 1. 概要 / Summary
XSS防御（CWE-79）の堅牢性向上として `escapeHTML` でのエスケープ対象文字を拡張するとともに、パーサーが返却する書籍タイトル（`title`）のエスケープ処理に起因する表示上の不整合を解消します。

## 2. 詳細設計 & 対応策 (SC/SA 検討内容)

### 2.1. `AozoraEvaluator.escapeHTML` の修正
属性値コンテキストでの安全性を担保するため、ダブルクォーテーション `"` およびシングルクォーテーション `'` もエスケープ対象に追加します。
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

### 2.2. タイトル（`title`）の返却処理の修正
`AozoraParser.parseAozoraText` で `title` を生成する際、現在エスケープ済みの文字列を返却していますが、ビューアーの DOM 適用側（`viewer.js`）では安全な `textContent` を使用してタイトルを流し込んでいるため、パーサー側は生テキストをそのまま返却するように変更します。これにより、タイトルに含まれる記号（`&`等）が文字参照（`&amp;`等）のまま描画されてしまう不整合（バグ）を防止します。
- **修正対象箇所**: `src/js/modules/parser/parser.js` 内 `parseAozoraText` の戻り値オブジェクト生成部
```javascript
// 生テキストの結合に変更（escapeHTMLの呼び出しを削除）
title: title + (author ? ` (${author})` : '')
```
- **注意**: タイトルが HTML コンテキスト（`innerHTML` 等）に直接出力される危険性がないかを再度スキャンし、`textContent` へのバインド箇所のみであることを保証します。
