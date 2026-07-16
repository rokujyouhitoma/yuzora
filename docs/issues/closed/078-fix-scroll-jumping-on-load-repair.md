---
ID: 078
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] ページ読込時の自動スクロール完了後にレイアウト自己修復によるスクロール位置のズレ（跳ね）が発生する問題 (ID: 078)

## 1. 概要 / Summary
書籍データを読み込んだ際、saved bookmarkの位置への自動スクロール（`restoreScrollPosition()`）が実行された直後に、非同期でトリガーされたレイアウト自己修復（`adjustPageBreaksForOverrun()`）が実行されます。
この自己修復処理により、改ページの挿入やサイズ再計算が完了すると、ドキュメントの総スクロール幅（`scrollWidth`）や要素の相対位置が変化します。この変化によって、事前に復元されていた `scrollLeft` 座標が最終的な settled レイアウトに対してズレてしまい、結果的にスクロール位置が50px程度（カラムギャップや段組みの幅に相当する幅）勝手にずれる（跳ねる）現象が発生する問題を解決しました。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [renderer.js](../../src/js/modules/renderer.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. 書籍ロード完了時、まず `restoreScrollPosition()` が synchronous に呼び出され、未修復（改ページサイズ未調整・動的改ページ未挿入）の `scrollWidth` に基づいて `scrollLeft` が設定される。
2. その後、非同期マクロタスクとしてスケジュールされていた自己修復 `adjustPageBreaksForOverrun()` が実行される。
3. `adjustPageBreaksForOverrun()` が要素のサイズ設定（`applyPageBreakSizes()`）や動的改ページの挿入を行うことで、最終的な DOM の幅およびレイアウトが確定し、`scrollWidth` が変わる。
4. このレイアウト確定に伴い、事前に設定した `scrollLeft` が最終 settled レイアウトと乖離し、表示位置がズレてしまう。
5. 解決策として、自己修復レイアウト確定処理の最終段階（`cacheParagraphBounds()` 実行後）において、`BookmarkModel` に保存されている元の読書進捗割合（`bookmarkProgress`）を読み出し、最新の `scrollWidth` に基づいて `restoreScrollPosition` を再実行することで、スクロール位置を常に正確に補正・追従させる。

---

## 4. 恒久対策 / Permanent Fix
* **恒久対策 (Permanent Fix)**:
  1. `adjustPageBreaksForOverrun()` 内のレイアウト調整と境界キャッシュ更新の直後に、`BookmarkModel.bookmarkProgress` から進捗割合を取得し、`this.restoreScrollPosition(progress, false)` を用いて最新の `scrollWidth` に同期したスクロール位置の再復元・アライメントを行う（実装済み）。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] ページ読み込み完了時、および自己修復実行後にスクロール位置が予期せず50px程度跳ねる・ずれる挙動が発生しないこと。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
