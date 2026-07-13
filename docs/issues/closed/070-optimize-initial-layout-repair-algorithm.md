---
ID: 070
種別: Refactor
優先度: High
ステータス: Closed
---

# [FEAT/ENH] 初期レイアウト修復アルゴリズムの1パス化によるロード処理 of 最適化 (ID: 070)

## 1. 概要 / Summary
大容量書籍（吉川英治「地の巻」など）のロード直後やリサイズ時に実行されるレイアウト修復処理（`adjustPageBreaksForOverrun`）が、最大30回ループの $O(MaxIterations \times pageCount \times N)$ ループ設計になっているため、ロード完了後にUIスレッドが数秒間ブロッキングし、操作不能になる問題を解消します。
レイアウト修復時の走査を、先頭段落から末尾段落への1パス（1方向の走査）に簡素化し、改ページ挿入に伴う位置再計算を最小限に抑えることで、計算量を $O(N)$ レベルに削減します。本変更は、[MNG-00](../docs/MNG-00-development_philosophy.md) に掲げる「クライアントサイドでの快適な読書体験」に合致するパフォーマンス向上施策です。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (スムーズな操作性)
- 関連要件 (SRD): REQ-03-SRD-05 (パフォーマンス制御)
- 関連バックログ: [058-optimize-initial-layout-repair-algorithm.md](../backlogs/058-optimize-initial-layout-repair-algorithm.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/renderer.js](../../src/js/modules/renderer.js)
  - `adjustPageBreaksForOverrun()` の実装を1パス走査に最適化
  - 不要となった `runOverrunCheckPass()` および `checkAndRepairParagraphOverrun()` を削除
- [x] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md)
  - セクション 1.2.11 の「最大30回の反復限界（収束ループ）」に関する設計説明を、1パス走査アルゴリズムの説明へ更新

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/070-optimize-initial-layout-repair`

1. **設計書の修正**:
   - [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) のセクション 1.2.11 の記述を、収束ループ方式から1パス走査方式に変更する。

2. **`renderer.js` の修正**:
   - `adjustPageBreaksForOverrun()` を以下のように実装する：
     - すべての動的改ページ（`.dynamic-page-break`）をクリアする。
     - 表示対象の段落のリスト（`childNodes`）を準備する。
     - インデックス `i = 0` の `while (i < childNodes.length)` ループを実行する。
     - 段落 `child = childNodes[i]` がページ境界をまたぐかを判定する：
       - `rect = child.getBoundingClientRect()`
       - `docLeft = rect.left + absScroll`, `docRight = rect.right + absScroll` を計算。
       - またぐべき境界 `boundaryX = (Math.floor(docLeft / clientWidth) + 1) * clientWidth` を算出。
       - `docLeft < boundaryX && docRight > boundaryX` の場合、境界をまたぐと判定。
     - またぐ場合、`findCharAtDocumentBoundary(child, boundaryX, ...)` を呼び出して文字レベルのはみ出しを判定。
     - はみ出しがあれば、`pageBreak`（`.dynamic-page-break`）を `child` の直前に挿入。
     - 改ページ挿入時は、押し出された段落が次の境界もまたぐ可能性があるため、`i` をインクリメントせずにループを続行する。
     - またがない場合、またははみ出しがない場合は `i++` で次の段落に進む。
     - 最後にメトリクスを収集し、`LAYOUT_REPAIRED` イベントを発行する。
   - `runOverrunCheckPass` と `checkAndRepairParagraphOverrun` は不要となるため削除。

3. **テスト実行**:
   - 変更後、`npm run test:unit` を実行して既存のレンダリング関連テストが壊れていないか確認する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] 「地の巻」ロード時の `adjustPageBreaksForOverrun` の処理時間が劇的に削減されること（目安として 200ms 以下）。
- [x] 書籍ロード時のUIスレッドのフリーズ（数秒のフリーズ）が完全に解消されること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 実装内容が [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) と完全に一致していること（デッドドキュメントがないこと）。
- [x] `make` による Closure Compiler のコンパイルが正常に完了すること。
