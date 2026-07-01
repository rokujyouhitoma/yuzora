---
ID: 023
種別: Refactor
優先度: Medium
ステータス: In Progress
---

# [REFACTOR] Publish/Subscribe パターンによるイベント通知モデルの実装 (ID: 023)

## 1. 概要 / Summary
アプリケーション内の状態更新やデータ同期イベント（しおり設定、読書履歴の保存、表示テーマ変更等）を非同期および疎結合に購読・配信するため、Publish/Subscribe (Pub/Sub) パターンを導入します。

これにより、イベント発行者（Publisher）とイベント購読者（Subscriber）を完全に分離し、システムの拡張性や複数コンポーネントに対する同一イベントのマルチキャスト通知を容易にします。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/lib/publisher.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [publisher.js](../../src/js/modules/publisher.js) (Publisher基盤の新規追加)
- [ui.js](../../src/js/modules/ui.js) (Subscriber登録および通知受け取り側の書き換え)
- [viewer.js](../../src/js/modules/viewer.js) (Publisher経由での通知発行側への書き換え)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **Pub/Sub メカニズムの実装**:
   - `Publisher` クラスを定義し、特定のトピック/イベント名に対して複数の購読者（リスナー関数）を紐付けるマップを管理します。
   - `subscribe(topic, callback)`: トピックに対する購読を開始します。
   - `unsubscribe(topic, callback)`: 購読を解除します。
   - `publish(topic, data)`: トピックに紐づくすべての購読者にデータを配信します。
2. **疎結合なマルチキャスト配信**:
   - 設定変更（theme, direction 等）が起きた際、変更を検知したモジュールが `publish('config-change', newConfig)` を呼び出します。
   - これを購読しているUI（フォント変更、テーマ切り替え、ドロワー内インジケータ等）が個別に独立して自律更新するよう設計します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `subscribe` / `unsubscribe` / `publish` の基本的な購読配信フローを検証するユニットテストがパスすること。
- [ ] 購読解除したリスナーに対して追加の通知が送信されないこと。
- [ ] 複数モジュール（設定画面、ビューアー表示、E2Eテストユーティリティ等）が独立して同一イベントを正常に購読・適用できること。
- [ ] 既存の全テスト・機能が壊れずに維持されていること。
