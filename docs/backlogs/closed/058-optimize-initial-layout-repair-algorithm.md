---
ID: 058
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] 初期レイアウト修復アルゴリズムの1パス化によるロード処理の最適化 (ID: 058)

## 1. 概要 / Summary
大容量書籍（吉川英治「地の巻」など）のロード直後やリサイズ時に実行されるレイアウト修復処理（`adjustPageBreaksForOverrun`）が、最大30回ループの $O(MaxIterations \times pageCount \times N)$ ループ設計になっているため、ロード完了後にUIスレッドが数秒間ブロッキングし、操作不能になる問題を解消します。
レイアウト修復時の走査を、先頭段落から末尾段落への1パス（1方向の走査）に簡素化し、改ページ挿入に伴う位置再計算を最小限に抑えることで、計算量を $O(N)$ レベルに削減します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [src/js/modules/renderer.js](../../src/js/modules/renderer.js)
  - `adjustPageBreaksForOverrun` メソッドの最適化 (1パス走査による $O(N)$ への削減)
  - `runOverrunCheckPass` / `checkAndRepairParagraphOverrun` の廃止、または設計変更

---

## 3. 要件と技術的詳細 / Requirements and Technical Details

### 3.1 従来のアルゴリズムの課題
従来の `adjustPageBreaksForOverrun` は、改ページを1箇所追加するたびにスキャンを最初からやり直していました。また、各ページ境界に対してすべての段落をチェックする $O(pageCount \times N)$ の二重ループになっていました。このため、大規模な書籍では Layout Thrashing が大量に発生し、処理時間が数秒以上に及ぶフリーズ状態を生んでいました。

### 3.2 提案する1パス走査アルゴリズム
1. 既存のすべての動的改ページ（`.dynamic-page-break`）をクリアする。
2. `readerContent.children` のうち、非表示でない段落ノードのリスト（`childNodes`）を準備する。
3. `i = 0` から `childNodes.length` に向かって走査する `while` ループを実行する。
4. ループ内の処理:
   - 直前の要素がすでに改ページであれば、無限ループ防止のためスキップする。
   - `getBoundingClientRect()` により、現在の段落 `child` の位置を取得し、ドキュメント絶対座標 `docLeft = rect.left + absScroll`, `docRight = rect.right + absScroll` を求める。
   - 段落がまたぐべきページ境界を計算で求める:
     `k = Math.floor(docLeft / clientWidth) + 1`
     `boundaryX = k * clientWidth`
   - `docLeft < boundaryX && docRight > boundaryX` であれば、境界をまたいでいると判定する。
   - 境界をまたいでいる場合、`findCharAtDocumentBoundary(child, boundaryX, ...)` を呼び出して文字レベルのはみ出しを確認する。
   - はみ出しを確認した場合、改ページ要素 `.dynamic-page-break` を段落の直前に挿入する。
   - 改ページが挿入されたら、同じ段落を再度評価するため、インデックス `i` を進めずにループを続行する（次の評価時には、押し出されて位置がずれた段落の新しい絶対座標が評価される）。
   - またいでいない、またははみ出しがない場合は、`i++` で次の段落に進む。
5. この1パス走査により、`getBoundingClientRect()` の呼び出し回数は $O(N)$ レベルになり、レイアウト修復処理が高速化されます。

---

## 4. 完了条件 / Success Criteria (DoD)
- [x] 「地の巻」ロード時の `adjustPageBreaksForOverrun` の処理時間が劇的に削減されること（目安として 200ms 以下）。
- [x] 処理中のUIスレッドの長時間ブロッキング（数秒のフリーズ）が解消されること。
- [x] 既存の単体テスト（`tests/unit/renderer.test.js` など）およびE2Eテストがすべてパスすること。
- [x] Closure Compiler によるコンパイルがエラーなしで完了すること。
