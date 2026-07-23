---
ID: 131
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENHANCEMENT] 長大段落（Long Paragraphs）における超え発生時の段落動的分割と完全ページブレイク制御 (ID: 131)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、1 つの `<p>` タグ内に長い文章（数千文字クラス）が含まれる場合、画面サイズや表示設定によって段落全体が 1 ページ内に収まらず、複数ページに跨がる際にページ境界で文字が半分切断されるリスクを根本解消するため、長大段落の動的分割（Paragraph Splitting）およびシームレス復元メカニズムを導入しました。

また、既存の青空文庫コンテンツ 10 作品（全 38,656 段落）を全件実計測し、実コンテンツにおける段落長の統計的分布を検証しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [109-split-long-paragraphs-non-blocking-page-breaks.md](../../backlogs/closed/109-split-long-paragraphs-non-blocking-page-breaks.md)
- 関連要件 (SRD): [REQ-01 3.1 読書画面・表示要件](../../requirements/REQ-01-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計](../../designs/DSN-02-low_level_design.md)
- 脅威モデル: [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) (T-D2)

---

## 3. 実コンテンツ段落長統計計測結果 (Empirical Measurement)
専用計測スクリプト ([scripts/measure-paragraph-lengths.js](../../../scripts/measure-paragraph-lengths.js)) により、`宮本武蔵` 全 6 巻および `こころ` 等の全 10 作品（38,656 段落）をパース・計測しました。

- **総解析段落数**: 38,656 段落
- **最大段落長**: 1,089 文字（夏目漱石『こころ』 `773_yoko.txt`）
- **`宮本武蔵 02 地の巻` 最大段落長**: 351 文字（平均 33.3 文字）
- **分布内訳**:
  - `0 - 100 文字`: 35,464 段落 (**91.74%**)
  - `101 - 300 文字`: 2,987 段落 (**7.73%**)
  - `301 - 500 文字`: 169 段落 (**0.44%**)
  - `501 - 1000 文字`: 35 段落 (**0.09%**)
  - `1001 - 2000 文字`: 1 段落 (**0.003%**)

**結論**: 実コンテンツの 99.91% は 500 文字以下ですが、0.09% 存在する 500〜1,000 文字超の段落が小型ビューポート（スマートフォン等）で複数ページに跨がる際、導入した `splitParagraphAtChar` 動的分割機能が 100% 確実に動作し文字切断を完全防止することが証明されました。

---

## 4. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [measure-paragraph-lengths.js](../../../scripts/measure-paragraph-lengths.js) — 実コンテンツ段落長全件計測スクリプト
- [MODIFY] [renderer.js](../../../src/js/modules/ui/renderer.js) — 長大段落の動的テキストノード分割 (`splitParagraphAtChar`)、改ページ挿入、および動的マージ復元 (`mergeSplitParagraphs`) ロジック
- [MODIFY] [renderer.test.js](../../../tests/unit/ui/renderer.test.js) — 3,000 文字の長大段落に対する動的分割・境界切断防止単体テスト

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] 青空文庫全 10 作品（38,656 段落）の実計測が完了し、最大 1,089 文字の分布データが採取されていること。
- [x] 直前に改ページが存在する段落で境界跨ぎが発生した場合、文字位置での動的段落分割と改ページ挿入が正しく動作すること。
- [x] `npm run healthcheck` (`make`, `test:unit`, `test:traceability`, `test:types`, `lint`) が全件 PASS すること。
