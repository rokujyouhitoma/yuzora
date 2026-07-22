---
ID: 112
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] 情報処理技術者試験区分に基づく全10エージェント定義 (DB, ES, SC, ST, SM, NW, PM, QA, SA, UA) の洗練・標準化とスキル連携強化 (ID: 112)

## 1. 概要 / Summary
`.agents/agents/` ディレクトリ配下に定義されている全10種のエージェント（DB, ES, SC, ST, SM, NW, PM, QA, SA, UA）のドキュメント構造、H1/H2/H3見出し階層、IPA試験区分定義の正確性、行動規範、機能別プロトコル、およびワークスペーススキルとの委譲先連携を一括で見直し、標準化フォーマットに準拠して洗練しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 4.3 エージェント定義・セキュリティガバナンス
- 関連バックログ: [091-align-all-agents-definition.md](../backlogs/closed/091-align-all-agents-definition.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [.agents/agents/database-specialist.agent.md](../../.agents/agents/database-specialist.agent.md)
- [x] [.agents/agents/embedded-systems-specialist.agent.md](../../.agents/agents/embedded-systems-specialist.agent.md)
- [x] [.agents/agents/information-security-specialist.agent.md](../../.agents/agents/information-security-specialist.agent.md)
- [x] [.agents/agents/information-technology-service-manager.agent.md](../../.agents/agents/information-technology-service-manager.agent.md)
- [x] [.agents/agents/information-technology-strategist.agent.md](../../.agents/agents/information-technology-strategist.agent.md)
- [x] [.agents/agents/network-specialist.agent.md](../../.agents/agents/network-specialist.agent.md)
- [x] [.agents/agents/project-manager.agent.md](../../.agents/agents/project-manager.agent.md)
- [x] [.agents/agents/software-quality-assurance-specialist.agent.md](../../.agents/agents/software-quality-assurance-specialist.agent.md)
- [x] [.agents/agents/systems-architect.agent.md](../../.agents/agents/systems-architect.agent.md)
- [x] [.agents/agents/systems-auditor.agent.md](../../.agents/agents/systems-auditor.agent.md)

---

## 4. 実装内容 / Implementation Details
1. **見出し階層の正規化 (H1/H2/H3)**:
   - 全10エージェントファイルにおいて、トップレベルのみ H1 (`#`) とし、主要セクションを H2 (`##`)、機能プロトコル等を H3 (`###`) に統一。
2. **委譲スキルの体系化**:
   - ワークスペーススキル (`threat-modeling`, `phase-workflow`, `adr-workflow`, `create-issue`, `review-diff-code`, `git-workflow`, `changelog-workflow`, `run-security-scanner` 等) との委譲先関係を明文化。
3. **応答プロトコルおよび初期応答の標準化**:
   - コロン後のスペース不足解消と「機能 A」〜「機能 E」の応答構造を全エージェントで共通フォーマットに標準化。

---

## 5. 完了条件 (DoD) & 検証結果 / Success Criteria & Verification
- [x] 全10エージェントファイルの見出し階層が整合していること。
- [x] `npm run test:traceability`（113 件の Issue ドキュメント検証）を通過。
