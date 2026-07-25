---
ID: 113
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] Playwright E2Eテストにおけるレイアウト修復時間・アサーションの追加 (ID: 113)

## 1. 概要 / Summary
Playwright E2Eテストスイートにおいて、書籍表示およびページめくり時のレイアウト修復時間（`__isReflowing__` フラグや 10ms タイムスライスフレーム予算）をアサーション対象として組み込み、パフォーマンス劣化やUIフリーズの回帰を自動検知します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — E2Eテストにおけるレイアウト修復アサーションの追加
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. **フレーム予算内動作の確実な評価**:
   大容量コンテンツ（`宮本武蔵 02 地の巻` 等）のページ繰り時、メインスレッドを長時間ブロックせず、10msタイムスライス内にレイアウト計算が正しく収束することをE2Eレベルで検証します。
2. **`window.__isReflowing__` フラグの自動アサーション**:
   描画および段落分割処理の完了タイミングを Playwright の `waitForFunction(() => !window.__isReflowing__)` 経由で監視し、不安定な固定時間 `sleep` に頼らない安定したテスト判定を実現します。

---

## 4. 要件と技術詳細 / Technical Requirements
- E2Eテスト実行時、`window.__isReflowing__` ガードアサーションに加え、レイアウト修復が完了していることを確認する明示的アサーションを追加する。

---

## 5. 完了条件 (DoD) / Acceptance Criteria
- [x] E2Eテストスイートがパフォーマンス・レイアウト修復ガードを含めて正常終了すること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に同期していること。
