---
ID: 096
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] 運用ヘルスチェックコマンド (npm run healthcheck) の新設 (ID: 096)

## 1. 概要 / Summary
ITサービスマネージャ（SM）の観点から、プロダクトのリリース前やデプロイ前に `make`, 単体テスト, トレーサビリティ, 型チェック, リンターを一括実行して完全な健全性を短時間で診断する `npm run healthcheck` スクリプトを新設します。
