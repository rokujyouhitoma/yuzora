---
ID: 049
種別: Enhancement
優先度: Low
ステータス: Closed
---

# [ENH] 起動時オススメ書籍グリッドの遅延レンダリング (ID: 049)

## 1. 概要 / Summary
アプリ起動（`DOMContentLoaded`）にかかる時間（ブロッキング時間）を極限まで減らし、初期画面の体感表示速度を高めます。
ウェルカム画面の「開発者オススメ本」および「読書家オススメ本」のグリッド DOM 構築とカードのレンダリング処理を、初期表示完了後に `requestAnimationFrame` や `setTimeout` を使用して 1 フレーム遅延させて非同期的に実行します。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01 (機能要件)
* 関連要件 (SRD): SRD-05 (UI・パフォーマンス設計)
* 関連バックログ: [010-lazy-loading-predefined-books.md](../backlogs/closed/010-lazy-loading-predefined-books.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [ui.js](src/js/modules/ui.js) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enhancement/049-lazy-loading-predefined-books`

* `setupPredefinedBooksGrids` 関数を `requestAnimationFrame` + `setTimeout(..., 0)` で囲むことで遅延（Lazy-load）させます。
* レンダリング時の安全ガードとして、現在のアクティブなシーンが `welcome` であることを常にアサートした上で DOM を操作するようにします。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] オススメ書籍グリッドの初期構築およびカード描画が `requestAnimationFrame` で遅延されて実行されること。
- [ ] 画面遷移や推奨書籍のクリックによる書籍ロード機能が正常に機能し、不整合が発生しないこと。
- [ ] すべての静的解析（`npm run lint`）やユニット・E2Eテストがパスすること。
