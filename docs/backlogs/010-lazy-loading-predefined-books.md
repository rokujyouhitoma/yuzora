---
ID: 010
種別: Enhancement
優先度: Low
ステータス: Approved
---

# [ENH] 起動時オススメ書籍グリッドの遅延レンダリング (ID: 010)

## 1. 概要 / Summary
アプリ起動（`DOMContentLoaded`）にかかる時間（ブロッキング時間）を極限まで減らし、初期画面の体感表示速度を高めます。
ウェルカム画面の「開発者オススメ本」および「読書家オススメ本」のグリッド DOM 構築とカードのレンダリング処理を、初期表示完了後に `requestAnimationFrame` や `setTimeout` を使用して 1 フレーム遅延させて非同期的に実行します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[ui.js](src/js/modules/ui.js)** (MODIFY):
  - `setupPredefinedBooksGrids` 関数内でのスケルトン生成および実際のカード生成処理全体を `requestAnimationFrame` + `setTimeout(..., 0)` で囲むことで遅延（Lazy-load）させます。

---

## 3. 実装方針 / Implementation Plan
* `setupPredefinedBooksGrids` 関数を以下のように非同期に遅延実行する構造へ変更します：
  ```javascript
  function setupPredefinedBooksGrids() {
      // requestAnimationFrame で 1フレーム遅延
      requestAnimationFrame(() => {
          setTimeout(() => {
              // スケルトン生成
              createSkeletons(...);
              
              // 600ms後にカードレンダリング
              setTimeout(() => {
                  renderActualCards();
              }, 600);
          }, 0);
      });
  }
  ```

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] オススメ書籍グリッドの初期構築およびカード描画が `requestAnimationFrame` で遅延されて実行されること。
- [ ] 画面遷移や推奨書籍のクリックによる書籍ロード機能が正常に機能し、不整合が発生しないこと。
- [ ] すべての静的解析（`npm run lint`）やユニット・E2Eテストがパスすること。
