---
ID: 085
種別: Feature
優先度: Medium
ステータス: In Progress
---

# [FEAT/ENH] AozoraEvaluator.escapeHTML のエスケープ完全化とタイトル表示不整合の解消 (ID: 085)

## 1. 概要 / Summary
XSS防御（CWE-79）の堅牢性向上として `escapeHTML` でのエスケープ対象文字にダブルクォーテーション `"` およびシングルクォーテーション `'` を追加するとともに、パーサーが返却する書籍タイトル（`title`）のエスケープ処理を削除（生テキスト化）し、ビューアー側で安全にレンダリングする不整合解消を実施します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連デザイン: [DSN-01-high_level_design.md](../DSN-01-high_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [evaluator.js](file:///workspace/yuzora/src/js/modules/parser/evaluator.js) (`AozoraEvaluator.prototype.escapeHTML`)
- [ ] [parser.js](file:///workspace/yuzora/src/js/modules/parser/parser.js) (`AozoraParser.prototype.parseAozoraText` 内戻り値オブジェクト)
- [ ] [parser.test.js](file:///workspace/yuzora/tests/unit/parser/parser.test.js) (タイトルエスケープ不整合解消に伴う期待値修正と、`escapeHTML` 自体の新規テスト追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/084-restructure-js-modules`

1. **`AozoraEvaluator.prototype.escapeHTML` の修正 (SC連携)**
   - 文字列中の `"` を `&quot;`、`'` を `&#x27;` に置換する正規表現ルールを追加します。
2. **`AozoraParser.prototype.parseAozoraText` の修正 (SA主導)**
   - タイトルおよび著者名を結合する箇所の `this.evaluator.escapeHTML` の呼び出しを削除し、生テキストで結合して返します。
3. **ユニットテストの追加と修正 (SA主導)**
   - `parser.test.js` 内の AozoraParser に対する書籍ロードテストで、タイトル検証期待値（特にエスケープされていたものがあれば生テキスト）を修正します。
   - `escapeHTML` 単体のエスケープテスト（`"` や `'` が正しくエスケープされることの検証）を `parser.test.js` または対応するユニットテストに追加します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `AozoraEvaluator.escapeHTML` が `&`, `<`, `>`, `"`, `'` を正しく文字参照にエスケープすること。
- [ ] 特殊文字を含むタイトルの本をロードした際、画面上のタイトル表示部分で二重エスケープや文字崩れがなく正しく表示されること。
- [ ] `npm test` がすべてパスすること。
