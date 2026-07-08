---
ID: 048
種別: Feature
優先度: High
ステータス: Draft
---

# [FEAT] 自己修復レイアウトエンジン（動的改ページ自動挿入）の実装 (ID: 048)

## 1. 概要 / Summary
バウンディングボックスの制限やブラウザのフォントレンダリング端数誤差により、縦書きテキスト行が物理的にページの境界線上（カラムとギャップ of 境目）に乗り上げ、文字が見切れてしまう（半分にスライスされる）問題が発生します。

本対応では：
1. `VerticalRenderer` (`src/js/modules/renderer.js`) に `adjustPageBreaksForOverrun()` を実装し、見切れ交差が検出された要素の直前に動的な改ページ要素 `<div class="page-break dynamic-page-break"></div>` を自動で挿入する自己修復レイアウトエンジンを構築します。
2. 挿入後にレイアウト座標がリフローで変化するため、すべて見切れが解消されるかループ上限（最大30パス）に達するまで処理を繰り返すマルチパス自動補正ループを実装します。
3. 本ロード時、設定変更時、ウィンドウリサイズ時のレイアウト確定ライフサイクルイベントに本自己修復処理を結合し、見切れ不具合を全自動で回避します。

## 2. 依存関係 / Dependencies
- [047-strict-boundary-diagnostics-and-e2e-loop.md](047-strict-boundary-diagnostics-and-e2e-loop.md) (ID: 047) の厳密な見切れ文字検出エンジンが正常に機能していることが前提となります。
