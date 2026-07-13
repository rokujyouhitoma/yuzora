---
ID: 068
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] ページ境界のはみ出し文字検査処理のボトルネックによるページ遷移遅延 (ID: 068)

## 1. 概要 / Summary
Issue 067 にてスクロール時のレイアウト情報のキャッシュや requestAnimationFrame 等を導入したものの、依然としてページ遷移時（特に大きな書籍のページ送り時）に数百ミリ秒レベルの大きなフリーズやカクつきが発生します。

### 再現手順 / Steps to Reproduce
1. アプリを起動し、書籍（例：「こころ」や「宮本武蔵」）を開く。
2. ページを進める（クリックまたはスワイプ等）。
3. ページ切り替えの確定直後、画面が一瞬フリーズする。

### 再現環境 / Environment
- Browser / OS: 全てのブラウザ環境
- Book / File: ページ数が多く段落が長い書籍データ全般

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) — `findCharAtDocumentBoundary` の探索ロジック

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
ページ遷移完了後に `PAGE_CHANGED` イベントが発行され、`hasOverrunNearCurrentPage` によるページ境界の見切れ診断がトリガーされます。
この見切れ診断の中で呼び出される `findCharAtDocumentBoundary` は、境界線と交差する段落要素内の**全てのテキストノードの全文字**に対してループを回し、文字ごとに `document.createRange()` と `range.getBoundingClientRect()` を同期的に呼び出しています。
`getBoundingClientRect()` は呼び出しごとにブラウザの同期レイアウト再計算を強制するため、文字数に比例して（数千回以上）レイアウト計算が走り、メインスレッドを長時間占有（Layout Thrashing / CPU過負荷）することが最大のボトルネックとなっています。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  1. **テキストノード単位の事前バウンディングボックス検査**: 各テキストノードの全文字を走査する前に、`selectNodeContents` でテキストノード全体の矩形を取得し、これが境界線 `boundaryX` とそもそも交差しているかを判定します。交差していないテキストノード（全体の左右が境界より左または右にある場合）は即座にスキップします。
  2. **二分探索 (Binary Search) による交差文字判定**: 境界線と交差している数少ないテキストノードについてのみ、文字インデックスを二分探索して境界線をまたぐ文字（`docLeft < boundaryX && docRight > boundaryX`）を特定します。これにより、レイアウト更新を伴う DOM API 呼び出しの回数を $N$ から $\log_2(N)$ に削減します。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/068-optimize-page-boundary-overrun-check`

1. `renderer.js` 内の `findCharAtDocumentBoundary` を修正し、各テキストノード全体の境界交差判定を追加する。
2. テキストノード内の文字を順次走査する代わりに、RTL (右から左) / LTR (左から右) の書籍送り方向に応じた二分探索処理を実装する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] `findCharAtDocumentBoundary` が二分探索を用いて高速に交差文字を判定できること。
- [x] ページ遷移時のコンソールログにおいて、`hasOverrunNearCurrentPage` の所要時間が 1ms 未満に劇的に改善していること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
