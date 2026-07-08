---
ID: 049
種別: Refactor
優先度: Low
ステータス: Draft
---

# [REFACT] CSSリセット（初期化CSS）の導入検討 (ID: 049)

## 1. 概要 / Summary
現在、ブラウザ標準のCSSリセット設定（Normalize.css や Modern Reset など）が明示的に定義されておらず、各ブラウザのユーザーエージェントスタイルシート（UA Style）に依存する部分が残っています。これにより、ブラウザ（Chrome, Safari, Firefox等）によって要素のデフォルトのマージンやパディング、ボックスサイジング（`box-sizing`）が微小に異なり、縦書きマルチカラムのスクロール座標や文字見切れ判定に悪影響を与えるリスクがあります。

本対応では：
1. アプリケーションに標準的なリセットCSS（Modern CSS Reset や Normalize.css など）を導入するか、独自のミニマルなCSSリセット定義を `src/css/modules/reset.css`（または既存の `base.css`）に組み込みます。
2. ボックスモデルを `box-sizing: border-box;` に統一し、パディングや枠線がカラム幅計算に予期しない影響を与えないように共通ルールを定め、表示の互換性を強化します。
