---
ID: 028
種別: Refactor
優先度: Medium
ステータス: Open (New)
---

# [REFACTOR] 読書ビューアーのドメイン固有イベントの定義 (ID: 028)

## 1. 概要 / Summary
`Event` 登録・発火機構の導入（ID: 021）に続き、青空文庫縦書きビューアーのビジネスロジックやドメイン固有のイベントを明確に定義し、モジュール間の疎結合（疎結合イベント駆動アーキテクチャ）をさらに推進します。

イベントの識別名におけるマジックストリングの使用を完全に排除するため、各イベントタイプを型安全な定数オブジェクト（`YuzoraEventType`）として定義します。これにより、どのようなペイロード（データ型）がどのタイミングでやり取りされるかをコードおよびJSDocs上で厳密に定義し、Closure Compilerの `ADVANCED_OPTIMIZATIONS` による難読化・名前圧縮下でも安全に動作することを保証します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [022-define-domain-events.md](../backlogs/closed/022-define-domain-events.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [event.js](../../src/js/modules/event.js) (ドメインイベントの定数定義および型注記の追記)
- [MODIFY] [commands.js](../../src/js/modules/commands.js) (定数参照によるイベント発火への書き換え)
- [MODIFY] [viewer.js](../../src/js/modules/viewer.js) (定数参照によるイベント購読・発火への書き換え)
- [MODIFY] [ui.js](../../src/js/modules/ui.js) (定数参照によるイベント購読・発火への書き換え)
- [MODIFY] [externs.js](../../src/externs.js) (イベント定数オブジェクトの圧縮リネーム抑制の追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/028-define-domain-events`

1. **`src/externs.js` の更新**:
   - 定数オブジェクト `YuzoraEventType` およびその全プロパティキー名をコンパイラ難読化から保護するための定義を追加します。
2. **`src/js/modules/event.js` の変更**:
   - `YuzoraEventType` を `@enum {string}` として定義し、15種類のドメイン固有イベント名を設定します。
   - `YuzoraEvent` の引数 `detail` パースに各種 JSDoc 型注記を適用します。
3. **`commands.js`, `viewer.js`, `ui.js` の書き換え**:
   - 既存のマジックストリングによる `addEventListener`, `dispatchEvent` の第一引数へのイベント種別指定を、`YuzoraEventType` の対応するメンバープロパティ参照に置き換えます。
4. **検証**:
   - `make clean && make` で警告なしビルド完了を確認。
   - `npm run test:unit` および `npm run test:e2e` で動作にデグレードがないことを検証。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 定義した15種類のドメインイベントを表す定数（`YuzoraEventType`）が `event.js` に正しく定義されていること。
- [ ] 既存のマジックストリングによる `dispatchEvent` をこれら定義に基づいた参照方式に統一リファクタリングされること。
- [ ] すべてのE2Eテストおよびユニットテストが100%パスし、動作にデグレードがないこと。
