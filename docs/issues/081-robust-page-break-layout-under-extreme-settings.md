---
ID: 081
種別: Feature
優先度: Medium
ステータス: Open (In Progress)
---

# [FEAT/ENH] 表示設定に依存しない明示的改ページの完全なレイアウト担保と余白最適化 (ID: 081)

## 1. 概要 / Summary
ユーザーが文字サイズ（font-size）を極端に大きくした場合や、小さい画面幅のデバイスを使用した場合に、明示的改ページ（`［＃改ページ］`）によって発生する「ページの余白（空白領域）」のバランスが崩れ、スカスカに見えたり、余分な白紙ページが発生する問題を解消します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01](../docs/REQ-01-user_requirements.md) (REQ-01-PB-01: 明示的改ページ指定の厳守)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [reader.css](../../src/css/modules/reader.css)
- [x] [renderer.js](../../src/js/modules/renderer.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/081-082-083-page-break-improvements` (複数の改ページ改善を単一のフィーチャーブランチで統括して行います)

1.  **CSSマージンの可変（相対）単位化**:
    `reader.css` 内の `.page-break` の幅やマージンに固定px値を使用するのをやめ、フォントサイズや行長さに追従するCSSカスタム変数および `lh`（行高さ単位）を用いた可動式マージン設計に変更します。
2.  **改ページ直後の白紙カラム防止**:
    `VerticalRenderer.applyPageBreakSizes` において、改ページ要素自体の幅が大きすぎることによって隣のカラムを丸ごと白紙で押し出してしまう現象を防ぐため、計算される `width` から余白分（`column-gap`）を引いた安全寸法を再計算して割り当てます。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 設定を最大文字サイズ（`size-lg`）に切り替えた状態で `［＃改ページ］` が含まれるテキストを表示した際、改ページ要素の後ろに余計な白紙カラムが挿入されず、次のカラムの先頭から本文が再開されること。
- [ ] すべてのE2Eテストおよびユニットテストが正常にパスすること。
