---
ID: 126
種別: Refactor
優先度: High
ステータス: Closed
---

# [REF] setTimeout / 非同期タイマー処理の抽象化基盤 (Scheduler / DOMUtils / Timing) への刷新 (ID: 126)

## 1. 概要 / Summary
「ゆうぞら」の全ソースコード内（`src/js/`）に散在していた全 22 箇所の `setTimeout` 呼び出しを網羅的に監査し、設計の共通化・基盤化を完了しました。
[MNG-00 開発思想](../MNG-00-development_philosophy.md) の「クライアントサイド完結型・レスポンシブ UX」および高度なモジュール抽象化に則り、各モジュール内に直接記述されていた magic numbers（0ms, 50ms, 400ms, 3000ms 等）の生タイマー処理を撤廃し、5 大共通インフラストラクチャ基盤 (`Scheduler`, `DOMUtils`, `AnimationUtils`, `Timing`, `Publisher.publishAsync`) へ完全カプセル化・再構築しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [104-refactor-async-timer-infrastructure.md](../../backlogs/closed/104-refactor-async-timer-infrastructure.md)
- 関連要件 (SRD): [REQ-03 3.4 リソース管理要件](../../requirements/REQ-03-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計](../../designs/DSN-02-low_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [scheduler.js](../../../src/js/frameworks/scheduler.js) — タイムスライス・スレッド譲渡・Idle 管理基盤
- [NEW] [timing.js](../../../src/js/frameworks/timing.js) — デバウンス・無操作タイマー・沈静化バッファ管理基盤
- [NEW] [animation.js](../../../src/js/frameworks/animation.js) — イベント駆動型アニメーション/トランジション同期基盤
- [NEW] [dom-utils.js](../../../src/js/frameworks/dom-utils.js) — DOM 再描画・フレーム同期基盤
- [MODIFY] [publisher.js](../../../src/js/frameworks/publisher.js) — 非同期マクロタスクイベント配信 (`publishAsync`) 追加
- [MODIFY] [config.js](../../../src/js/modules/core/config.js) — `Scheduler.requestIdle` へ統一
- [MODIFY] [commands.js](../../../src/js/modules/core/commands.js) — `DOMUtils.afterReflow` および `Scheduler.delay` へ統一
- [MODIFY] [yuzora.js](../../../src/js/modules/core/yuzora.js) — `Publisher.publishAsync` へ統一
- [MODIFY] [diagnostics.js](../../../src/js/modules/core/diagnostics.js) — `Scheduler.yieldToMainThread` へ統一
- [MODIFY] [viewer.js](../../../src/js/modules/ui/viewer.js) — `DOMUtils.afterRender` および `Timing.createSettlementBuffer` へ統一
- [MODIFY] [ui.js](../../../src/js/modules/ui/ui.js) — `Timing` および `AnimationUtils` へ統一
- [MODIFY] [parser.js](../../../src/js/modules/parser/parser.js) — `Scheduler.yieldToMainThread` へ統一
- [MODIFY] [renderer.js](../../../src/js/modules/ui/renderer.js) — `Scheduler.yieldToMainThread` および `AnimationUtils` へ統一
- [MODIFY] [Makefile](../../../Makefile) — 新規基盤モジュールの Closure Compiler ビルドパス追加
- [MODIFY] [externs.js](../../../src/externs.js) — 新規基盤モジュールの Closure Compiler 難読化保護宣言
- [NEW] [scheduler.test.js](../../../tests/unit/frameworks/scheduler.test.js) — `Scheduler` 単体テスト
- [NEW] [timing.test.js](../../../tests/unit/frameworks/timing.test.js) — `Timing` 単体テスト
- [NEW] [animation.test.js](../../../tests/unit/frameworks/animation.test.js) — `AnimationUtils` 単体テスト
- [NEW] [dom-utils.test.js](../../../tests/unit/frameworks/dom-utils.test.js) — `DOMUtils` 単体テスト

---

## 4. 完了条件 (DoD) / Success Criteria
- [x] 全 22 箇所の `setTimeout` が `Scheduler`, `DOMUtils`, `AnimationUtils`, `Timing`, `Publisher.publishAsync` へ 100% 移植・置換されること。
- [x] 直書きの生 `setTimeout` 呼び出しが `src/js/modules/` 配下から完全に追放されること（`grep_search` 検証）。
- [x] 新設された 4 つの基盤モジュールの単体テスト (`scheduler.test.js`, `timing.test.js`, `animation.test.js`, `dom-utils.test.js`) がすべて PASS すること。
- [x] 既存の全単体テスト (`npm run test:unit`) 116 件が全件 PASS すること。
- [x] 要件・設計トレーサビリティ検証 (`npm run test:traceability`) が全件 PASS すること。
- [x] Closure Compiler ADVANCED_OPTIMIZATIONS ビルド (`make`) がエラーなしで完了すること。
- [x] TypeScript 型チェック (`npm run test:types`) および ESLint (`npm run lint`) が全件通過すること。
