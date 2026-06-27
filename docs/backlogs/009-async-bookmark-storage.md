---
ID: 009
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACT] しおり（進捗）書き込み処理の非同期アイドル実行化 (ID: 009)

## 1. 概要 / Summary
スクロール完了やページめくりの都度発生する、しおり（Progress割合）の `localStorage.setItem`（同期的でブロッキングなファイル I/O 処理）によるフレームドロップ（カクつき）を防止します。
しおり位置決定のトリガー後に、処理を `requestIdleCallback` または `requestAnimationFrame`（ブラウザのアイドルタイム）へ逃がすことで非同期に書き込みを実行し、ページスクロールのスムーズさ（60FPS維持）を保護します。
