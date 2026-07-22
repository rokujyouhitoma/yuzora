---
ID: 106
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] DOM仮想化（Virtual Scroll）による大容量書籍表示時のメモリ負荷低減 (ID: 106)

## 1. 概要 / Summary
大容量書籍データ表示時のメモリフットプリント低減およびレイアウト描画高速化のため、段落位置キャッシュ (`paragraphBoundsCache`) を含む DOM 仮想化レンダリング機構を導入・最適化します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.8 DOM 仮想化・表示最適化
- 関連バックログ: [085-dom-virtualization.md](../backlogs/085-dom-virtualization.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [renderer.js](../../src/js/modules/ui/renderer.js)
- [ ] [renderer.test.js](../../tests/unit/ui/renderer.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/106-dom-virtualization`

1. **DOM 仮想化・段落境界キャッシュの拡張 (`renderer.js`)**:
   - `VerticalRenderer` の `cacheParagraphBounds` および `paragraphBoundsCache` による可視領域内外の境界判定を強化。
2. **ユニットテストでの動作検証 (`renderer.test.js`)**:
   - 大容量テキストスクロール時の段落境界キャッシュ更新と仮想化判定の正確性を検証。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 段落境界キャッシュおよび仮想化判定がユニットテストで検証されること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
