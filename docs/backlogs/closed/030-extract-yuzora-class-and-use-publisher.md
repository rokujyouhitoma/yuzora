---
ID: 030
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] Yuzoraクラスのファイル分割とPublisher連携 (ID: 030)

## 1. 概要 / Summary
現在 `ui.js` に含まれている `Yuzora` アプリケーション起動クラスを、独立した `yuzora.js` ファイルへ分割・抽出します。
また、`Yuzora` クラスの初期化時に `Publisher` クラスをインスタンス化して `publisher` 属性にバインドします。
イベントの `addEventListener`、`removeEventListener`、`dispatchEvent` を各モジュールから利用する際は、原則として `yuzora.publisher` (または Locator 経由) を通じた Pub/Sub インターフェースを使用するように書き換えます。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [yuzora.js](file:///workspace/yuzora/yuzora/src/js/modules/yuzora.js) (Yuzoraクラスの定義および初期化)
- [MODIFY] [ui.js](file:///workspace/yuzora/yuzora/src/js/modules/ui.js) (Yuzoraクラスの削除、およびイベント処理のPublisher移行)
- [MODIFY] [viewer.js](file:///workspace/yuzora/yuzora/src/js/modules/viewer.js) (イベント処理のPublisher移行)
- [MODIFY] [commands.js](file:///workspace/yuzora/yuzora/src/js/modules/commands.js) (イベント処理のPublisher移行)
- [MODIFY] [externs.js](file:///workspace/yuzora/yuzora/src/externs.js) (Yuzoraクラスのプロパティおよび新規ファイルの外部定義の追加)
- [MODIFY] [Makefile](file:///workspace/yuzora/yuzora/Makefile) (yuzora.js のコンパイル設定の追加)
- [MODIFY] [index.html](file:///workspace/yuzora/yuzora/index.html) (yuzora.js スクリプトタグの追加)
- [MODIFY] [event.test.js](file:///workspace/yuzora/yuzora/tests/unit/event.test.js) (イベントテストのPublisher経由へのリファクタリング)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **`Yuzora` クラスの抽出**:
   - `src/js/modules/yuzora.js` を作成し、`class Yuzora` を移送します。
   - `Yuzora` のコンストラクタ内で `this.publisher = /** @type {!PublisherInterface} */ (this.locator.resolve(Publisher));` として `Publisher` インスタンスを取得・保持します。
   - `DOMContentLoaded` 時のブートローダを `yuzora.js` に移動します。
2. **`yuzora.publisher` によるイベント通信の統一**:
   - `addEventListener` -> `yuzora.publisher.subscribe(topic, callback)`
   - `removeEventListener` -> `yuzora.publisher.unsubscribe(topic, callback)`
   - `dispatchEvent` -> `yuzora.publisher.publish(topic, data)`
   - これに沿って、`ui.js`, `viewer.js`, `commands.js` 内のカスタムイベント呼び出しを書き換えます。
3. **`window` オブジェクトへの直接アクセスの削減**:
   - 各ソースコード内に存在する `window.locator` などの `window` プレフィックスを排除し、原則として `Yuzora.locator` (クラスの静的プロパティまたはインスタンスプロパティ) 経由で依存関係を解決するようにクリーンアップします。
4. **Closure Compiler への適合性**:
   - `externs.js` に `Yuzora.locator;` および `Yuzora.prototype.publisher;` を定義し、Advanced 難読化ビルド時にプロパティ名が破壊されないようにします。

---

## 4. 完了条件 / Success Criteria (DoD)
- [x] `npm run lint` を実行し、すべての静的検証（サイクロマティック複雑度 10 以下を含む）をパスすること。
- [x] `make clean && make` で Closure Compiler ビルドがエラー・警告なしで完了すること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
