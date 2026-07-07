---
ID: 038
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] イベント駆動（EDA）の名前空間化とスコープ分離 (ID: 038)

## 1. 概要 / Summary
現在、システム全体のイベント（UI状態、システムライフサイクル、ルーティング、履歴管理など）は、単一のグローバルな `YuzoraEventTarget`（イベントバス）を介してブロードキャストされています。アプリケーションが複雑化するにつれて、「どのイベントがどこで発火し、どのリスナーをトリガーしたか」の追跡（デバッガビリティ）が困難になり、意図しない循環参照や多重イベント発火が発生しやすくなります。

これを防ぎ、疎結合でメンテナンスしやすいイベントバスを実現するため、以下の整理および機能拡張を行います。
- **名前空間プレフィックスの導入**: 各イベントタイプ（`YuzoraEventType`）に対して、`system:`、`document:`、`ui:` のようなドメインプレフィックスを導入し、論理的な分類を明確化します。
- **論理スコープチャネルの導入**: `AppEventTarget` に特定のプレフィックスのみに限定してイベントを処理する `ScopedEventTarget`（スコープラッパー）を導入し、モジュールごとの関心事の分離（イベント隔離）をサポートします。
- **イベント監査ツール (Event Audit Logger) の組み込み**: デバッグ用に、イベントが発火された際の発火元（dispatcher）、受信者数、ペイロード等をコンソールまたはデバッグログへ透過的に追跡・出力するデバッグ支援機構を構築します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[event.js](src/js/frameworks/event.js)** (MODIFY): `AppEventTarget` にスコープ分割機能およびロギング機構を追加。
- **[event.js](src/js/modules/event.js)** (MODIFY): `YuzoraEventType` の文字列定数を名前空間付きプレフィックスに変更。
- **[publisher.js](src/js/frameworks/publisher.js)** (MODIFY): スコープ付きチャネル経由での Pub/Sub に適合するよう必要に応じて調整。
- **[event.test.js](tests/unit/event.test.js)** (MODIFY): 新規追加するスコープターゲットの挙動および監査ロギングを検証するテストコードの追加。

---

## 3. 要件と技術的詳細 / Technical Details
### 3.1. 名前空間の変更内容
* `YuzoraEventType` の各値にプレフィックスを設定：
  - 書籍関連: `document:load-start`, `document:loaded`, `document:rendered`, `document:load-failed`
  - ページ/UI操作関連: `ui:navigate-page`, `ui:page-changed`, `ui:config-changed`, `ui:toc-generated`, `ui:toc-active-changed`, `ui:toggle-debug-modal`, `ui:toggle-controls`, `ui:toggle-drawer`
  - システム/デバッグ関連: `system:history-updated`, `system:diagnose-run`, `system:diagnose-completed`

### 3.2. ScopedEventTarget の設計
* `AppEventTarget.prototype.scoped(scopePrefix)` メソッドを追加し、プレフィックスを自動補完・フィルタリングするプロキシオブジェクトを生成可能にします。
* 各モジュール（`Viewer`, `UI`, `Router` 等）は、このスコープ付きターゲットを使用することで、自ドメイン外の不要なイベント発火や誤受信を防止できます。

### 3.3. イベント監査 (Audit Logging)
* `dispatchEvent(event)` の開始時に、イベントの監視ログを出力します。
* ログ内容：イベントタイプ、ペイロード (`detail`)、購読しているリスナー数。
* デバッグモード（例: `window.__DEBUG_EVENT__` 等）でログの有効/無効を切り替えられるようにし、本番環境でのコンソール出力を抑制します。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] すべての `YuzoraEventType` 定数がプレフィックス付き名前空間へと安全に移行されていること。
- [ ] `ScopedEventTarget` によるイベントの隔離と、親イベントバスとの安全な双方向伝播が正しく動作すること。
- [ ] デバッグモードを有効にした際、イベントの発火監査ログが適切に記録・出力されること。
- [ ] 静的型チェック (`tsc`) およびユニットテスト (`tests/unit/event.test.js` 含む) がすべて成功すること。
- [ ] すべてのE2Eテストがエラーなく動作し、イベント起因の描画不具合がないこと。

