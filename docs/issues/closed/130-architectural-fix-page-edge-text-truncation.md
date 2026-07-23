---
ID: 130
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] `宮本武蔵 02 地の巻` 等における CSS Multi-column アーキテクチャ再設計によるページ左右端文字切れの根本解決 (ID: 130)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（`宮本武蔵 02 地の巻` 等、311KB超）の読書時にページの左端および右端のテキストが縦方向・横方向に半分切断され、文字の可読性が著しく害される極めて重篤な UX 課題をアーキテクチャレベルで根本再設計し解決しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [108-architectural-fix-page-edge-text-truncation.md](../../backlogs/closed/108-architectural-fix-page-edge-text-truncation.md)
- 関連要件 (SRD): [REQ-01 3.1 読書画面・表示要件](../../requirements/REQ-01-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計](../../designs/DSN-02-low_level_design.md)
- 脅威モデル: [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) (T-D2)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [reader.css](../../../src/css/modules/reader.css) — `vw` から `%` 容器相対 Column Width への算定式刷新
- [MODIFY] [style.css](../../../src/css/style.css) — メディアクエリにおける Column Width 算定式の統一
- [MODIFY] [renderer.js](../../../src/js/modules/ui/renderer.js) — JS カラム幾何パラメータの非破壊同期
- [MODIFY] [renderer.test.js](../../../tests/unit/ui/renderer.test.js) — 多層ビューポートにおける文字境界切断防止アサーションテストの拡張

---

## 4. 完了条件 (DoD) / Success Criteria
- [x] `column-width` の算定式が `%` 容器相対単位へ刷新され、スクロールバーの有無に関わらずページ左右端の文字切断が 0 件であること。
- [x] `reader.css` と `style.css` のメディアクエリ設定が完全一致すること。
- [x] `npm run healthcheck` (`make`, `test:unit`, `test:traceability`, `test:types`, `lint`) が全件 PASS すること。
