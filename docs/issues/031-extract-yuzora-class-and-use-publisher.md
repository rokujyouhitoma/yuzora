---
ID: 031
種別: Refactor
優先度: Medium
ステータス: Open (New)
---

# [FEAT/ENH] Yuzoraクラスのファイル分割とPublisher連携 (ID: 031)

## 1. 概要 / Summary
現在 `ui.js` に含まれている `Yuzora` アプリケーション起動クラスを、独立した `yuzora.js` ファイルへ分割・抽出します。
また、`Yuzora` クラスの初期化時に `Publisher` クラスをインスタンス化して `publisher` 属性にバインドします。
イベントの `addEventListener`、`removeEventListener`、`dispatchEvent` を各モジュールから利用する際は、原則として `yuzora.publisher` (または Locator 経由) を通じた Pub/Sub インターフェースを使用するように書き換えます。
さらに、`window.locator` プレフィックスを排除し、原則として `Yuzora.locator` 経由で依存関係を解決するようにクリーンアップします。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): N/A (内部設計のリファクタリング)
- 関連要件 (SRD): N/A (内部構造の共通化・疎結合化)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [yuzora.js](file:///workspace/yuzora/yuzora/src/js/modules/yuzora.js) (Yuzoraクラスの定義および初期化)
- [ ] [ui.js](file:///workspace/yuzora/yuzora/src/js/modules/ui.js) (Yuzoraクラスの削除、およびイベント処理のPublisher移行)
- [ ] [viewer.js](file:///workspace/yuzora/yuzora/src/js/modules/viewer.js) (イベント処理のPublisher移行)
- [ ] [commands.js](file:///workspace/yuzora/yuzora/src/js/modules/commands.js) (イベント処理のPublisher移行)
- [ ] [externs.js](file:///workspace/yuzora/yuzora/src/externs.js) (Yuzoraクラスのプロパティおよび新規ファイルの外部定義の追加)
- [ ] [Makefile](file:///workspace/yuzora/yuzora/Makefile) (yuzora.js のコンパイル設定の追加)
- [ ] [index.html](file:///workspace/yuzora/yuzora/index.html) (yuzora.js スクリプトタグの追加)
- [ ] [event.test.js](file:///workspace/yuzora/yuzora/tests/unit/event.test.js) (イベントテストのPublisher経由へのリファクタリング)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/031-extract-yuzora-class-and-use-publisher`

1. **`Yuzora` クラスの抽出 (`yuzora.js`)**:
   - `src/js/modules/yuzora.js` を作成し、`class Yuzora` を移送します。
   - `Yuzora` のコンストラクタ内で `this.publisher = /** @type {!PublisherInterface} */ (this.locator.resolve(Publisher));` として `Publisher` インスタンスを取得・保持します。
   - `DOMContentLoaded` 時のブートローダを `yuzora.js` に移動します。
2. **`Yuzora.locator` による Locator アクセスのクリーンアップ**:
   - `Yuzora.locator = locator;` または `yuzora.locator` として locator を公開し、コード内の `window.locator` を `Yuzora.locator` (または `yuzora.locator`) に置き換えます。
3. **`yuzora.publisher` によるイベント通信の統一**:
   - `addEventListener` -> `yuzora.publisher.subscribe(topic, callback)`
   - `removeEventListener` -> `yuzora.publisher.unsubscribe(topic, callback)`
   - `dispatchEvent` -> `yuzora.publisher.publish(topic, data)`
   - これに沿って、`ui.js`, `viewer.js`, `commands.js` 内のカスタムイベント呼び出しを書き換えます。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `npm run lint` を実行し、すべての静的検証（サイクロマティック複雑度 10 以下を含む）をパスすること。
- [ ] `make clean && make` で Closure Compiler ビルドがエラー・警告なしで完了すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
