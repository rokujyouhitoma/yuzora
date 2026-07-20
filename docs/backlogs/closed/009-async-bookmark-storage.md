---
ID: 009
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACT] しおり（進捗）書き込み処理の非同期アイドル実行化 (ID: 009)

## 1. 概要 / Summary
スクロール完了やページめくりの都度発生する、しおり（Progress割合）の `localStorage.setItem`（同期的でブロッキングなファイル I/O 処理）によるフレームドロップ（カクつき）を防止します。
しおり位置決定のトリガー後に、処理を `requestIdleCallback` または `requestAnimationFrame`（ブラウザのアイドルタイム）へ逃がすことで非同期に書き込みを実行し、ページスクロールのスムーズさ（60FPS維持）を保護します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [config.js](../../src/js/modules/core/config.js) (BookmarkModel での非同期遅延・デバウンス処理の統合)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 requestIdleCallbackによる遅延実行
- しおり保存時に、すでに予約されているアイドルタスクID（`this.idleId_`）が存在する場合は `cancelIdleCallback` もしくは `clearTimeout` を行い、前回の書き込み要求をキャンセル（デバウンス）する。
- 新たに `requestIdleCallback`（Safari等の未対応環境では `setTimeout(..., 0)`）を実行して、ブラウザのアイドル時間に `localStorage` 保存処理（`bookmarkRepo.save`）を逃がして実行する。
- スクロール中に高頻度で呼ばれるしおり保存が最後の1回にマージされ、メインスレッドへの負荷が大幅に軽減される。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] しおりの保存処理が `requestIdleCallback` または `setTimeout` によって非同期に遅延実行され、UI描画へのブロッキングが発生しないこと。
- [x] 短期間の連続保存要求（スクロール）がマージ（デバウンス）され、不要な複数回書き込みが抑止されること。
- [x] アプリの再起動時にしおり位置が正常に復元されること。
