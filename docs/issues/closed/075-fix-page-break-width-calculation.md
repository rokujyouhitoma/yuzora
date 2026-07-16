---
ID: 075
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] page-breakの幅計算誤りの修正 (ID: 075)

## 1. 概要 / Summary
マルチカラム縦書きレイアウトにおいて、改ページ要素（`.page-break`）の横幅が計算されているものの、カラムギャップ（`column-gap`）分が考慮されていないため、改ページ直後の段落がカラムギャップ領域に配置されて見切れが発生する不具合、およびブラウザのウィンドウ幅を変更（リサイズ）した際に、古いインラインスタイル（`width` / `margin-block-end`）がリセットされないためにレイアウト計算が狂う不具合を修正します。

### 再現手順 / Steps to Reproduce
1. `[＃改ページ]` が含まれる書籍データを読み込む。
2. ブラウザのウィンドウ幅を変更する。
3. リサイズ後の `.page-break` 要素の幅が正しく更新されず、後続の行の位置がずれたり、カラムギャップへ入り込んで見切れたりすることを確認する。

### 再現環境 / Environment
- Browser / OS: Chromium based browsers (Chrome, Edge etc.) / Linux
- Book / File: 任意の `[＃改ページ]` を含むファイル（こころ等）

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [renderer.js](../../src/js/modules/renderer.js)
- [x] [DSN-02-low_level_design.md](../DSN-02-low_level_design.md)
- [x] [pagebreak.spec.js](../../tests/e2e/pagebreak.spec.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. 縦書きマルチカラムにおける改ページ制御において、`.page-break` 要素の `width` は直前の要素の左端から現在のカラムの左境界（`boundaryLeft`）までの距離（`remainingWidth`）として計算されていた。
2. しかし、カラム間の `column-gap` が考慮されないと、後続要素の開始位置がちょうどカラム境界（＝カラムギャップの開始位置）になってしまい、カラムギャップ領域へはみ出して見切れていた。
3. さらに、ウィンドウ幅の変更（リサイズ）などによってレイアウトが変更される際、以前に計算してインラインスタイルとして設定された `child.style.width` と `child.style.margin-block-end` がリセットされないまま残っていた。
4. この結果、ブラウザが新しいウィンドウ幅で要素の再配置（リフロー）を行う際、古いインラインサイズ情報に基づいてレイアウトが算出されてしまうため、`prevElement` の位置測定が歪み、再計算される `remainingWidth` が完全に誤った値になってしまう。
5. 解決策として、`applyPageBreakSizes()` の実行開始時にすべての `.page-break` 要素の `width`、`height`、および `margin-block-end` のインラインスタイルを一度クリアし、ブラウザの自然なカラム構成に戻した上で、各 `.page-break` の位置と残り幅を再計測して動的適用する必要がある。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  1. `resolveLayoutParameters()` の返り値に `columnGap` を追加（実装済み）。
  2. `applyPageBreakSizes()` 内で、サイズ計算を行う前にすべての `.page-break` 要素の `width`, `height`, `margin-block-end` などのインラインスタイルを一度クリアする。
  3. その後、静的・動的すべての `.page-break` に対し、`style.width = remainingWidth` および `style.marginBlockEnd = columnGap` を順次設定する。
  4. `tests/e2e/pagebreak.spec.js` にて、異なるブラウザ幅（1280px, 900px, 600px）へリサイズした際にも改ページ位置でのアライメントが正確に保たれることを確認するテストケースを追加する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/075-page-break-width-calculation`

1. **`src/js/modules/renderer.js`**:
   - `applyPageBreakSizes()` のループ処理の前に、すべての `.page-break` 要素のインラインスタイル (`width`, `height`, `marginBlockEnd` / `margin-block-end`) をクリアするループを挿入する。
2. **`tests/e2e/pagebreak.spec.js`**:
   - ウィンドウ幅を `[1280, 900, 600]` へ順次切り替え、`resize` イベントをディスパッチした後に、改ページ要素と後続要素の位置が常に正しい差分（カラムギャップ分）を維持していることをアサーションするテストケースを追加。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] すべての `.page-break` 要素の直後にある要素が、異なるブラウザ幅へのリサイズ後にも、カラムギャップに重なることなく、次のカラムの正しい先頭位置から開始すること。
- [x] 設計書 [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) と実装の整合性が保たれていること。
- [x] リサイズパターンを含むすべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
