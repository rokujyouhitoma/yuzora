---
ID: 104
種別: Refactor
優先度: High
ステータス: Approved
---

# [REF] setTimeout / 非同期タイマー処理の抽象化基盤 (Scheduler / DOMUtils / Timing) への刷新 (ID: 104)

## 1. 概要 / Summary
「ゆうぞら」の全ソースコード内（`src/js/`）に散在する全 22 箇所の `setTimeout` 呼び出しを網羅的に監査し、設計の共通化・基盤化を実施します。
各モジュール内に直接記述された magic numbers（0ms, 50ms, 400ms, 3000ms 等）の生タイマー処理を撤廃し、責務に応じて以下の **5 大共通インフラストラクチャ基盤** へカプセル化・再構築します。

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
| 1 | [config.js](../../src/js/modules/core/config.js#L353) | 0 | `requestIdleCallback` 未対応環境での設定保存フォールバック | `Scheduler.requestIdle(saveAction)` |
| 2 | [commands.js](../../src/js/modules/core/commands.js#L125) | 0 | スタイル変更後の `scrollLeft` ジオメトリ計算遅延 | `DOMUtils.afterReflow(callback)` |
| 3 | [commands.js](../../src/js/modules/core/commands.js#L719) | 300 | セッション再生マクロ時のステップ間ディレイ | `Scheduler.delay(300)` |
| 4 | [yuzora.js](../../src/js/modules/core/yuzora.js#L198) | 0 | ページ変更時の `LAYOUT_CHECK_REQUESTED` スタック切出し | `yuzora.publisher.publishAsync(...)` |
| 5 | [yuzora.js](../../src/js/modules/core/yuzora.js#L210) | 0 | フランクはみ出し検知時の `LAYOUT_REPAIR_REQUESTED` 切出し | `yuzora.publisher.publishAsync(...)` |
| 6 | [yuzora.js](../../src/js/modules/core/yuzora.js#L216) | 0 | 全体はみ出しチェック時の `LAYOUT_REPAIR_REQUESTED` 切出し | `yuzora.publisher.publishAsync(...)` |
| 7 | [diagnostics.js](../../src/js/modules/core/diagnostics.js#L139) | 0 | 診断処理時の主スレッド譲渡 (`rAF` 連携) | `Scheduler.yieldToMainThread()` |
| 8 | [diagnostics.js](../../src/js/modules/core/diagnostics.js#L142) | 0 | 診断処理時の主スレッド譲渡 (Fallback) | `Scheduler.yieldToMainThread()` |
| 9 | [viewer.js](../../src/js/modules/ui/viewer.js#L195) | 0 | 初期ノード描画後の自己修復 (`adjustPageBreaksForOverrun`) 遅延 | `DOMUtils.afterRender(callback)` |
| 10 | [viewer.js](../../src/js/modules/ui/viewer.js#L215) | 0 | 描画完了後の `isReflowing` ロック解除遅延 | `DOMUtils.afterRender(callback)` |
| 11 | [viewer.js](../../src/js/modules/ui/viewer.js#L443) | 50 | リサイズ後のビューポート跳ね防止沈静化バッファ | `Timing.createSettlementBuffer(50)` |
| 12 | [ui.js](../../src/js/modules/ui/ui.js#L124) | 16 | 60fps スケジューラポリフィル | `DOMUtils.nextFrame()` |
| 13 | [ui.js](../../src/js/modules/ui/ui.js#L126) | 0 | 画面遷移後のスケルトン描画遅延 | `DOMUtils.afterRender(callback)` |
| 14 | [ui.js](../../src/js/modules/ui/ui.js#L135) | 600 | スケルトンから書籍カードへの遷移視覚タイマー | `AnimationUtils.delay(600)` |
| 15 | [ui.js](../../src/js/modules/ui/ui.js#L306) | 150 | スクロールイベントの間引き（デバウンス） | `Timing.debounce(handleScroll, 150)` |
| 16 | [ui.js](../../src/js/modules/ui/ui.js#L1063) | 400 | 目次ジャンプ時の CSS Smooth Scroll 完了待機 | `AnimationUtils.waitForTransition(el, 400)` |
| 17 | [ui.js](../../src/js/modules/ui/ui.js#L1087) | 3000 | 無操作時のコントロール自動非表示タイマー | `Timing.createInactivityTimer(hideFn, 3000)` |
| 18 | [parser.js](../../src/js/modules/parser/parser.js#L439) | 0 | HTML パース時の 10ms フレーム予算主スレッド譲渡 | `Scheduler.yieldToMainThread()` |
| 19 | [parser.js](../../src/js/modules/parser/parser.js#L746) | 0 | Web Worker 内ストリームループの解放 | `Scheduler.yieldInWorker()` |
| 20 | [renderer.js](../../src/js/modules/ui/renderer.js#L144) | 400 | ページ移動時の CSS トランジション完了 Promise | `AnimationUtils.waitForTransition(el, 400)` |
| 21 | [renderer.js](../../src/js/modules/ui/renderer.js#L164) | 0 | リサイズ時幅再適用前のスタイル確定遅延 | `DOMUtils.afterReflow(callback)` |
| 22 | [renderer.js](../../src/js/modules/ui/renderer.js#L237) | 0 | レイアウト修復時の 10ms 予算 / `isInputPending` 主スレッド譲渡 | `Scheduler.yieldToMainThread()` |

### 2.2 対象ファイル一覧
- [NEW] [scheduler.js](../../src/js/frameworks/scheduler.js) — タイムスライス・スレッド譲渡・Idle 管理基盤
- [NEW] [timing.js](../../src/js/frameworks/timing.js) — デバウンス・無操作タイマー・沈静化バッファ管理基盤
- [NEW] [animation.js](../../src/js/frameworks/animation.js) — イベント駆動型アニメーション/トランジション同期基盤
- [NEW] [dom-utils.js](../../src/js/frameworks/dom-utils.js) — DOM 再描画・フレーム同期基盤
- [MODIFY] [publisher.js](../../src/js/frameworks/publisher.js) — 非同期マクロタスクイベント配信 (`publishAsync`) 追加
- [MODIFY] [config.js](../../src/js/modules/core/config.js) — `Scheduler.requestIdle` へ統一
- [MODIFY] [commands.js](../../src/js/modules/core/commands.js) — `DOMUtils.afterReflow` および `Scheduler.delay` へ統一
- [MODIFY] [yuzora.js](../../src/js/modules/core/yuzora.js) — `Publisher.publishAsync` へ統一
- [MODIFY] [diagnostics.js](../../src/js/modules/core/diagnostics.js) — `Scheduler.yieldToMainThread` へ統一
- [MODIFY] [viewer.js](../../src/js/modules/ui/viewer.js) — `DOMUtils.afterRender` および `Timing.createSettlementBuffer` へ統一
- [MODIFY] [ui.js](../../src/js/modules/ui/ui.js) — `Timing` および `AnimationUtils` へ統一
- [MODIFY] [parser.js](../../src/js/modules/parser/parser.js) — `Scheduler.yieldToMainThread` へ統一
- [MODIFY] [renderer.js](../../src/js/modules/ui/renderer.js) — `Scheduler.yieldToMainThread` および `AnimationUtils` へ統一
- [MODIFY] [externs.js](../../src/externs.js) — 新規基盤モジュールの Closure Compiler 難読化保護宣言
- [NEW] [scheduler.test.js](../../tests/unit/frameworks/scheduler.test.js) — `Scheduler` 単体テスト
- [NEW] [timing.test.js](../../tests/unit/frameworks/timing.test.js) — `Timing` 単体テスト
- [NEW] [animation.test.js](../../tests/unit/frameworks/animation.test.js) — `AnimationUtils` 単体テスト
- [NEW] [dom-utils.test.js](../../tests/unit/frameworks/dom-utils.test.js) — `DOMUtils` 単体テスト

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 5 大共通基盤モジュールの仕様定義

#### 1. `Scheduler` (タイムスライス・スレッド譲渡基盤)
```javascript
class Scheduler {
    /**
     * 主スレッドへ制御を一時譲渡（10msフレーム予算または isInputPending 検出時）
     * @param {number=} budgetMs デフォルト 10ms
     * @param {number=} lastYieldTime
     * @return {!Promise<number>} 更新後の lastYieldTime
     */
    static async yieldToMainThread(budgetMs = 10, lastYieldTime = 0) { ... }

    /**
     * アイドル時間の非同期実行フォールバック
     * @param {function(): void} callback
     */
    static requestIdle(callback) { ... }
}
```

#### 2. `DOMUtils` (DOM 幾何・描画確定同期基盤)
```javascript
class DOMUtils {
    /**
     * リフロー・スタイル変更後の次フレーム描画確定を待機
     * @param {function(): void} callback
     */
    static afterReflow(callback) { ... }
}
```

#### 3. `AnimationUtils` (イベント駆動型アニメーション完了同期基盤)
```javascript
class AnimationUtils {
    /**
     * CSS トランジション完了を待機 (transitionend イベント ＋ 安全タイムアウト保険)
     * @param {!Element} element
     * @param {number} fallbackMs
     * @return {!Promise<void>}
     */
    static waitForTransition(element, fallbackMs) { ... }
}
```

#### 4. `Timing` (デバウンス・無操作タイマー基盤)
```javascript
class Timing {
    /**
     * 関数の実行間引き (Debounce)
     * @param {function(...*): void} fn
     * @param {number} waitMs
     * @return {function(...*): void}
     */
    static debounce(fn, waitMs) { ... }

    /**
     * 無操作時の自動タイマー (Auto-Hide Controller)
     * @param {function(): void} onInactivity
     * @param {number} timeoutMs
     * @return {{ trigger: function(): void, cancel: function(): void }}
     */
    static createInactivityTimer(onInactivity, timeoutMs) { ... }
}
```

#### 5. `Publisher.prototype.publishAsync` (非同期マクロタスクイベント配信)
```javascript
Publisher.prototype.publishAsync = function(eventType, detail) {
    setTimeout(() => {
        this.publish(eventType, detail);
    }, 0);
};
```

---

## 4. システムアーキテクト（SA）チームによる 3-Pass レビュー結果 / Multi-SA Review Results

### 🔹 Pass 1: リードアーキテクト & コアインフラ SA レビュー
- **レイヤー境界の厳格化**: 新設する基盤モジュール (`scheduler.js`, `timing.js`, `animation.js`, `dom-utils.js`) はすべて `src/js/frameworks/` ディレクトリに配置し、上位の `modules/` 層への逆依存を禁止。
- **Locator 登録の決定**: `Locator` にシングルトンおよび静的ユーティリティとして登録し、直接グローバル参照せず DI 解決可能とする。

### 🔹 Pass 2: Web パフォーマンス & マイクロオプティマイゼーション SA レビュー
- **GC アロケーションゼロ設計**: `Timing.debounce` や `Scheduler.yieldToMainThread` 等の高頻度呼び出しにおいて、アロケーション（不要な一括クロージャ生成）を最小化し、内部タイマー ID 参照を再利用。
- **将来互換性 (`scheduler.yield`)**: Chrome/Edge 等の現代ブラウザに実装されつつある `window.scheduler.yield()` を検出した場合は最優先で採用し、非サポート環境では `setTimeout(resolve, 0)` へ安全にフォールバックする段階的詳細化（Progressive Enhancement）を採択。

### 🔹 Pass 3: 品質保証 & 防御的セキュリティ SA レビュー
- **Clean-up Guard (イベントリーク防止)**: `AnimationUtils.waitForTransition` では、`transitionend` イベントがCSSプロパティ未変更等で不発となった場合でもメモリーリークしないよう、タイムアウト保険側でイベントリスナーを確実に removeEventListener する防壁を強制。
- **Closure Compiler 難読化保護 (`src/externs.js`)**: 新設される全メソッド (`yieldToMainThread`, `afterReflow`, `waitForTransition`, `debounce`, `publishAsync`) を `src/externs.js` に明記し、`make` ビルド時のプロパティ名抹消事故を完全に防止。

---

## 5. 受入基準 (DoD) / Acceptance Criteria

- [x] 全 22 箇所の `setTimeout` が `Scheduler`, `DOMUtils`, `AnimationUtils`, `Timing`, `Publisher.publishAsync` へ 100% 移植・置換されること。
- [x] 直書きの生 `setTimeout` 呼び出しが `src/js/modules/` 配下から完全に追放されること（`grep_search` 検証）。
- [x] 新設された 4 つの基盤モジュールの単体テスト (`scheduler.test.js`, `timing.test.js`, `animation.test.js`, `dom-utils.test.js`) がすべて PASS すること。
- [x] 既存の全単体テスト (`npm run test:unit`) 106 件が全件 PASS すること。
- [x] 要件・設計トレーサビリティ検証 (`npm run test:traceability`) が全件 PASS すること。
- [x] Closure Compiler ADVANCED_OPTIMIZATIONS ビルド (`make`) がエラーなしで完了すること。
- [x] TypeScript 型チェック (`npm run test:types`) および ESLint (`npm run lint`) が全件通過すること。
