---
ID: 073
種別: Feature
優先度: Medium
ステータス: Approved
---

# [Feature] Introduce Visual Regression Testing (ID: 073)

## 1. 概要 / Summary
フォントの種類、文字サイズ、カラムパディング設定、カラーテーマの切り替えに伴う「描画領域での文字の重なりや見切れ」などの視覚的な不具合（レイアウトデグレーション）を画像比較によって自動検出する Visual Regression Testing (VRT) スイートを Playwright を使用して導入する。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [playwright.config.js](../../playwright.config.js) (E2E・VRT設定)
- `tests/e2e/vrt/` (新規追加する VRT テストケース)
- `tests/e2e/vrt/snapshots/` (期待値となる正解画像スナップショット群)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 Playwright を用いたスクリーンショット比較
- Playwright に標準搭載されている `expect(page).toHaveScreenshot()` 機能を活用し、主要な画面コンテキスト（ウェルカム画面、読書画面など）の期待画像と実行時の差分を比較する。
- OSによるフォントのレンダリング差異を吸収するため、Docker 環境または特定のブラウザエンジン設定で画像比較を行うように制御する。
### 3.2 視覚品質ゲートの設定
- 微小なアンチエイリアスの差分による誤検知を防ぐため、許容閾値（MaxDiffPixelRatio や Threshold）を適切にチューニングする。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] VRT 実行用のコマンド（例：`npm run test:vrt`）が定義され、実行できること。
- [ ] カラーテーマを切り替えた際や、フォント設定を変更した際に、期待されるレンダリング画像と一致するか自動検証されること。
- [ ] レイアウト崩れが発生した場合、テストが失敗して差分画像がレポートされること。
