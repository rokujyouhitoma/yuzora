---
ID: 104
種別: Refactor
優先度: High
ステータス: Approved
---

# [REF] setTimeout / 非同期タイマー処理の抽象化基盤 (Scheduler / DOMUtils / Timing) への刷新 (ID: 104)

## 1. 概要 / Summary
「ゆうぞら」の全ソースコード内に分散存在する 22 箇所の `setTimeout` 呼び出しを抽象化・基盤モジュールへ再構成します。
 empirical magic numbers (例: 0ms, 50ms, 400ms) による生タイマー記述を全廃し、タイムスライス（`Scheduler`）、DOM描画同期（`DOMUtils`）、CSSアニメーション待機（`AnimationUtils`）、デバウンス・自動非表示（`Timing`）、および非同期イベント発行（`Publisher`）の 5 大共通基盤へカプセル化・再構築します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [NEW] [scheduler.js](../../src/js/frameworks/scheduler.js) — タイムスライスおよびスレッド譲渡制御 (`Scheduler.yieldToMainThread`, `Scheduler.runTimeSliced`)
- [NEW] [timing.js](../../src/js/frameworks/timing.js) — デバウンスおよび無操作タイマー (`Timing.debounce`, `Timing.createInactivityTimer`)
- [NEW] [animation.js](../../src/js/frameworks/animation.js) — イベント駆動型アニメーション完了同期 (`AnimationUtils.waitForTransition`)
- [MODIFY] [publisher.js](../../src/js/frameworks/publisher.js) — マクロタスク非同期イベント配信 (`Publisher.prototype.publishAsync`) の標準追加
- [MODIFY] [config.js](../../src/js/modules/core/config.js) — `saveAction` における `Scheduler.requestIdle` 統合
- [MODIFY] [commands.js](../../src/js/modules/core/commands.js) — `ChangeConfigCommand` の DOM 同期および `CommandManager.importJSON` の非同期再生統括
- [MODIFY] [yuzora.js](../../src/js/modules/core/yuzora.js) — `publishAsync` によるイベントスタック解体
- [MODIFY] [diagnostics.js](../../src/js/modules/core/diagnostics.js) — `Scheduler.runTimeSliced` 適用
- [MODIFY] [viewer.js](../../src/js/modules/ui/viewer.js) — 自己修復およびリサイズ後の沈静化バッファ制御の基盤化
- [MODIFY] [ui.js](../../src/js/modules/ui/ui.js) — スケルトン遷移、スクロールデバウンス、自動非表示タイマーの `Timing` 基盤化
- [MODIFY] [parser.js](../../src/js/modules/parser/parser.js) — HTML パース時スレッド譲渡の `Scheduler.yieldToMainThread` 化
- [MODIFY] [renderer.js](../../src/js/modules/ui/renderer.js) — レイアウト修復スレッド譲渡および CSS 遷移待機の `AnimationUtils` 化
- [MODIFY] [externs.js](../../src/externs.js) — 新規基盤クラス (`Scheduler`, `Timing`, `AnimationUtils`) の Closure Compiler 保護宣言
- [NEW] [scheduler.test.js](../../tests/unit/frameworks/scheduler.test.js) — Scheduler モジュールの単体テストスイート
- [NEW] [timing.test.js](../../tests/unit/frameworks/timing.test.js) — Timing モジュールの単体テストスイート

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 5 大共通基盤モジュールの設計要件
1. **Scheduler (タイムスライス & スレッド譲渡)**:
   - `isInputPending()` および `performance.now()` フレーム予算（10ms）管理の共通カプセル化。
   - `Scheduler.yieldToMainThread()` および `Scheduler.runTimeSliced(items, taskFn, options)` を提供。
2. **DOMUtils (DOM 再描画 & スタイル確定同期)**:
   - `requestAnimationFrame` + `MessageChannel` / `queueMicrotask` による確定同期関数 `DOMUtils.afterReflow(callback)` の提供。
3. **AnimationUtils (CSS 遷移・アニメーション完了同期)**:
   - 固定タイマー `setTimeout(400)` を `transitionend` / `animationend` イベント駆動化。タイムアウト保険（fallbackMs）付き `AnimationUtils.waitForTransition(element, fallbackMs)` を提供。
4. **Timing (デバウンス & 自動非表示タイマー)**:
   - 高階関数 `Timing.debounce(fn, waitMs)` および `Timing.createInactivityTimer(onHide, timeoutMs)` を提供。
5. **Publisher.publishAsync (非同期イベント発行)**:
   - `queueMicrotask` / `setTimeout(0)` による非同期イベント配信インターフェースの追加。

---

## 4. システムアーキテクト（SA）チームによる複数回レビュー履歴 / Multi-SA Review Iterations

### Pass 1: リードアーキテクト & コアインフラ SA レビュー
- **判定**: `src/js/frameworks/` 配下に `scheduler.js`, `timing.js`, `animation.js` を独立モジュールとして新設。
- **巡回依存の排除**: `frameworks` 層は `modules` 層に依存せず、基盤サービスとしてLocatorに注入可能な疎結合設計を徹底。

### Pass 2: Web パフォーマンス & マイクロオプティマイゼーション SA レビュー
- **メモリ効率・GCアロケーション最適化**: スクロールデバウンス等の高頻度イベントにおいてアクロバティックな関数生成を行わず、内部タイマーID参照を再利用する軽量設計を採択。
- **将来互換性**: ブラウザ標準の `scheduler.yield()` が利用可能な場合は自動的に採用するフォールバック/プログレッシブエンハンスメント機構を組み込む。

### Pass 3: 品質保証 & 安全性 SA レビュー
- **イベントリスナーリーク防止**: `AnimationUtils.waitForTransition` において、`transitionend` イベント発火時またはタイムアウトタイムアウト発生時の双方で、必ずリスナーおよびタイマーを二重解除（Clean-up Guard）する堅牢化処理を規定。
- **Closure Compiler 難読化保護**: `src/externs.js` に全メソッドのプロトタイプ保護宣言を追加し、ビルド後のシンボル消失を防止。

---

## 5. 受入基準 (DoD) / Acceptance Criteria

- [x] ソースコード内 (`src/js/`) から直書きの生 `setTimeout` 呼び出しが基盤モジュール経由に一元化・置換されること。
- [x] 既存のすべての単体テスト (`npm run test:unit`) が全件パスすること。
- [x] タイマー共通基盤 (`Scheduler`, `Timing`, `AnimationUtils`) の新規単体テストを追加・パスすること。
- [x] Closure Compiler 難読化ビルド (`make`) および Lint・型チェックがエラーなしで完了すること。
