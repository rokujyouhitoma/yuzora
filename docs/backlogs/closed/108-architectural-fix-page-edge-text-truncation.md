---
ID: 108
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] `宮本武蔵 02 地の巻` 等における CSS Multi-column アーキテクチャ再設計によるページ左右端文字切れの根本解決 (ID: 108)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（`宮本武蔵 02 地の巻` 等、311KB超）の読書時にページの左端および右端のテキストが縦方向・横方向に半分切断され、文字の可読性が著しく害される極めて重篤な UX 課題をアーキテクチャレベルで根本再設計し解決しました。

従来の `vw` (Viewport Width) 単位依存によるスクロールバー幅オフセット計算誤差を廃止し、容器 (`#reader-viewport`) の `100%` 幅に基づく厳密な Column Width レスポンシブ算定、並びに非破壊的な動的改ページ管理を全メディアクエリで徹底導入しました。

---

## 2. アーキテクチャレベルでの構造的課題分析と SA 比較検討 (SA Architectural Analysis)

### 2.1 課題の構造的根本原因 (Architectural Root Cause)
1. **`vw` (Window Inner Width) 単位によるスクロールバー幅計算誤差**:
   CSS (`reader.css`, `style.css`) 内で `column-width: calc(50vw - ...)` と指定されていたため、ブラウザのウィンドウ幅 (`100vw`、スクロールバー含む) を基準にカラム幅が決定されていました。その結果、実表示領域 (`clientWidth`) がスクロールバー分（15px〜17px）狭い場合、2 カラム＋ギャップの合計幅がページ幅を超過し、毎ページ端で文字が 17px 分縦・横に切断されていました。
2. **多カラム自然流し込み時のピクセル端数ズレ**:
   パーセンテージ非依存の固定 `vw` 単位により、ウィンドウリサイズ時やサイドパネル開閉時に `clientWidth` と `step = columnWidth + columnGap` の比率が整数倍にならず、改ページなしの段落で文字の中央にページ境界が重なっていました。

### 2.2 SA 複数ソリューションの比較評価 (Multi-SA Solutions)
- **案 A (SA-1提案: `%` 容器相対 Column Width 再定義)**:
  - デスクトップ (`min-width: 768px`): `column-width: calc(50% - var(--reader-viewport-padding-x) * 2)`
  - モバイル (`max-width: 767px`): `column-width: calc(100% - var(--reader-viewport-padding-x) * 2)`
  `%` 単位を容器 (`.reader-content` / `#reader-viewport`) にバインドすることで、スクロールバーの有無やウィンドウサイズに関わらず `2 * step === clientWidth` が数学的に 100% 保証される。
- **案 B (SA-2提案: JS レンダラー幾何パラメータ非破壊自動同期)**:
  `resolveLayoutParameters()` および `applyPageBreakSizes()` において、`clientWidth` に基づく精密なピクセル幾何計算を維持し、アクティブウィンドウ内の非破壊改ページ配置を行う。
- **案 C (SA-3提案: QA 多彩ビューポート境界アサーションテスト)**:
  スクロールバーあり (`clientWidth = 983px`)、標準 (`clientWidth = 800px`)、モバイル (`clientWidth = 390px`) の各種幅で境界オーバーラップが 0 件であることをテストコードで検証。
- **統合アーキテクチャ判定 (Unified Architecture Decision)**:
  案 A・案 B・案 C をすべて適用し、CSS の単位レベルおよび JS の幾何計算レベルの双方で文字切断の原因を根本から絶つ。

---

## 3. PM & SA レビュー記録 (3-Pass Review & Polish)

### Pass 1: PM & SA 根本設計見直し
- **SA分析**: Windows / Linux 環境等でスクロールバーが表示される際、`50vw` 計算値が `clientWidth` より約 17px 大きくなり、2 ページ目冒頭の 1 列目が左右端で切断される現象を完全に再現・同定。
- **PM判断**: 単位系の刷新（`vw` から `%` への移行）を伴う設計レベルの改善を承認。

### Pass 2: SA アーキテクチャ整合性と QA 計測
- **SA設計**: `src/css/modules/reader.css` および `src/css/style.css` のメディアクエリを一括改修。`renderer.js` との相互作用を完全確認。
- **QA計測**: 単体テストスイート `renderer.test.js` にて多層ビューポートでの境界切断検証を実施。

### Pass 3: DoD 完了承認
- **PM & SA結論**: 全系 `npm run healthcheck` が 100% PASS し、全ビューポートで文字切れが 0 件であることを確認し `Closed` に完了承認。

---

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] `column-width` の算定単位が `vw` から `%` 容器相対単位へ刷新され、スクロールバー存在時であってもページ左右端の文字切れが 0 件であること。
- [x] `src/css/modules/reader.css` と `src/css/style.css` の双方でメディアクエリ計算式が統一されること。
- [x] `npm run healthcheck` が全件 PASS すること。
