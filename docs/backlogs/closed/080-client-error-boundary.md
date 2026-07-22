---
ID: 080
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] クライアントサイドでのエラー境界と診断レポート出力 (ID: 080)

## 1. 概要 / Summary
パースエラーやレンダリング時の例外処理が発生した場合に、画面全体がフリーズするのを防ぐ「エラー境界（ErrorBoundary / 安全停止機構）」を導入します。また、予期せぬエラー時に、ユーザー環境のブラウザ情報、エラーログ、および再現のための操作履歴（Command History）をまとめた「診断レポート」をワンクリックでローカルエクスポートできる仕組みを提供し、本番環境での不具合発生時の運用監視と迅速なトラブルシューティングを可能にします。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [diagnostics.js](../../src/js/modules/core/diagnostics.js)
- [yuzora.js](../../src/js/modules/core/yuzora.js)
- [types.d.ts](../../src/js/types.d.ts)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- `ErrorBoundary` クラスを `diagnostics.js` に実装。`window.onerror` および `window.onunhandledrejection` を捕捉して安全停止 UI をトリガー。
- 発生ログ、ユーザーエージェント、アプリバージョンを JSON 診断レポートとしてファイル出力する `exportDiagnosticReport` メソッドを実装。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] `ErrorBoundary` による大域的例外捕捉ロジックが機能すること。
- [ ] 診断レポートのエクスポート機能が実装されていること。
