---
ID: 026
種別: Feature
優先度: Medium
ステータス: Closed (Resolved)
---

# [FEAT/ENH] Eventクラスの実装とイベントディスパッチャーによるモジュール疎結合化 (ID: 026)

## 1. 概要 / Summary
アプリケーション内の各種モジュール間（commands, viewer, ui 等）の密結合を解消し、イベント駆動（イベントドリブン）アーキテクチャを実現するため、汎用的な `Event` 登録・発火機構を導入します。

これらにより、状態変更やUI更新イベント（書籍ロード完了、ページめくり、テーマ変更等）をイベント通知として処理し、各モジュールが互いの内部関数を直接呼び出す依存関係を排除して、独立性と保守性を向上させます。

イベント登録・伝播インターフェースの設計においては、W3C の DOM Level 2 Events 仕様（`addEventListener`, `removeEventListener`, `dispatchEvent`）を参考に実装します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [021-implement-event-emitter.md](../backlogs/021-implement-event-emitter.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [event.js](../../src/js/modules/event.js) (EventおよびEventTargetクラスの新規追加)
- [commands.js](../../src/js/modules/commands.js) (イベント発火側への書き換え)
- [viewer.js](../../src/js/modules/viewer.js) (イベント監視・発火側への書き換え)
- [ui.js](../../src/js/modules/ui.js) (イベント監視側への書き換え)
- [Makefile](../../Makefile) (event.js をコンパイル対象に追加)
- [tools/externs.js](../../tools/externs.js) (Eventクラス・EventTargetクラスのリネーム抑制を追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/026-implement-event-emitter`

1. **`event.js` の新規作成**:
   - `YuzoraEvent` クラス: イベントデータ（`type`, `detail`）を保持する。
   - `YuzoraEventTarget` クラス: `addEventListener`, `removeEventListener`, `dispatchEvent` メソッドを提供し、イベント通知の中心となる。
   - locator に `YuzoraEventTarget` インスタンスを登録して、アプリケーション全体のイベントバスとして利用する。
2. **`Makefile` の更新**:
   - `JS_SRCS` に `src/js/modules/event.js` を追加。
3. **`tools/externs.js` の更新**:
   - `YuzoraEvent` と `YuzoraEventTarget` のコンパイル時リネーム抑制を追加。
4. **モジュール間呼び出しのイベント化**:
   - `LoadBookCommand` 実行時に `book-loaded` イベントを発火し、`Viewer` や `UI` はこれを監視して処理を実行する。
   - `NavigatePageCommand` 実行時に `page-changed` イベントを発火し、各モジュールで状態同期する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `YuzoraEventTarget` を用いて、イベント駆動で書籍のロードおよびページめくりが正常に機能すること。
- [x] 新たに作成したイベント機構をテストするユニットテストが追加され、正常にパスすること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
