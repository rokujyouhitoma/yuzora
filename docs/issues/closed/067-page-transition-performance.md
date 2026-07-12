---
ID: 067
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] ページ移動パフォーマンスの改善とトレーシングログの導入 (ID: 067)

## 1. 概要 / Summary
ページを切り替える（またはスクロールする）際の動作が著しく遅くなる、あるいはカクつき（遅延）が発生する問題を解決するため、レイアウト情報のキャッシュと requestAnimationFrame スロットリングによる Layout Thrashing 回避、多重スナップの防止、および `window.__DEBUG_PERFORMANCE__` フラグに連動するトレーシングログシステムを導入します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (スムーズな操作性、クライアントサイド実行)
- 関連要件 (SRD): REQ-03-SRD-05 (パフォーマンス制御、スクロールスナップ)
- 関連バックログ: [056-page-transition-performance.md](../backlogs/056-page-transition-performance.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/types.d.ts](../../src/js/types.d.ts) [MODIFY] — `ViewContextInterface` へレイアウトキャッシュ、タイマー、スナップ計測状態を追加
- [x] [src/js/modules/config.js](../../src/js/modules/config.js) [MODIFY] — `ViewContext` への初期化追加
- [x] [src/externs.js](../../src/externs.js) [MODIFY] — Closure Compiler 向けに新規追加プロパティの extern マッピング記述追加
- [x] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) [MODIFY] — 見切れ診断・修復処理の CPU 時間計測追加、およびキャッシュの無効化処理の追加
- [x] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) [MODIFY] — `updateProgress` でのレイアウトキャッシュ参照と `requestAnimationFrame` スロットリング、および `restoreScrollPosition`/`nextPage`/`prevPage`/`scrollToPage` でのキャッシュ利用と時間計測
- [x] [src/js/modules/ui.js](../../src/js/modules/ui.js) [MODIFY] — スクロールイベント中の eventGuard とスナップ状態 (`isSnapping`) 排他、スクロール静止検出時の進捗しおり同期とレイアウト検証発火、およびスクロールイベント統計ログ出力
- [x] [index.html](../../index.html) [MODIFY] — parserモジュール分割で不足していた script タグの追加
- [x] [docs/DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) [MODIFY] — キャッシュ機構、rAF、多重スナップ防止、トレーシングログ仕様の追記

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/067-page-transition-performance`

1. `ViewContext` に `cachedScrollWidth`, `cachedClientWidth`, `progressAnimationFrameId`, `isSnapping`, `scrollStartTimestamp`, `scrollEventCount` を追加定義し、Closure Compiler 向け extern 定義を行う。
2. `renderer.js` および `viewer.js` で、レイアウト計算時の DOM 読み取り回数をキャッシュにより最小化し、DOM 書き込み処理を `requestAnimationFrame` (rAF) で遅延・スロットリング化する。
3. `ui.js` の `onViewportScroll` が多重スナップ（磁気スクロールアニメーション中）やリフロー処理中に二重に処理をトリガーしないようガードする。
4. スクロール停止（静止から 150ms 後）をスナップ完了または手動スクロール完了として検知し、しおり保存や `PAGE_CHANGED` イベントを発火して自己修復判定を行う。
5. `window.__DEBUG_PERFORMANCE__` が `true` の場合、ミリ秒精度の実行時間やスクロール中の秒間イベント頻度などのパフォーマンスメトリクスをコンソールに可視化する。
6. 不足していた parser 関連ファイルの script タグを `index.html` に追加し、開発環境での動作停止（ReferenceError）を恒久対策する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `window['__DEBUG_PERFORMANCE__'] = true` のとき、コンソールに各重要処理の処理時間と詳細データがトレースログとして出力されること。
- [x] スクロール時およびスナップ時に、レイアウトスラッシングや重複スナップの衝突が発生していないこと。
- [x] ユニットテストおよび E2E テストがすべて正常にパスすること。
- [x] 変更内容が設計書（`docs/DSN-02-low_level_design.md`）に反映され、実装とのトレーサビリティが確保されていること。
- [x] `make` による Closure Compiler ビルドがエラーなしで完了すること。
