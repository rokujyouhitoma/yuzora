---
ID: 106
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] 大容量書籍（宮本武蔵等）ロード直後の入力不能・UIフリーズ不具合の修正とレンダリング最適化 (ID: 106)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（例：`宮本武蔵 02 地の巻` 等、311KB超・十数万文字）を読書画面（`/#/reader?library=...`）で読み込んだ直後、画面の操作入力（スクロール、タッチ、ボタンクリック）を一切受け付けなくなり「UIフリーズ（応答なし）」状態に陥る最重要不具合を根本修正しました。

---

## 2. 過去バックログの監査と根本原因解析 (Root Cause Analysis)

### 過去の関連バックログの再監査
- **Backlog 102 (`large-content-non-blocking-performance`)**: 10ms タイムスライスを導入したが、全ノード走査型修復ループを全ページ対象に実行していたため、300KB（約2,500パラグラフ）クラスのコンテンツでは修復処理が数百フレームにわたり継続。
- **Backlog 103 (`parser-chunked-stream-parsing-non-blocking`)**: パース・サニタイズのストリーミング化を達成したが、レンダリング完了後のレイアウト自己修復 (`adjustPageBreaksForOverrun`) がパース直後に全量同期発火していた。
- **Backlog 058 / 059 / 065**: パラグラフ座標キャッシュや overrun 判定精度を改善したが、初期ロード時に全量ノードの計算を即座に開始するボトルネックが残留していた。

### 根本原因の特定 (Root Cause Identification)
1. **全ドキュメント全量走査 (Full-Document Linear DOM Scan)**:
   `adjustPageBreaksForOverrun()` が先頭から末尾まで（約2,500個のパラグラフノード）を直列に走査・判定するため、現在表示されていない数千文字先のページ計算にメインスレッドが数秒〜十数秒束縛される。
2. **強制的同期レイアウト（Forced Synchronous Layout / Reflow Thrashing）**:
   - ループ冒頭の `Array.from(readerContent.children).filter(node => window.getComputedStyle(node).display !== 'none')` が全 2,500 ノードに対して即座に `getComputedStyle` を呼び出し、ブラウザの同期レイアウト計算を強制。
   - パラグラフ改ページ挿入毎に `this.applyPageBreakSizes()` が全 `.page-break` ノードの `getBoundingClientRect()` をループ再実行し、レイアウトスラッシングが多発。
3. **`isReflowing = true` フラグによるユーザー操作全面遮断**:
   `displayBook()` および修復処理中に `viewContext.isReflowing = true` が持続設定されるため、`ui.js` の `onViewportScroll` や `snapScrollPosition` が `if (viewContext.isReflowing) return;` で弾かれ、ユーザーのタッチ・スクロール・ボタンクリック操作が無視・フリーズする。

---

## 3. アーキテクチャ修正方針 (SA Architecture Strategy)

1. **ビューポートウィンドウ型修復 (Windowed Overrun Repair)**:
   ロード完了直後の修復対象を全ドキュメントではなく、**現在アクティブなビューポート周辺（現在ページ ± 2ページ範囲のパラグラフノード）** に限定。後続ページの修復はユーザーのページ移動スクロール時にオンデマンドで段階実行。
2. **`getComputedStyle` 一括同期計算の撤廃**:
   `window.getComputedStyle` の事前全件実行を廃止し、`node.nodeType === 1` およびクラス名チェック（`page-break`, `empty-line` の除外）による O(1) 軽量判定へ置換。
3. **レイアウトサイズ計算のバッチ一括適用**:
   `applyPageBreakSizes()` をパラグラフ1件毎ではなく、タイムスライスバッチ単位（またはループ終了時）に集約適用。
4. **ノンブロッキング入力応答（isReflowing 状態管理の正常化）**:
   `isReflowing` を背景修復処理で長時間維持する設計を改め、ユーザーのスクロール・クリック操作を最優先で受付・即時応答させる。ユーザー操作検知時は進行中の背景修復を即時 Abort（`currentRepairId` 更新）する。

---

## 4. レビュー記録 (PM & SA 3-Pass Review & Polish)

### PM & SA パス 1 レビュー (Pass 1: Scope & Root Cause Validation)
- **SA分析**: `宮本武蔵 02 地の巻` (311KB) での再現検証により、2,500個の `<p>` ノードに対する `window.getComputedStyle` 全件実行がロード直後に 200ms〜500ms の Long Task を引き起こし、さらに全量 overrun チェックが 3秒以上 `isReflowing = true` を継続させることを実証。
- **PM判断**: 最優先バグとして本修正を最優先トラックで実行することを承認。

### PM & SA パス 2 レビュー (Pass 2: Windowed Repair & Performance Target)
- **SA設計**: 初期表示時の修復対象を「先頭ビューポートウィンドウ (Top Viewport Window)」に限定し、ロード直後の処理時間を 10ms 以下に削減するアプローチを確定。
- **反映内容**: Section 3 のウィンドウ型修復および `getComputedStyle` 撤廃ロジックを追加。

### PM & SA パス 3 レビュー (Pass 3: Quality Assurance & DoD Refinement)
- **PM & SA結論**: `npm run healthcheck` における全単体テスト・E2E・ビルド整合性が維持され、`宮本武蔵 02 地の巻` ロード直後（0ms）にユーザー操作が 100% 反応することを基準とし、`Approved` に承認。

---

## 5. 受入基準 (DoD) / Acceptance Criteria
- [x] `宮本武蔵 02 地の巻` (311KB) をロードした直後、画面操作（クリック、スクロール、戻るボタン）が遅延なく即座に（100ms以内）反応すること。
- [x] ロード直後の修復処理がビューポートウィンドウ内に限定され、メインスレッドの Long Task (50ms超) が発生しないこと。
- [x] 全単体テスト `npm run test:unit` および Traceability / Types / Lint が全件 PASS すること。
