---
ID: 062
種別: Bug
優先度: High
ステータス: Open (In Progress)
---

# [BUG] E2Eテスト「Verify layout boundaries have zero overruns」が CI で失敗する (ID: 062)

## 1. 概要 / Summary

CI (`tests/e2e/diagnose.spec.js:43`) の E2E テスト「Verify layout boundaries have zero overruns」が、以下の理由で毎回失敗する。

テスト実行時に「こころ」を読み込んだ 1 ページ目で、**段落 20「私が先生と知り合いになったのは...」** が左ページ境界（X: -320.0px）を **12.7px** 超過している。
自己修復レイアウトエンジン（`adjustPageBreaksForOverrun`）は 1 パス実行されたものの改ページを **0 件**挿入して収束済みと判定しており、はみ出しが修正されていない。

診断レポートの検出サマリー：
- 左境界またぎ: **1件**
- 右境界またぎ: 0件
- 上下はみ出し: 0件

はみ出し文字：`「はずであった。それで**[彼]**はとうとう帰る事にな」`（viewport基準 left: -4.0px, right: 15.0px、はみ出し量: **4.0px**）

### 再現手順 / Steps to Reproduce
1. `npm run test:e2e` を実行する（またはCI上でテストを実行）。
2. 「こころ」を読み込んで 1 ページ目を表示する（テーマ: sepia、書体: ゴシック、RTL、文字サイズ: size-md、行間: line-height-normal、文字間: spacing-normal）。
3. レイアウト診断を実行する。
4. 段落 20 が左境界を超過しているにも関わらず自己修復エンジンが改ページを挿入しないことを確認する。

### 再現環境 / Environment
- Browser / OS: Chromium（GitHub Actions Linux Runner）/ 1280×720px ビューポート
- Book / File: こころ（Shift_JIS .txt）
- CI ログ: `tests/e2e/diagnose.spec.js:43:1 › Verify layout boundaries have zero overruns`
- 再現回数: Retry #1, #2 を含む計 3 回全て同じ結果

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [tests/e2e/diagnose.spec.js](../../tests/e2e/diagnose.spec.js) — 失敗しているテストファイル
- [ ] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) — `adjustPageBreaksForOverrun` 実装
- [ ] [src/js/modules/diagnostics.js](../../src/js/modules/diagnostics.js) — 境界線はみ出し検出ロジック (`findCharAtBoundary`, `runLayoutDiagnosis`)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

**確定根本原因: `runOverrunCheckPass` の境界座標計算が第 1 ページの左端（X=0）を対象外としている**

`renderer.js` の `runOverrunCheckPass` はページ境界を以下で計算している：

```js
for (let k = 1; k < pageCount; k++) {
    const boundaryX = k * clientWidth;  // k=1 のとき 1280px, k=2 のとき 2560px ...
}
```

このループは `k=1` 始まりのため、チェック対象の境界は `clientWidth`（=1280px）, `2*clientWidth`（=2560px）... のみとなる。
**第 1 ページと第 2 ページの境界である `X = 0px`（= ビューポートの左端）は一切チェックされない。**

一方、`diagnostics.js` の `diagnoseBoundaryOverlap` は `viewportRect.left`（= 0px 付近）を `boundaryLeft` として使用し、そこをまたぐ段落20を検出している。

つまり「診断ロジック」と「修復ロジック」が異なる境界座標系を使っており、診断でははみ出しを検出するが修復は対処しないという不整合が発生している。

これは **RTL 縦書きのマルチカラムレイアウト特有の問題**であり、RTL では scrollLeft が負の値になるため、1ページ目の左端がビューポート外（document座標系のX=0より左）になりうる。`runOverrunCheckPass` は RTL の負の scrollLeft を考慮していない可能性もある。

**影響範囲の確認：**
- `renderer.js` `runOverrunCheckPass` L258-269：ページ境界ループが `k=1` 開始のため第1ページ左端が未対象
- `renderer.js` `checkAndRepairParagraphOverrun` L284：`absScroll = Math.abs(readerViewport.scrollLeft)` で RTL の負値を補正しているが、第1ページ（scrollLeft=0）ではこれが有効に機能しない

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし（CI の品質ゲートが通らない状態）
* **恒久対策 (Permanent Fix)**: `renderer.js` の `adjustPageBreaksForOverrun` を修正し、はみ出しが残っている段落に対して確実に改ページを挿入するよう修正する。または診断ロジック側で誤検出が起きているのであれば `diagnostics.js` の境界判定を見直す。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/062-e2e-layout-overrun-ci-failure`

### 方針: `runOverrunCheckPass` に第 0 ページ境界（X=0）チェックを追加する

現在のループ `for (let k = 1; k < pageCount; k++)` に加え、**第 1 ページの左端境界（X = 0, または RTL 時の相対境界）** をチェック対象として追加する。

ただし「第1ページ左端のはみ出し」は改ページを前に挿入することができない（先頭段落より前にページブレークは不要）。そのため修復ではなく**検出から除外（false positive を排除）**するアプローチが適切である可能性がある。

**2つのアプローチを検討し最適なものを選択する：**

#### アプローチ A（推奨）: 診断ロジック側で第1ページ左端の境界またぎを除外する
`diagnoseBoundaryOverlap` において、現在ページが 1 かつ `boundaryLeft = viewportRect.left` への交差検出時に、段落の右端がビューポート内に収まっている（= 次のページに流れていない）場合は false positive として除外する。

具体的には `diagnostics.js` の `intersectsLeft` 判定に以下の条件を追加する：
```js
// 1ページ目かつ scrollLeft が 0 の場合、左境界またぎは RTL マルチカラム折り返しによる正常な挙動
const isFirstPageLeftEdge = currentPage === 1 && Math.abs(viewContext.readerViewport.scrollLeft) < 1;
const intersectsLeft = rect.left < boundaryLeft && rect.right > boundaryLeft && !isFirstPageLeftEdge;
```

#### アプローチ B: 修復エンジン側で第1ページの境界（X=0）もチェック対象にする
`renderer.js` の `runOverrunCheckPass` に `k=0` ケースを追加し、第1ページ左端境界 `boundaryX = 0` を改ページ対象として扱う。ただしこの場合、先頭段落の前への改ページ挿入は意味がないため `checkAndRepairParagraphOverrun` 内で先頭段落を除外する処理が必要になる。

**実装ステップ（アプローチ A を採用する場合）：**

1. `src/js/modules/diagnostics.js` の `diagnoseBoundaryOverlap` 関数（L197〜289）を修正する。
   - `intersectsLeft` の判定ロジックに `isFirstPageLeftEdge` ガード条件を追加する（L250付近）。
   - `currentPage` は既に引数として受け取られているため追加の変数取得は不要。
2. `npm run test:e2e` を実行してテストがパスすることを確認する。
3. `npm run test:unit` を実行してユニットテストに退行がないことを確認する。
4. DSN-02 セクション 1.2.12 の「レイアウト自己修復設計」に、第1ページ左端境界の診断除外ルールを追記する。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/diagnose.spec.js:43:1 › Verify layout boundaries have zero overruns` が `境界線上の見切れやはみ出しは検出されませんでした。` を含むレポートを返してパスすること。
- [ ] Retry なしで 1 回目のテスト実行で通過すること（再現性の解消）。
- [ ] すべての E2E テスト (`npm run test:e2e`) が正常にパスすること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] DSN-02 の「レイアウト自己修復設計」セクションが実装内容と整合していること（dead document がないこと）。
- [ ] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に整合していること。
