---
ID: 087
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] DOMParser インスタンスの再利用化によるメモリリーク低減 (ID: 087)

## 1. 概要 / Summary
`AozoraParser` および `VerticalRenderer` において、書籍のパースや描画（`render`）の実行ごとに `new DOMParser()` されていた設計を改め、コンストラクタで生成した単一の `DOMParser` インスタンスをメンバ変数に保持して再利用する構造に変更し、メモリ効率の向上とGCオーバーヘッドを低減します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連デザイン: [DSN-01-high_level_design.md](../DSN-01-high_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [parser.js](../../src/js/modules/parser/parser.js) (`AozoraParser` のコンストラクタおよび `parseAozoraHTML`)
- [ ] [renderer.js](../../src/js/modules/ui/renderer.js) (`VerticalRenderer` のコンストラクタおよび `render`)
- [ ] [parser.test.js](../../tests/unit/parser/parser.test.js) (JSDOM環境の DOMParser ライフサイクル動作確認)
- [ ] [renderer.test.js](../../tests/unit/ui/renderer.test.js) (JSDOM環境 of DOMParser lifetime behavior check)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/084-restructure-js-modules`

1. **`AozoraParser` での再利用化 (SA主導)**
   - `src/js/modules/parser/parser.js` の `AozoraParser` コンストラクタで `this.domParser = new DOMParser();` を初期化・保持します。
   - `parseAozoraHTML` メソッド内では `this.domParser.parseFromString` を呼び出します。
2. **`VerticalRenderer` での再利用化 (SA主導)**
   - `src/js/modules/ui/renderer.js` の `VerticalRenderer` コンストラクタで `this.domParser = new DOMParser();` を初期化・保持します。
   - `render` メソッド内では `this.domParser.parseFromString` を呼び出します。
3. **テスト環境の互換性対策 (SC連携)**
   - Node.js テスト実行時に `global.DOMParser` がスタブ化される前にコンストラクタが走って参照エラーになるのを防ぐため、初期化順序に配慮した設計およびテストコードの修正を行います。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 各クラス内での `new DOMParser()` のローカル実行が排除され、メンバ変数（再利用）に置き換えられていること。
- [ ] 本のロードや画面描画を繰り返し実行しても、メモリリークや動作の遅延・ハングが発生しないこと。
- [ ] `npm test` がすべてパスすること。
