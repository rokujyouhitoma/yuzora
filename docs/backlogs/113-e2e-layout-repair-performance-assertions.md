---
ID: 113
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [Enhancement] Playwright E2Eテストにおけるレイアウト修復時間・アサーションの追加 (ID: 113)

## 1. 概要 / Summary
Playwright E2Eテストスイートにおいて、書籍表示およびページめくり時のレイアウト修復時間（`__isReflowing__` フラグや 10ms タイムスライスフレーム予算）をアサーション対象として組み込み、パフォーマンス劣化やUIフリーズの回帰を自動検知します。

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — E2Eテストにおけるレイアウト修復アサーションの追加
- [x] [README.md](README.md) — バックログ台帳の更新

## 3. 要件と技術詳細 / Requirements and Technical Details
- E2Eテスト実行時、`window.__isReflowing__` ガードアサーションに加え、レイアウト修復が完了していることを確認する明示的アサーションを追加する。

## 4. 完了条件 (DoD) / Acceptance Criteria
- [x] E2Eテストスイートがパフォーマンス・レイアウト修復ガードを含めて正常終了すること。
