---
ID: 107
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] `宮本武蔵 02 地の巻` 等におけるページ左右端の文字切れ（半分切断）の根本修正と精密レイアウト計測 (ID: 107)

## 1. 概要 / Summary
「ゆうぞら (Yuzora)」において、大容量書籍（`宮本武蔵 02 地の巻` 等、311KB超）の読書中にページの左端および右端のテキストが縦方向・横方向に半分切断され、文字の可読性が著しく害される極めて重篤な UX 課題を根本解決しました。

多角的な SA アーキテクチャ検討および QA レイアウト境界計測に基づき、ページの端数計算バッファ（5px オフセット歪み）の削除、ウィンドウ型修復時における既存改ページ要素 (`.dynamic-page-break`) の非破壊維持、および高精度カラムグリッドアライメント（Column Grid Alignment）を導入しました。

---

## 2. 課題特定と複数 SA アプローチの比較検証 (SA Multi-Perspective Analysis)

### 2.1 課題の根幹原因 (Root Cause Analysis)
1. **改ページ幅計算における 5px 端数バッファの歪み**:
   `applyPageBreakSizes()` 内で `const buffer = 5;` として `relativeLeft` から 5px を控除していたため、改ページ要素 (`.page-break`) の必要幅が 5px 狂い、後続カラムの開始位置がページ境界（例：800px, 1600px）から 5px ズレて文字の中央に境界が重なる。
2. **ウィンドウ型修復時のグローバル改ページ消去による破壊**:
   `adjustPageBreaksForOverrun()` の冒頭で `querySelectorAll('.dynamic-page-break').forEach(el => el.remove())` が全ドキュメントの改ページ要素を無条件削除していたため、ウィンドウ外（過去ページ・未来ページ）の改ページが失われ、スクロール移動時に未修復ページのテキストがページ境界で半分に切断される。
3. **CSS カラムギャップと JS スナップ幅の不一致**:
   ビューポート領域のパディング（`--reader-viewport-padding-x`）と CSS カラムギャップが、JS 側のページスナップ計算 (`clientWidth`) とミリメートル単位でズレた場合、改ページ無しの段落でカラム境界オーバーラップが発生する。

### 2.2 SA 複数アプローチの検討と統合決定 (Multiple Solution Options)
- **案 A (SA-1提案: 精密ピクセル計算)**: `applyPageBreakSizes()` の 5px バッファを削除し、実境界座標から厳密な残り幅 (`remainingWidth`) を幾何計算する。
- **案 B (SA-2提案: 範囲限定非破壊スキャン)**: `adjustPageBreaksForOverrun()` での改ページ削除を、修復対象のウィンドウ（`[minX, maxX]`）内のみに限定し、他ページの計算済み改ページを保持する。
- **案 C (SA-3提案: QA境界自動判定テスト)**: `renderer.test.js` に文字切断の有無を判定する Range/Rect 境界オーバーラップテストを導入し、CI 上で 100% 自動検証する。
- **統合決定 (Unified Architecture)**: 案 A・案 B・案 C をすべて統合適用し、幾何計算の正確性・非破壊性・テスト検証の三位一体で完全修正を達成する。

---

## 3. レビュー記録 (PM & SA 3-Pass Review & Polish)

### PM & SA パス 1 レビュー (Pass 1: Root Cause & Option Evaluation)
- **SA分析**: `52396_yoko.txt` (311KB) での再現試験により、5px バッファが原因で `page-break` の幅が 795px と計算され、2 ページ目冒頭の 1 文字目が `795px`〜`810px` に跨がり文字が左右に切断されることを確認。
- **PM判断**: ユーザビリティ上最優先で修正すべき致命的バグと認定。

### PM & SA パス 2 レビュー (Pass 2: Architecture & QA Metrics)
- **SA設計**: `applyPageBreakSizes()` の厳密化と `minX`/`maxX` ウィンドウ内のみの非破壊改ページ置換ロジックを策定。
- **QA計測指針**: ページの左端（`docLeft === scrollBoundary`）および右端での文字 Range 矩形境界オーバーラップをテストコードで自動検証する仕組みを確立。

### PM & SA パス 3 レビュー (Pass 3: Quality Assurance & DoD Approval)
- **PM & SA結論**: `npm run healthcheck` における全単体テスト・E2E・ビルド整合性が維持され、`宮本武蔵 02 地の巻` 全ページで文字切れが 0 件であることを確認し、`Closed` に完了承認。

---

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] `宮本武蔵 02 地の巻` (311KB) をスクロール読書した際、全ページでページの左端および右端の文字が半分に切断されないこと。
- [x] `applyPageBreakSizes()` における 5px 端数バッファ歪みが解消され、改ページ幅が正確に計算されること。
- [x] ウィンドウ型修復時において、他ページの計算済み `.dynamic-page-break` が破壊されないこと。
- [x] 文字境界切断を検証する QA 自動テストスイートが追加され、`npm run test:unit` が全件 PASS すること。
