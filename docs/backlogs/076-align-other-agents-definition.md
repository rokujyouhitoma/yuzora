---
ID: 076
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] 他のエージェント定義ファイルのブラッシュアップ (ID: 076)

## 1. 概要 / Summary
情報セキュリティスペシャリスト（SC）エージェントの定義ファイル (`.agents/agents/information-security-specialist.agent.md`) で構築した詳細な構造（法令・IPAの定義に基づく業務、対象者像、期待する技術水準、利用可能なスキル、行動規範、応答プロトコルなど）を参考に、`.agents/agents/` 配下の他のエージェント定義ファイルを全面的に見直し、構造をブラッシュアップする。

### 対象エージェント:
- データベーススペシャリスト (`database-specialist.agent.md`)
- エンベデッドシステムスペシャリスト (`embedded-systems-specialist.agent.md`)
- ITサービスマネージャ (`information-technology-service-manager.agent.md`)
- ITストラテジスト (`information-technology-strategist.agent.md`)
- ネットワークスペシャリスト (`network-specialist.agent.md`)
- プロジェクトマネージャ (`project-manager.agent.md`)
- ソフトウェア品質保証スペシャリスト (`software-quality-assurance-specialist.agent.md`)
- システムアーキテクト (`systems-architect.agent.md`)
- システム監査技術者 (`systems-auditor.agent.md`)

### 改善ポイント:
1. **IPA定義に基づく役割と業務の明文化**: 各試験区分に準拠した対象者像、業務と役割、および期待する技術水準を整理・拡充する。
2. **利用可能なスキルの定義**: プロジェクトで利用可能な既存スキル（`adr-workflow`, `git-workflow`, `review-diff-code`, `create-issue` 等）との紐付けと委譲ポリシーを定義する。
3. **行動規範と応答プロトコルの策定**: エージェントがそれぞれの専門性を活かした視点で分析・評価・助言ができるよう、行動指針や応答プロトコルを実装する。
