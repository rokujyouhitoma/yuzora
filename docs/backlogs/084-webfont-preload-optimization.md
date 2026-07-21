---
ID: 084
種別: Enhancement
優先度: Low
ステータス: Draft
---

# [ENH] Webフォントおよび主要アセットのpreloadとfont-display最適化 (ID: 084)

## 1. 概要 / Summary
アプリケーション起動時の表示パフォーマンス（CLS/FCP）を改善するため、外部取得フォント（Noto Serif JP）や必須スタイルシートのロードを `<link rel="preload">` ディレクティブによって最優先化します。また、CSSでの `font-display: swap` の適用やローカルフォントの優先探索（`src: local`）を徹底し、読み込み完了までの日本語テキスト表示の見切れ（FOIT）を最小化します。
