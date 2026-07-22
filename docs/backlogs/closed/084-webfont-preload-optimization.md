---
ID: 084
種別: Enhancement
優先度: Low
ステータス: Closed
---

# [ENH] Webフォントおよび主要アセットのpreloadとfont-display最適化 (ID: 084)

## 1. 概要 / Summary
アプリケーション起動時の表示パフォーマンス（CLS/FCP）を改善するため、外部取得フォントや必須スタイルシートのロードを `<link rel="preload">` / `<link rel="preconnect">` ディレクティブによって最優先化します。また、CSSでの `font-display: swap` の適用を徹底し、読み込み完了までの日本語テキスト表示の見切れ（FOIT）を最小化します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [index.html](../../index.html)
- [compiled.html](../../compiled.html)
- [base.css](../../src/css/modules/base.css)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- `index.html` に Google Fonts への `<link rel="preconnect">` および `<link rel="preload">` ディレクティブを追加。
- フォント読み込み設定に `display=swap` を適用。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] Preconnect / Preload タグが正常に挿入され、Fonts が `font-display: swap` で非非同期ブロックロードされること。
