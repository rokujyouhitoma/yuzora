---
ID: 021
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] Eventクラスの実装とイベントディスパッチャーによるモジュール疎結合化 (ID: 021)

## 1. 概要 / Summary
アプリケーション内の各種モジュール間（parser, viewer, ui 等）の密結合を解消し、イベント駆動（イベントドリブン）アーキテクチャを実現するため、汎用的な `Event` 登録・発火機構を導入します。

これらにより、状態変更やUI更新イベント（書籍ロード完了、ページめくり、テーマ変更等）をイベント通知として処理し、各モジュールが互いの内部関数を直接呼び出す依存関係を排除して、独立性と保守性を向上させます。

イベント登録・伝播インターフェースの設計においては、W3C の **DOM Level 2 Events** 仕様（`addEventListener`, `removeEventListener`, `dispatchEvent`）を参考に実装します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/event.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [event.js](../../src/js/modules/event.js) (EventおよびEventTargetクラスの新規追加)
- [ui.js](../../src/js/modules/ui.js) (イベント監視側への書き換え)
- [viewer.js](../../src/js/modules/viewer.js) (イベント発火・監視側への書き換え)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **DOM Level 2 Events 互換インターフェースの実装**:
   - `Event` クラス: イベントオブジェクトを表し、`type` (イベントの種類) および `detail` (任意のカスタムペイロードデータ) をプロパティとして保持します。
   - `EventTarget` クラス: 各モジュールが継承（または内部オブジェクトとして保持）可能なベースクラスです。以下のメソッドを提供します：
     - `addEventListener(type, listener)`: イベントに対するコールバック（リスナー）を登録します。
     - `removeEventListener(type, listener)`: 登録済みのコールバックを解除します。
     - `dispatchEvent(event)`: `Event` インスタンスを発火させ、登録されているリスナーに順次通知します。
2. **モジュール間の非同期通信**:
   - グローバルなオブザーブ用 `EventTarget` または各主要クラス（`Viewer`, `UI`）が `EventTarget` を継承することで、他モジュールからイベントベースでの通知を可能にします。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `EventTarget` に登録したリスナーが `dispatchEvent` 呼び出しにより意図通り呼び出されること、また解除したリスナーが呼び出されないことを検証するユニットテストがパスすること。
- [ ] ペイロード（`detail`）の引き渡しが正しく機能し、型安全にデータが連携されること。
- [ ] すべてのE2Eテストがパスし、既存の同期的なモジュール間直接呼び出しの一部がこのイベント機構に安全に置き換えられること。
