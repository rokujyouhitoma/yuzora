---
ID: 091
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] 情報処理技術者試験区分に基づく全10エージェント定義 (DB, ES, SC, ST, SM, NW, PM, QA, SA, UA) の洗練・標準化とスキル連携強化 (ID: 091)

## 1. 概要 / Summary
`.agents/agents/` ディレクトリ配下に定義されている全10種のエージェント（DB, ES, SC, ST, SM, NW, PM, QA, SA, UA）のドキュメント構造、H1/H2/H3見出し階層、IPA試験区分定義の正確性、行動規範、機能別プロトコル、およびワークスペーススキル（`threat-modeling`, `phase-workflow`, `adr-workflow`, `git-workflow`, `run-security-scanner` 等）との委譲先連携を一括で見直し、標準化フォーマットに準拠して洗練します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [.agents/agents/database-specialist.agent.md](../../.agents/agents/database-specialist.agent.md)
- [.agents/agents/embedded-systems-specialist.agent.md](../../.agents/agents/embedded-systems-specialist.agent.md)
- [.agents/agents/information-security-specialist.agent.md](../../.agents/agents/information-security-specialist.agent.md)
- [.agents/agents/information-technology-service-manager.agent.md](../../.agents/agents/information-technology-service-manager.agent.md)
- [.agents/agents/information-technology-strategist.agent.md](../../.agents/agents/information-technology-strategist.agent.md)
- [.agents/agents/network-specialist.agent.md](../../.agents/agents/network-specialist.agent.md)
- [.agents/agents/project-manager.agent.md](../../.agents/agents/project-manager.agent.md)
- [.agents/agents/software-quality-assurance-specialist.agent.md](../../.agents/agents/software-quality-assurance-specialist.agent.md)
- [.agents/agents/systems-architect.agent.md](../../.agents/agents/systems-architect.agent.md)
- [.agents/agents/systems-auditor.agent.md](../../.agents/agents/systems-auditor.agent.md)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- 重複する H1 (`#`) タグを修正し、トップタイトルのみ H1 とした正規の見出し階層（H1 → H2 → H3）を全ての agent.md に導入する。
- スキル委譲先テーブルを拡大し、各エージェントの専門領域に適合するワークスペーススキル（`phase-workflow`, `threat-modeling`, `adr-workflow`, `create-issue`, `review-diff-code` 等）を明記する。
- コロン後のスペース不足や「機能A/B/C/D/E」の見出しレベル不整合を解消し、統一感のあるレスポンス構造を規定する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] 全10エージェントファイルの見出し階層および構成が統一され、不整合がないこと。
- [ ] `npm run test:traceability` 等のドキュメント検証スクリプトを通過すること。
