---
ID: 064
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] ページ移動確定後の PAGE_CHANGED イベント発火と自己修復連動 (ID: 064)

## 1. 概要 / Summary
現在、ページ移動アニメーション（スクロール）が完了した後の処理（進捗更新、しおり保存など）は `viewer.js` の `scrollToPage()` 関数内に直接記述されており、同期的に処理されています。また、表示されるページが確定したことを伝える `YuzoraEventType.PAGE_CHANGED`（`ui:page-changed`）イベントは定義されているものの、どこからも発火されていません。

さらに、書籍ロード直後、ウィンドウリサイズ時、およびページ移動完了時に、はみ出し修復エンジン（`adjustPageBreaksForOverrun()`）をトリガーするロジックが各所に分散して直接呼び出されています。この中には、はみ出し判定（`hasOverrun`）を挟まずに直接重い修復を走らせている箇所もあります。

本Issueでは、ページ移動確定後に `PAGE_CHANGED` イベントを正しく発火させるとともに、**「レイアウトはみ出し検証の要求」および「レイアウト修復の実行」をそれぞれ専用のイベントを介して共通化・疎結合化するイベント駆動設計（EDA）**へと改善します。

この設計変更は、`MNG-00`（開発哲学・マニフェスト）における「多様な操作チャネルの完全同期」「サーバーレス・クライアントサイド実行」に完全に適合した堅牢でパフォーマンスの高いUI制御を実現するものです。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): URD-01
- 関連要件 (SRD): SRD-02

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/event.js](../../src/js/modules/event.js) — 新イベント定数（`LAYOUT_CHECK_REQUESTED`, `LAYOUT_REPAIR_REQUESTED`）の追加
- [x] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) — ページ移動完了時に `PAGE_CHANGED` を発火、およびロード・ページ移動・リサイズ時のイベント発火連携
- [x] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) — `LAYOUT_REPAIR_REQUESTED` イベントの購読と `adjustPageBreaksForOverrun()` のトリガー
- [x] [src/js/modules/yuzora.js](../../src/js/modules/yuzora.js) — イベントチェック要求の購読とレイアウト診断ロジックの呼び出し調整（コーディネーター役）
- [x] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md) — イベント駆動設計セクション（§1.4）の更新

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/064-publish-page-changed-event`

### 4.1 イベントの定義 (`src/js/modules/event.js`)
`YuzoraEventType` 定数に以下を追加します。
- `LAYOUT_CHECK_REQUESTED: 'system:layout-check-requested'`
- `LAYOUT_REPAIR_REQUESTED: 'system:layout-repair-requested'`

### 4.2 コントローラーの実装 (`src/js/modules/yuzora.js`)
`Yuzora.prototype.initialize` 内で、以下のイベント購読を定義します。
1. **`PAGE_CHANGED` の購読**:
   - 受信時に `LAYOUT_CHECK_REQUESTED`（`scope: 'current'`）をパブリッシュする。
2. **`LAYOUT_CHECK_REQUESTED` の購読**:
   - ペイロード `{ scope: 'current' | 'all' }` を処理する。
   - `scope === 'current'` の場合：`renderer.hasOverrunNearCurrentPage()` を呼び出し、はみ出しが検出された場合のみ `LAYOUT_REPAIR_REQUESTED` をパブリッシュする。
   - `scope === 'all'` の場合：無条件で `LAYOUT_REPAIR_REQUESTED` をパブリッシュする。

### 4.3 レンダラーの更新 (`src/js/modules/renderer.js`)
1. `VerticalRenderer` の `constructor` 内で `LAYOUT_REPAIR_REQUESTED` イベントを購読する。
   - 受信時に `this.adjustPageBreaksForOverrun()` を呼び出す。
2. `handleResize()` 内で、直接 `this.adjustPageBreaksForOverrun()` を呼び出していた箇所を、`LAYOUT_CHECK_REQUESTED`（`scope: 'all'`）の発火に変更する。

### 4.4 ビューアーの更新 (`src/js/modules/viewer.js`)
1. `displayBook()` の `setTimeout` 内で、直接 `renderer.adjustPageBreaksForOverrun()` を呼び出していた箇所を、`LAYOUT_CHECK_REQUESTED`（`scope: 'all'`）の発火に変更する。
2. `scrollToPage()` の `.then()` 内で、直接判定・修復を呼んでいた箇所を、`PAGE_CHANGED`（ペイロード `{ page: pageNumber }`）の発火に変更する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] ページ移動完了時に `ui:page-changed` イベントが正常に発火されること。
- [x] 書籍ロード、リサイズ、ページ移動の各タイミングで、直接のメソッドコールではなくイベント駆動フロー（`LAYOUT_CHECK_REQUESTED`）が正常に機能すること。
- [x] はみ出しがないページ移動時には `adjustPageBreaksForOverrun`（DOM操作）が走らず、はみ出しがある時のみ修復が実行されること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様（イベント定数の説明を含む）と完全に整合していること。
