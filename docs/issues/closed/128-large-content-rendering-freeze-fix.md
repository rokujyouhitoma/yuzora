---
ID: 128
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] 大容量書籍（宮本武蔵等）ロード直後の入力不能・UIフリーズ不具合の修正とレンダリング最適化 (ID: 128)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（例：`宮本武蔵 02 地の巻` 等、311KB超・十数万文字）を読書画面（`/#/reader?library=...`）で読み込んだ直後、画面の操作入力（スクロール、タッチ、ボタンクリック）を一切受け付けなくなり「UIフリーズ（応答なし）」状態に陥る最重要不具合を根本修正しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [106-large-content-rendering-freeze-fix.md](../../backlogs/closed/106-large-content-rendering-freeze-fix.md)
- 関連要件 (SRD): [REQ-01 3.1 読書画面・表示要件](../../requirements/REQ-01-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計](../../designs/DSN-02-low_level_design.md)
- 脅威モデル: [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) (T-D2)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [renderer.js](../../../src/js/modules/ui/renderer.js) — `adjustPageBreaksForOverrun` のウィンドウ型修復化（現在ビューポート付近限定スキャン）、`window.getComputedStyle` 撤廃、`applyPageBreakSizes` バッチ化、デバッグプロファイリングログ出力の追加

---

## 4. 完了条件 (DoD) / Success Criteria
- [x] `宮本武蔵 02 地の巻` (311KB) ロード直後、ユーザーのスクロール・クリック操作が 100ms 以内に即時反応すること。
- [x] レイアウト自己修復がビューポート周辺ウィンドウに限定され、初期表示時の Long Task (50ms超) が発生しないこと。
- [x] `npm run healthcheck` (`make`, `test:unit`, `test:traceability`, `test:types`, `lint`) が全件 PASS すること。
