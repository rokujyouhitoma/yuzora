---
ID: 053
種別: Feature
優先度: Medium
ステータス: Draft
---

# [FEATURE] ページ移動確定後に PAGE_CHANGED イベントを発火し、イベント駆動による共通レイアウト診断・自己修復をトリガーする (ID: 053)

## 1. 概要 / Summary
現在、ページ移動アニメーション（スクロール）が完了した後の処理（進捗更新、しおり保存など）は `viewer.js` の `scrollToPage()` 関数内に直接記述されており、同期的に処理されています。また、表示されるページが確定したことを伝える `YuzoraEventType.PAGE_CHANGED`（`ui:page-changed`）イベントは定義されているものの、どこからも発火されていません。

さらに、書籍ロード直後、ウィンドウリサイズ時、およびページ移動完了時に、はみ出し修復エンジン（`adjustPageBreaksForOverrun()`）をトリガーするロジックが各所に分散して直接呼び出されています。この中には、はみ出し判定（`hasOverrun`）を挟まずに直接重い修復を走らせている箇所もあります。

本バックログでは、ページ移動確定後に `PAGE_CHANGED` イベントを正しく発火させるとともに、**「レイアウトはみ出し検証の要求」および「レイアウト修復の実行」をそれぞれ専用のイベントを介して共通化・疎結合化するイベント駆動設計（EDA）**へと改善します。

### 具体的な設計方針・イベントフロー：
1. **イベントによる抽象化**
   - **`LAYOUT_CHECK_REQUESTED` (`'system:layout-check-requested'`)** :
     - レイアウトの検証が必要なタイミング（書籍ロード完了後、リサイズ時、`PAGE_CHANGED` イベント発生後など）に発火されるイベント。
   - **`LAYOUT_REPAIR_REQUESTED` (`'system:layout-repair-requested'`)** :
     - 検証処理によって「真のはみ出し・見切れ」が検出された場合に、修復エンジン（`adjustPageBreaksForOverrun`）の実行を要求するために発火されるイベント。
2. **処理の流れ（共通イベント駆動フロー）**
   - 契機（ロード / リサイズ / ページ変更など）が発生。
   - 契機となったモジュール（`viewer.js` など）は `LAYOUT_CHECK_REQUESTED` イベントを発火。
   - レイアウト診断コントローラー（または購読側の共通リスナー）が `LAYOUT_CHECK_REQUESTED` を受信し、対象ページの境界（または全体）で `hasOverrun`（はみ出し判定）を実行（DOMを変更しない軽量な読み取り専用チェック）。
   - もしはみ出しが確認された場合、診断コントローラーは `LAYOUT_REPAIR_REQUESTED` イベントを発火。
   - レンダラー（`VerticalRenderer`）が `LAYOUT_REPAIR_REQUESTED` を購読し、`adjustPageBreaksForOverrun()` を呼び出して改ページの動的挿入と DOM の自己修復を実行。完了時に `LAYOUT_REPAIRED` を発火する。

### メリット・SAとの検討事項：
- **パフォーマンス最適化の共通化**：
  すべてのタイミング（ロード・リサイズ・ページ移動）において、「まず軽量判定し、はみ出している場合のみ重い修復を走らせる」というガードロジックがイベント駆動の共通フローとして強制されます。
- **モジュールの疎結合化**：
  `viewer.js` などの各UI制御部が、`renderer.js` の `adjustPageBreaksForOverrun` や `hasOverrunNearCurrentPage` などの具象メソッドを直接呼び出す依存関係が排除され、すべてイベントを介したインターフェースに整理されます。

