---
ID: 022
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] 右から左（RTL/標準）送り時のページナビゲーション不具合 (ID: 022)

## 1. 概要 / Summary
右から左（RTL/標準）送り設定時において、画面右エリアをクリック/タップしても前のページに戻らない不具合が発生しています。また、RTL設定時に右スワイプ（指を左から右へ動かす）しても前ページに戻らない（タッチスワイプでのページ送り機能自体が未実装である）不具合が発生しています。

### 再現手順 / Steps to Reproduce
1. ビューアー画面で設定（Settings）ドロワーを開く。
2. ページの送り方向を「RTL（標準）」に設定する。
3. 2ページ目以降に進んだ状態で、画面右エリアをクリック/タップしても、1ページ目（前ページ）に戻らない。
4. モバイル端末またはシミュレーターにおいて、画面を右スワイプ（左から右へのスワイプ）してもページがめくられない（何も反応しない）。

### 再現環境 / Environment
- Browser / OS: Chrome / Safari / Firefox
- Book / File: 任意の書籍（例：こころ、地獄変など）

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [commands.js](../../src/js/modules/commands.js) (`NavigatePageCommand.execute` における `scrollLeft` の計算ロジック)
- [x] [ui.js](../../src/js/modules/ui.js) (`setupEventListeners` 内でのタッチスワイプジェスチャーハンドラーの追加)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. **RTL送り時の右エリアクリックで戻らない問題の根本原因**:
   - `NavigatePageCommand.execute()` の実装において、`scrollLeft` のスクロール目標位置を `this.targetPage * pageWidth` と計算していました。
   - `this.targetPage` は 1-indexed (例: 1, 2, 3) であるため、本来 Page 1 にスクロールする（`scrollLeft = 0`）べきところを、`1 * pageWidth` にスクロールするバグが生じていました。
   - そのため、現在の表示ページが常に目標ページに対して off-by-one (1ページ先送り) になり、RTL/LTR の両方向でページめくり計算がずれ、戻り操作時（特に `currentPage = 2` から `1` への遷移時）に位置が変わらない状態になっていました。
   - さらに、本来詳細設計書 [DSN-02](../../docs/DSN-02-low_level_design.md#52-目次tocジャンプ座標計算仕様) では `NavigatePageCommand` 内で `scrollToPage(targetPage)` を実行するよう指定されていたのに対し、実際の実装では `scrollToPage` を使用せず `scrollLeft` を直接書き換えていたため、ページ送りのライフサイクル（`bookmarkProgress` 更新やしおり保存処理など）も実行されていませんでした。

2. **RTL送り時に右スワイプで前ページに戻らない問題の根本原因**:
   - システム要件書 [REQ-03](../../docs/REQ-03-system_requirements.md) および詳細設計書 [DSN-02](../../docs/DSN-02-low_level_design.md) にはタッチスワイプジェスチャーを用いた1ページ制限付きページ送りが定義されていましたが、実装モジュール `ui.js` にはビューポートに対する `touchstart` / `touchmove` / `touchend` のスワイプ検知イベントハンドラー自体が実装されていませんでした。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: 
  - キーボードの左右矢印キーによる操作で代替する。
* **恒久対策 (Permanent Fix)**: 
  - `NavigatePageCommand.execute()` の実装を詳細設計通り `scrollToPage(this.targetPage)` の呼び出しに修正し、off-by-one 計算ズレを解消し、正規のページ遷移処理サイクルを適用します。
  - `ui.js` の `setupEventListeners()` 内で、`readerViewport` に対してタッチイベント (`touchstart`, `touchend`) を登録し、詳細設計書に準拠した判定式（$\Delta x$ と $\Delta y$ の比較・方向判定）を用いて、RTL / LTR それぞれの進行方向に応じた `nextPage()` および `prevPage()` を正しくトリガーします。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/022-rtl-page-navigation-issue`

### 5.1. `src/js/modules/commands.js` の修正
- `NavigatePageCommand.execute()` 内のスクロール直接代入処理を削除し、グローバル関数 `scrollToPage(this.targetPage)` を実行するように変更。
  ```javascript
  execute() {
      const state = window.locator.resolve(AppState);
      if (state.readerViewport) {
          scrollToPage(this.targetPage);
      }
  }
  ```

### 5.2. `src/js/modules/ui.js` の修正
- `setupEventListeners()` 内にタッチスワイプ検知ロジックを追加。
  - `touchstart` 時にタッチ開始座標 `touchStartX`, `touchStartY` を保存。
  - `touchend` 時に終了座標 `touchEndX`, `touchEndY` を取得し、水平移動量 $\Delta x = \text{touchEndX} - \text{touchStartX}$ および垂直移動量 $\Delta y = \text{touchEndY} - \text{touchStartY}$ を算出。
  - **しきい値チェック**: $\text{Math.abs}(\Delta x) > 50$ 且つ $\text{Math.abs}(\Delta x) > \text{Math.abs}(\Delta y)$ である場合にのみ水平スワイプと判定する。
  - **方向マッピング (設計仕様準拠)**:
    - `config.direction === "rtl"` の場合:
      - $\Delta x > 0$ （右スワイプ）: `nextPage()` を実行（ページ順方向・左へ進む）。
      - $\Delta x < 0$ （左スワイプ）: `prevPage()` を実行（ページ逆方向・右へ戻る）。
    - `config.direction === "ltr"` の場合:
      - $\Delta x > 0$ （右スワイプ）: `prevPage()` を実行（ページ逆方向・左へ戻る）。
      - $\Delta x < 0$ （左スワイプ）: `nextPage()` を実行（ページ順方向・右へ進む）。
  - パフォーマンスのためタッチイベントリスナーには `{ passive: true }` を付与。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] RTL送りモード設定時、画面右側のナビゲーションエリア（`#page-nav-right`）のクリックで前のページへ戻ること。
- [ ] LTR送りモード設定時、画面左側のナビゲーションエリア（`#page-nav-left`）のクリックで前のページへ戻ること。
- [ ] RTL送りモード設定時、右スワイプ（左から右）で次のページに進み、左スワイプ（右から左）で前のページに戻ること。
- [ ] LTR送りモード設定時、左スワイプ（右から左）で次のページに進み、右スワイプ（左から右）で前のページに戻ること。
- [ ] タッチスワイプ時、1回のスワイプ動作で厳密に「1ページ分だけ」遷移すること（スクロール慣性による複数ページスキップが発生しないこと）。
- [ ] スワイプ動作によってヘッダー・フッターメニューの表示トグル（`toggleControls`）が意図せず発火しないこと。
- [ ] 本実装は [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
