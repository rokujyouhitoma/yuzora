---
ID: 077
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] 自己修復レイアウトエンジンにおける動的改ページの動的サイズ計算適用 (ID: 077)

## 1. 概要 / Summary
自己修復レイアウトエンジン（`adjustPageBreaksForOverrun`）が動作した際、見切れが発生した段落の前に動的な改ページ要素（`<div class="page-break dynamic-page-break"></div>`）を挿入しますが、挿入された要素のサイズ（幅・ logical margin）がループ処理中に即時計算・反映されず、`0px` のまま次の段落の判定へと進んでいました。
このため、直前に挿入された改ページによって本来ならば次のページへシフト（避難）するはずの後続の段落が、シフト前の古い座標情報に基づいて判定されてしまい、重複して余分な動的改ページが挿入されたり、位置測定の歪みが発生したりする問題を修正しました。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [renderer.js](../../src/js/modules/renderer.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. `VerticalRenderer.adjustPageBreaksForOverrun()` 内のループで、各段落のオーバーラン判定 `checkAndRepairParagraph(child, readerViewport)` を順次実行していた。
2. もし見切れが検出されて動的な改ページ要素が挿入された場合、そのDOM構造変化に伴う新しいレイアウト座標の再計算（`applyPageBreakSizes()`）がループの外（処理の最後）で一括で行われていた。
3. ループの途中で動的改ページの幅が `0` のままだと、後続の段落の位置情報（`getBoundingClientRect()`）が正しくシフトされず、見切れがすでに解消されたはずの段落に対しても誤ってオーバーランが検出されてしまう。
4. 解決策として、ループ内で動的改ページの挿入が成功（`checkAndRepairParagraph` が `true` を返却）した直後に、`this.applyPageBreakSizes()` を即時実行して後続要素のレイアウト位置を最新状態へ同期させる必要がある。

---

## 4. 恒久対策 / Permanent Fix
* **恒久対策 (Permanent Fix)**:
  1. `adjustPageBreaksForOverrun()` のループにおいて、`checkAndRepairParagraph` が `true`（修復実行）を返した場合に、`this.applyPageBreakSizes()` を即時実行して座標位置を再同期する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] 自己修復レイアウトエンジンによって動的改ページが挿入された際、後続要素が即座に同期・再配置されて正しいページ先頭位置へシフトされること。
- [x] すべてE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
