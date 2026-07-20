---
ID: 092
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACT] しおり（進捗）書き込み処理の非同期アイドル実行化 (ID: 092)

## 1. 概要 / Summary
スクロール完了やページめくりの都度発生する、しおり（Progress割合）の `localStorage.setItem`（同期的でブロッキングなファイル I/O 処理）によるフレームドロップ（カクつき）を防止するため、`BookmarkModel` での保存処理を `requestIdleCallback` 等を用いてアイドルタイムに非同期実行・デバウンス化する。

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01-user_requirements.md](../requirements/REQ-01-user_requirements.md)
- 関連要件 (SRD): [REQ-03-system_requirements.md](../requirements/REQ-03-system_requirements.md)
- 関連バックログ: [009-async-bookmark-storage.md](../../backlogs/closed/009-async-bookmark-storage.md)

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [config.js](../../../src/js/modules/core/config.js)

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/092-async-bookmark-storage`

1. `BookmarkModel` の `save` メソッド内に `this.idleId_` 追跡プロパティを用いて、先行する未実行アイドルタスクの `cancelIdleCallback`（または `clearTimeout`）によるデバウンス処理を実装する。
2. 保存要求があった場合は `requestIdleCallback` または `setTimeout` に処理を逃がし、ブラウザが空いている時間に `bookmarkRepo.save` をバックグラウンド実行する。
3. 難読化ビルドや型チェックで警告が出ないよう、ブラケット記法 `window['requestIdleCallback']` などを用いて安全にAPIにアクセスする。

## 5. 完了条件 / Success Criteria (DoD)
- [x] しおり保存が非同期でデバウンスされてアイドル実行され、ページのスクロールが60FPSで滑らかに動作すること。
- [x] すべてのユニットテスト、型チェック、ビルド、およびE2Eテストが退行バグなく正常に動作すること。
