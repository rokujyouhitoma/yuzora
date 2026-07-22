---
ID: 105
種別: Enhancement
優先度: Low
ステータス: Closed
---

# [FEAT/ENH] Webフォントおよび主要アセットのpreloadとfont-display最適化 (ID: 105)

## 1. 概要 / Summary
アプリケーション起動時の FCP (First Contentful Paint) を改善するため、フォントリソースの preconnect / preload 最適化と `font-display: swap` の適用を行います。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.7 WebFont アセット最適化
- 関連バックログ: [084-webfont-preload-optimization.md](../backlogs/084-webfont-preload-optimization.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [index.html](../../index.html)
- [ ] [compiled.html](../../compiled.html)
- [ ] [base.css](../../src/css/modules/base.css)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enh/105-webfont-preload-optimization`

1. **Preconnect / Preload タグの追加 (`index.html`)**:
   - Google Fonts CDN への `<link rel="preconnect">` および `<link rel="preload">` ディレクティブを追加。
2. **`font-display: swap` の適用 (`base.css`)**:
   - フォントリンク URL に `&display=swap` パラメータが正しく適用されているか確認・維持。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `index.html` に preconnect / preload タグが組み込まれていること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
