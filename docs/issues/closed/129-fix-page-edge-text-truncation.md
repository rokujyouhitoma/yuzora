---
ID: 129
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] `宮本武蔵 02 地の巻` 等におけるページ左右端の文字切れ（半分切断）の根本修正と精密レイアウト計測 (ID: 129)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（`宮本武蔵 02 地の巻` 等、311KB超）の読書中にページの左端および右端のテキストが縦方向・横方向に半分切断され、文字の可読性が著しく害される極めて重篤な UX 課題を根本解決しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [107-fix-page-edge-text-truncation.md](../../backlogs/closed/107-fix-page-edge-text-truncation.md)
- 関連要件 (SRD): [REQ-01 3.1 読書画面・表示要件](../../requirements/REQ-01-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計](../../designs/DSN-02-low_level_design.md)
- 脅威モデル: [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) (T-D2)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [renderer.js](../../../src/js/modules/ui/renderer.js) — `applyPageBreakSizes` の 5px バッファ歪み削除、`adjustPageBreaksForOverrun` の非破壊ウィンドウ型改ページ管理、正確なピクセル残り幅幾何計算
- [MODIFY] [renderer.test.js](../../../tests/unit/ui/renderer.test.js) — ページ境界での文字オーバーラップ切断（Range/Rect Boundary Overrun）防止単体テストの追加

---

## 4. 完了条件 (DoD) / Success Criteria
- [x] `宮本武蔵 02 地の巻` (311KB) を読書した際、ページの左端および右端で文字が半分に切断・途切れる現象が 1 件も発生しないこと。
- [x] `applyPageBreakSizes()` における 5px 端数バッファ歪みが解消され、`remainingWidth` がピクセル単位で正確に計算されること。
- [x] ウィンドウ型修復時において、他ページの計算済み `.dynamic-page-break` が破壊されないこと。
- [x] `npm run healthcheck` (`make`, `test:unit`, `test:traceability`, `test:types`, `lint`) が全件 PASS すること。
