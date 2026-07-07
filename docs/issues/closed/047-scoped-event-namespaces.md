---
ID: 047
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] イベント駆動（EDA）の名前空間化とスコープ分離 (ID: 047)

## 1. 概要 / Summary
現在、システム全体のイベント（UI状態、システムライフサイクル、ルーティング、履歴管理など）は、単一のグローバルな `YuzoraEventTarget`（イベントバス）を介してブロードキャストされています。アプリケーションが複雑化するにつれて、「どのイベントがどこで発火し、どのリスナーをトリガーしたか」の追跡（デバッガビリティ）が困難になり、意図しない循環参照や多重イベント発火が発生しやすくなります。

これを防ぎ、疎結合でメンテナンスしやすいイベントバスを実現するため、以下の整理および機能拡張を行います。
- **名前空間プレフィックスの導入**: 各イベントタイプ（`YuzoraEventType`）に対して、`system:`、`document:`、`ui:` のようなドメインプレフィックスを導入し、論理的な分類を明確化します。
- **論理スコープチャネルの導入**: `AppEventTarget` に特定のプレフィックスのみに限定してイベントを処理する `ScopedEventTarget`（スコープラッパー）を導入し、モジュールごとの関心事の分離（イベント隔離）をサポートします。
- **イベント監査ツール (Event Audit Logger) の組み込み**: デバッグ用に、イベントが発火された際の発火元（dispatcher）、受信者数、ペイロード等をコンソールまたはデバッグログへ透過的に追跡・出力するデバッグ支援機構を構築します。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01 (機能要件)
* 関連要件 (SRD): SRD-05 (イベント駆動設計)
* 関連バックログ: [038-scoped-event-namespaces.md](../backlogs/closed/038-scoped-event-namespaces.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [event.js](src/js/frameworks/event.js) (MODIFY)
* [ ] [event.js](src/js/modules/event.js) (MODIFY)
* [ ] [publisher.js](src/js/frameworks/publisher.js) (MODIFY)
* [ ] [types.d.ts](src/js/types.d.ts) (MODIFY)
* [ ] [externs.js](src/externs.js) (MODIFY)
* [ ] [event.test.js](tests/unit/event.test.js) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/047-scoped-event-namespaces`

### 4.1. 名前空間の変更内容
* `YuzoraEventType` の文字列値にプレフィックスを設定：
  - 書籍関連: `document:load-start`, `document:loaded`, `document:rendered`, `document:load-failed`
  - ページ/UI操作関連: `ui:navigate-page`, `ui:page-changed`, `ui:config-changed`, `ui:toc-generated`, `ui:toc-active-changed`, `ui:toggle-debug-modal`, `ui:toggle-controls`, `ui:toggle-drawer`
  - システム/デバッグ関連: `system:history-updated`, `system:diagnose-run`, `system:diagnose-completed`

### 4.2. ScopedEventTarget の実装
* `AppEventTarget.prototype.scoped(scopePrefix)` メソッドを追加し、プレフィックスを自動補完・フィルタリングするプロキシオブジェクト `ScopedEventTarget` を生成可能にします。
* `ScopedEventTarget` は、親 `AppEventTarget` へのデリゲーションを通じて、指定したスコーププレフィックス付きのイベントのみを登録・送受信できるようにラップします。

### 4.3. イベント監査 (Audit Logging)
* `AppEventTarget.prototype.dispatchEvent(event)` の開始時に、イベントの監視ログを出力します。
* `window['__DEBUG_EVENT__']` が有効化されている場合のみ、デバッグコンソールへのトレース（イベントタイプ、詳細、リスナー数）を出力し、通常動作時のオーバーヘッドを抑制します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] すべての `YuzoraEventType` 定数がプレフィックス付き名前空間へと安全に移行されていること。
- [ ] `ScopedEventTarget` によるイベントの隔離と、親イベントバスとの安全な双方向伝播が正しく動作すること。
- [ ] デバッグモードを有効にした際、イベントの発火監査ログが適切に記録・出力されること。
- [ ] 静的型チェック (`tsc`) およびユニットテスト (`tests/unit/event.test.js` 含む) がすべて成功すること。
- [ ] すべてのE2Eテストがエラーなく動作し、イベント起因の描画不具合がないこと。

