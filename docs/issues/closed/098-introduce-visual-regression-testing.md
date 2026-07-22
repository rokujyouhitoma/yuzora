---
ID: 098
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] Visual Regression Testing (VRT) の導入 (ID: 098)

## 1. 概要 / Summary
フォントの種類、文字サイズ、カラムパディング設定、カラーテーマの切り替えに伴う「描画領域での文字の重なりや見切れ」などの視覚的な不具合（レイアウトデグレーション）を画像比較によって自動検出する Visual Regression Testing (VRT) スイートを Playwright を使用して導入します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.1 視覚的レイアウト品質保証
- 関連バックログ: [073-introduce-visual-regression-testing.md](../backlogs/073-introduce-visual-regression-testing.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [playwright.config.js](../../playwright.config.js)
- [ ] [package.json](../../package.json)
- [ ] `tests/e2e/vrt.spec.js`

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/098-introduce-visual-regression-testing`

1. **VRT 実行環境の設定 (playwright.config.js, package.json)**:
   - `playwright.config.js` 内で `toHaveScreenshot` の閾値設定 (`maxDiffPixelRatio: 0.05`, `threshold: 0.2`) を調整。
   - `package.json` に `test:vrt` スクリプトを追加 (`playwright test tests/e2e/vrt.spec.js`)。
2. **VRT テストケースの実装 (tests/e2e/vrt.spec.js)**:
   - ウェルカム画面のビジュアルスナップショット比較。
   - 読書ビューアー画面（デフォルトテーマ、セピアテーマ、ダークテーマ）のビジュアルスナップショット比較。
   - `expect(page).toHaveScreenshot()` による動的キャプチャ比較。
3. **設計ドキュメントの同期 ([DSN-01](../docs/DSN-01-high_level_design.md), [DSN-02](../docs/DSN-02-low_level_design.md))**:
   - VRT スイートの構成およびテスト自動化仕様を明記。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `npm run test:vrt` コマンドで VRT テストが正常に実行・完了すること。
- [ ] ウェルカム画面およびテーマ切り替え後の読書画面でスナップショットの視覚的検証が行われること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
- [ ] [DSN-01](../docs/DSN-01-high_level_design.md) / [DSN-02](../docs/DSN-02-low_level_design.md) に VRT 仕様が反映されていること。
