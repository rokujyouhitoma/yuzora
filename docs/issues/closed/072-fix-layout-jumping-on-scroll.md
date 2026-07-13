---
ID: 072
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] スクロールでのページ遷移後にページの先頭位置が勝手に移動（カクつく）する問題 (ID: 072)

## 1. 概要 / Summary
ページをスクロール（ドラッグまたはスワイプ）して隣接ページに移動した直後に、ページ全体の先頭位置が瞬間的にズレたり、勝手に別の位置に移動してガクついたりする（カクつく）問題が発生しています。

### 再現手順 / Steps to Reproduce
1. 大容量書籍（「地の巻」など）をロードし、スクロール操作でページをめくる。
2. ページ遷移が完了してスナップされると、その一瞬後にページの表示位置が勝手に動き、ガクつく。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/renderer.js](../../src/js/modules/renderer.js)
  - `hasOverrunNearCurrentPage()` の境界またぎ要素抽出処理の修正
  - `checkSingleBoundary()` に渡される段落リストの修正

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
- `hasOverrunNearCurrentPage()` 内で、改ページ境界またぎ判定を行う `checkBoundariesForChildren()` に子要素リストを渡す際、あらかじめ `.page-break` 要素（改ページ要素）を除外したフィルタ済み配列 `children` を渡してしまっている。
- 一方、`checkSingleBoundary()` 内では「直前に改ページがある段落（`isPreceded`）をスキップする」ことで、すでに改ページ補正が完了している正常な位置での重複処理をガードしている。しかし、渡された配列から最初から `.page-break` が削除されているため、この `isPreceded` が常に `false` になる。
- 結果として、すでに改ページ調整がなされた位置の段落であっても常に「境界を跨いでいる（overrun がある）」と誤検出され、スクロールのたびに不要な `adjustPageBreaksForOverrun()` が呼び出される。
- `adjustPageBreaksForOverrun()` の実行開始時に既存の `.dynamic-page-break` が一斉に DOM から削除されるため、一時的にスクロール幅が縮み、ビューポートの `scrollLeft` が強制的に引き戻されて「カクつく」「ページの先頭が勝手に移動する」という現象を引き起こしていた。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  - `hasOverrunNearCurrentPage()` において、改ページ要素を除外せずに `parent.children`（または non-display でない要素のリスト）をそのまま `checkBoundariesForChildren` に渡す。これにより、`checkSingleBoundary` 内の `isPreceded` 判定（改ページ直後段落のスキップ）が正しく機能し、誤検出による無限修復ループを完全に防止する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/072-fix-layout-jumping-on-scroll`

1. **`hasOverrunNearCurrentPage()` の修正**:
   - `children` 配列の構築時に `.page-break` 要素を除外するフィルタリング処理を削除する。
   - `checkBoundariesForChildren` へ渡す配列に、`.page-break`（改ページ要素）が本来の並び順通りに含まれるようにする。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] ページ遷移完了後に `hasOverrunNearCurrentPage()` が誤検出して `true` を返さず、不要な `adjustPageBreaksForOverrun()` の再実行が発生しないこと。
- [x] ページをスクロール移動・スナップした後に、カクつきや勝手な先頭位置のジャンプが完全に解消されること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] `make` による Closure Compiler のコンパイルが正常に完了すること。
