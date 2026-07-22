---
ID: 099
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 自動テスト用サンプル書籍の拡充 (ID: 099)

## 1. 概要 / Summary
青空文庫形式の多様なレイアウト記法（多重ルビ、地付き、字下げ、傍点、複数の改ページ注記）が含まれる代表的な「動作確認用サンプル書籍」を追加・統合し、パース精度および表示境界の診断結果を自動テストスイートで定量的に評価・網羅します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 2.1 縦書きレイアウト診断
- 関連バックログ: [074-expand-sample-books-for-layout-diagnostics.md](../backlogs/074-expand-sample-books-for-layout-diagnostics.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] `tests/fixtures/books/sample_complex_layout.txt`
- [ ] [parser.test.js](../../tests/unit/parser/parser.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enh/099-expand-sample-books-for-layout-diagnostics`

1. **サンプル書籍フィクスチャの追加 (`tests/fixtures/books/sample_complex_layout.txt`)**:
   - 地付き、地から5字上げ、多重ルビ、改ページ注記を組み合わせた青空文庫形式サンプルテキストを作成。
2. **自動パース・境界診断テストの拡張 (`tests/unit/parser/parser.test.js`)**:
   - 追加サンプル書籍を読み込み、AST生成、HTML評価、および境界見切れエラー数がゼロであることを自動検証するユニットテストを追加。
3. **設計ドキュメントの同期 ([DSN-01](../docs/DSN-01-high_level_design.md), [DSN-02](../docs/DSN-02-low_level_design.md))**:
   - サンプル書籍データによる品質テスト要件を明記。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 新規サンプル書籍フィクスチャが `tests/fixtures/books/` 内に統合されていること。
- [ ] ユニットテスト内でサンプル書籍のパースとレイアウト境界検証が実行され、通過すること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
