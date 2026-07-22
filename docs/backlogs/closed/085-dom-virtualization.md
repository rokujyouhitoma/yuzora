---
ID: 085
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] DOM仮想化（Virtual Scroll）による大容量書籍表示時のメモリ負荷低減 (ID: 085)

## 1. 概要 / Summary
大容量の書籍データであっても、ブラウザ上のDOMツリー内には現在表示されている数ページ分（およびその直前・直後の数カラム分のバッファ）のみをレンダリングし、非表示の段落要素はDOMから動的にアンマウント（キャッシュ待避）して再利用する「DOM仮想化」機構を導入します。これにより、モバイル端末や低スペックハードウェア環境におけるブラウザのメモリフットプリントと描画レイテンシを低減します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [renderer.js](../../src/js/modules/ui/renderer.js)
- [DSN-01](../docs/DSN-01-high_level_design.md)
- [DSN-02](../docs/DSN-02-low_level_design.md)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- `VerticalRenderer` に段落位置のキャッシュ (`paragraphBoundsCache`) と描画バッファウィンドウ評価ロジックを統合し、スクロール位置に応じたノード最適化と仮想化処理を提供する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] 段落キャッシュおよび視域ベースのレンダリング最適化ロジックが正常に動作し、ユニットテストで検証されること。
