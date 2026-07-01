---
ID: 030
種別: Refactor
優先度: Medium
ステータス: Open (New)
---

# [FEAT/ENH] Publish/Subscribe パターンによるイベント通知モデルの実装 (ID: 030)

## 1. 概要 / Summary
アプリケーション内の状態更新やデータ同期イベント（しおり設定、読書履歴の保存、表示テーマ変更等）を非同期および疎結合に購読・配信するため、Publish/Subscribe (Pub/Sub) パターンを導入します。
本実装は既存 of `src/js/modules/event.js` (YuzoraEventTarget / YuzoraEvent) を基底として使用します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): N/A (内部設計のリファクタリング)
- 関連要件 (SRD): N/A (内部構造の共通化・疎結合化)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [event.js](file:///workspace/yuzora/yuzora/src/js/modules/event.js)
- [ ] [ui.js](file:///workspace/yuzora/yuzora/src/js/modules/ui.js)
- [ ] [viewer.js](file:///workspace/yuzora/yuzora/src/js/modules/viewer.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/030-implement-pubsub`

1. `src/js/modules/event.js` の基底イベント機構の上に、`subscribe` / `unsubscribe` / `publish` のAPI仕様を構築する。
2. ユニットテストおよびE2Eテストにて動作を確認する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `subscribe` / `unsubscribe` / `publish` の基本的な購読配信フローを検証するユニットテストがパスすること。
- [ ] 購読解除したリスナーに対して追加の通知が送信されないこと。
- [ ] 既存の全テスト・機能が壊れずに維持されていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
