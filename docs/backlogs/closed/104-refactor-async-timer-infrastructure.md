---
ID: 104
種別: Refactor
優先度: High
ステータス: Closed
---

# [REF] setTimeout / 非同期タイマー処理の抽象化基盤 (Scheduler / DOMUtils / Timing) への刷新 (ID: 104)

## 1. 概要 / Summary
「ゆうぞら」の全ソースコード内（`src/js/`）に散在していた全 22 箇所の `setTimeout` 呼び出しを網羅的に監査し、設計の共通化・基盤化を完了しました。
各モジュール内に直接記述されていた magic numbers（0ms, 50ms, 400ms, 3000ms 等）の生タイマー処理を撤廃し、責務に応じて以下の **5 大共通インフラストラクチャ基盤** へカプセル化・再構築しました。

1. **`Scheduler`**: タイムスライス・フレーム予算管理（10ms）、`isInputPending()` 優先割込、`scheduler.yield()` 互換スレッド譲渡
2. **`DOMUtils`**: DOM スタイル・幾何再計算完了同期 (`rAF` + `MessageChannel` / `queueMicrotask`)
3. **`AnimationUtils`**: CSS トランジション/アニメーション完了同期 (`transitionend` イベント駆動 ＋ タイムアウト保険)
4. **`Timing`**: 高頻度イベントデバウンス (`Timing.debounce`) および無操作時 UI 自動非表示タイマー (`Timing.createInactivityTimer`)
5. **`Publisher.publishAsync`**: イベントループコールスタック切出し用の非同期イベント配信機構

---

## 2. 全 22 箇所監査マトリクスと影響範囲 / Audit Matrix & Scope

### 2.1 全 22 箇所のマッピングと置換先の定義

| # | 対象ファイル / 行番号 | 引数 (ms) | 現状の用途 | 置換先の共通基盤モジュール・API |
|---|---|---|---|---|
| 1 | [config.js](../../src/js/modules/core/config.js) | 0 | `requestIdleCallback` 未対応環境での設定保存フォールバック | `Scheduler.requestIdle(saveAction)` |
| 2 | [commands.js](../../src/js/modules/core/commands.js) | 0 | スタイル変更後の `scrollLeft` ジオメトリ計算遅延 | `DOMUtils.afterReflow(callback)` |
| 3 | [commands.js](../../src/js/modules/core/commands.js) | 300 | セッション再生マクロ時のステップ間ディレイ | `Scheduler.delay(300)` |
| 4 | [yuzora.js](../../src/js/modules/core/yuzora.js) | 0 | ページ変更時の `LAYOUT_CHECK_REQUESTED` スタック切出し | `yuzora.publisher.publishAsync(...)` |
| 5 | [yuzora.js](../../src/js/modules/core/yuzora.js) | 0 | フランクはみ出し検知時の `LAYOUT_REPAIR_REQUESTED` 切出し | `yuzora.publisher.publishAsync(...)` |
| 6 | [yuzora.js](../../src/js/modules/core/yuzora.js) | 0 | 全体はみ出しチェック時の `LAYOUT_REPAIR_REQUESTED` 切出し | `yuzora.publisher.publishAsync(...)` |
| 7 | [diagnostics.js](../../src/js/modules/core/diagnostics.js) | 0 | 診断処理時の主スレッド譲渡 (`rAF` 連携) | `Scheduler.yieldToMainThread()` |
| 8 | [diagnostics.js](../../src/js/modules/core/diagnostics.js) | 0 | 診断処理時の主スレッド譲渡 (Fallback) | `Scheduler.yieldToMainThread()` |
| 9 | [viewer.js](../../src/js/modules/ui/viewer.js) | 0 | 初期ノード描画後の自己修復 (`adjustPageBreaksForOverrun`) 遅延 | `DOMUtils.afterRender(callback)` |
| 10 | [viewer.js](../../src/js/modules/ui/viewer.js) | 0 | 描画完了後の `isReflowing` ロック解除遅延 | `DOMUtils.afterRender(callback)` |
| 11 | [viewer.js](../../src/js/modules/ui/viewer.js) | 50 | リサイズ後のビューポート跳ね防止沈静化バッファ | `Timing.createSettlementBuffer(50)` |
| 12 | [ui.js](../../src/js/modules/ui/ui.js) | 16 | 60fps スケジューラポリフィル | `DOMUtils.nextFrame()` |
| 13 | [ui.js](../../src/js/modules/ui/ui.js) | 0 | 画面遷移後のスケルトン描画遅延 | `DOMUtils.afterRender(callback)` |
| 14 | [ui.js](../../src/js/modules/ui/ui.js) | 600 | スケルトンから書籍カードへの遷移視覚タイマー | `AnimationUtils.delay(600)` |
| 15 | [ui.js](../../src/js/modules/ui/ui.js) | 150 | スクロールイベントの間引き（デバウンス） | `Timing.debounce(handleScroll, 150)` |
| 16 | [ui.js](../../src/js/modules/ui/ui.js) | 400 | 目次ジャンプ時の CSS Smooth Scroll 完了待機 | `AnimationUtils.waitForTransition(el, 400)` |
| 17 | [ui.js](../../src/js/modules/ui/ui.js) | 3000 | 無操作時のコントロール自動非表示タイマー | `Timing.createInactivityTimer(hideFn, 3000)` |
| 18 | [parser.js](../../src/js/modules/parser/parser.js) | 0 | HTML パース時の 10ms フレーム予算主スレッド譲渡 | `Scheduler.yieldToMainThread()` |
| 19 | [parser.js](../../src/js/modules/parser/parser.js) | 0 | Web Worker 内ストリームループの解放 | `Scheduler.yieldInWorker()` |
| 20 | [renderer.js](../../src/js/modules/ui/renderer.js) | 400 | ページ移動時の CSS トランジション完了 Promise | `AnimationUtils.waitForTransition(el, 400)` |
| 21 | [renderer.js](../../src/js/modules/ui/renderer.js) | 0 | リサイズ時幅再適用前のスタイル確定遅延 | `DOMUtils.afterReflow(callback)` |
| 22 | [renderer.js](../../src/js/modules/ui/renderer.js) | 0 | レイアウト修復時の 10ms 予算 / `isInputPending` 主スレッド譲渡 | `Scheduler.yieldToMainThread()` |

---

## 3. 受入基準 (DoD) / Acceptance Criteria

- [x] 全 22 箇所の `setTimeout` が `Scheduler`, `DOMUtils`, `AnimationUtils`, `Timing`, `Publisher.publishAsync` へ 100% 移植・置換されること。
- [x] 直書きの生 `setTimeout` 呼び出しが `src/js/modules/` 配下から完全に追放されること（`grep_search` 検証）。
- [x] 新設された 4 つの基盤モジュールの単体テスト (`scheduler.test.js`, `timing.test.js`, `animation.test.js`, `dom-utils.test.js`) がすべて PASS すること。
- [x] 既存の全単体テスト (`npm run test:unit`) 116 件が全件 PASS すること。
- [x] 要件・設計トレーサビリティ検証 (`npm run test:traceability`) が全件 PASS すること。
- [x] Closure Compiler ADVANCED_OPTIMIZATIONS ビルド (`make`) がエラーなしで完了すること。
- [x] TypeScript 型チェック (`npm run test:types`) および ESLint (`npm run lint`) が全件通過すること。
