---
ID: 008
種別: Bug
優先度: Medium
ステータス: Open (New)
---

# [BUG/SEC] 目次ジャンプ先がRTL縦書き時に微小にズレる問題 (ID: 008)

## 1. 概要 / Summary
目次（TOC）から見出し項目（例：「毒茸」「一」など）をクリックしてスムーズスクロールジャンプを行った際、RTL縦書き表示（`writing-mode: vertical-rl`）において、スクロールの目標位置（`pageIndex`）が本来の見出しがある位置からわずかにずれる（前後のページまたは数カラム分ズレる）不具合が発生しています。

### 再現手順 / Steps to Reproduce
1. `52396_yoko.txt`（宮本武蔵 02 地の巻）などをロードし、RTL（右から左・縦書き）表示にする。
2. 目次ドロワーを開き、「毒茸」または「一」をクリックする。
3. ジャンプ先のページを確認すると、該当の見出し項目がページ内に現れず、その後の段落（または別のページ）が表示され、位置が数カラム分ずれている。

### 再現環境 / Environment
- Browser / OS: Chrome/Firefox (Linux)
- Book / File: `52396_yoko.txt` (宮本武蔵 02 地の巻) などの縦書きRTL表示

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [src/js/app.js](../../src/js/app.js) (の `jumpToHeading` および `buildTOCList` 内のページインデックス計算ロジック)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
- `getBoundingClientRect()` から算出した絶対座標 `absolutePosition` は、RTL と LTR の送り方向の違い（RTL では右端から、LTR では左端から流れる）を考慮するよう刷新されましたが、CSS Multi-column におけるカラム間の隙間（`column-gap = 80px` など）や、1ページ（見開き）を構成するカラム数・アライメントの計算が単純な `clientWidth` 分割となっており、余白分の微小なズレが蓄積して別のページ（カラム）へとずれている可能性があります。
- また、要素が非表示（`display: none` 等）から目次描画のために表示される際、または初期ロード時の初期化のタイミング等によって、要素の `getBoundingClientRect().right` が期待通りに計算されないことが想定されます。

---

## 4. 暫定対処と恒真対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: 
  - なし。手動でのスクロールによる位置合わせ。
* **恒久対策 (Permanent Fix)**: 
  - `column-gap`（カラム余白）を加味した実質的なカラム送り量でのページインデックス算出。
  - スムーズスクロール移動量の精密なアライメント計算の導入。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/008-toc-jump-misalignment`

1. `app.js` の `jumpToHeading` における `viewportWidth` 基準의 計算を、マルチカラムのギャップ幅（`column-gap`）を考慮したものへ変更、またはスクロール境界値のしきい値判定を改善する。
2. ズレが発生しないようにアライメント補正を加える。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] RTL縦書き表示において、「毒茸」「一」などの見出し項目クリック時、ズレることなくその見出しが属するページへ正確にジャンプすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
