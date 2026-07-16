---
ID: 075
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] page-breakの幅計算誤りの修正 (ID: 075)

## 1. 概要 / Summary
マルチカラム縦書きレイアウトにおいて、改ページ要素（`.page-break`）の横幅が計算されているものの、カラムギャップ（`column-gap`）分が考慮されていないため、改ページ直後の段落がカラムギャップ領域（非表示領域またははみ出し領域）に配置されてしまい、結果として改ページ直後の最初の1行が非表示になったり切れてしまったりする不具合を修正します。

### 再現手順 / Steps to Reproduce
1. `[＃改ページ]` が含まれる書籍データを読み込む。
2. 開発者ツールで生成された `.page-break` 要素の直後の要素の座標を確認する。
3. ページの先頭行が非表示（ビューポート左端の padding 領域外に配置されてクリッピングされる）になっていることを確認する。

### 再現環境 / Environment
- Browser / OS: Chromium based browsers (Chrome, Edge etc.) / Linux
- Book / File: 任意の `[＃改ページ]` を含むファイル（こころ等）

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [renderer.js](file:///workspace/yuzora/src/js/modules/renderer.js)
- [x] [DSN-02-low_level_design.md](file:///workspace/yuzora/docs/DSN-02-low_level_design.md)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. 縦書きマルチカラムにおける改ページ制御において、`.page-break` 要素の `width` は直前の要素の左端から現在のカラムの左境界（`boundaryLeft`）までの距離（`remainingWidth`）として計算されていた。
2. しかし、マルチカラムレイアウトにはカラム間に `column-gap`（隙間）が存在する。
3. `.page-break` の幅を `remainingWidth`（カラム境界まで）に設定するだけでは、後続の要素の開始位置がちょうどそのカラム境界（＝カラムギャップの開始位置）になってしまう。
4. このため、後続要素の最初の行がカラムギャップの空間にレンダリングされてしまい、ビューポートのクリッピングによって非表示または見切れが発生していた。
5. 対策として、`.page-break` 要素に対して `margin-block-end`（進行方向の末尾マージン。縦書きRTLでは `margin-left`、LTRでは `margin-right` に相当）として `column-gap` の値を適用することで、後続要素の開始位置をカラムギャップの先頭から次のカラムの開始位置（`step` 先）へ安全に押し出す必要がある。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  1. `resolveLayoutParameters()` の返り値に `columnGap` を追加。
  2. `applyPageBreakSizes()` 内で、`.page-break` 要素に対して `style.width = remainingWidth` としつつ、`style.marginBlockEnd = columnGap` を動的に設定する。
  3. `docs/DSN-02-low_level_design.md` の記述を最新の設計（`margin-block-end` の適用）に合わせて更新する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/075-page-break-width-calculation`

1. **`src/js/modules/renderer.js`**:
   - `resolveLayoutParameters` にて、`computedStyle.columnGap` を解析し、NaN の場合は `0` としてオブジェクトに含める。
   - `applyPageBreakSizes` 内で、各 `.page-break` 要素に対し、`child.style.marginBlockEnd = `${params.columnGap}px`` を設定する。
2. **`docs/DSN-02-low_level_design.md`**:
   - セクション `5.8` の改ページ要素の動作説明に、`margin-block-end` によってカラムギャップをスキップする仕組みを追記する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] すべての `.page-break` 要素の直後にある要素が、カラムギャップに重なることなく、次のカラムの正しい先頭位置から開始すること。
- [x] 設計書 [DSN-02-low_level_design.md](file:///workspace/yuzora/docs/DSN-02-low_level_design.md) と実装の整合性が保たれていること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
