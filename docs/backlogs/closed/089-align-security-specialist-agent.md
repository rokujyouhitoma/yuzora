---
ID: 089
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] セキュリティスペシャリスト (Information Security Specialist / SC) エージェント定義の洗練と体系化 (ID: 089)

## 1. 概要 / Summary
IPA「情報処理安全確保支援士（SC）」試験区分の定義およびワークスペースにおける各種セキュリティスキル（STRIDE、スキャン、PoC検証、監査レポート等）との連携に基づき、`.agents/agents/information-security-specialist.agent.md` の役割定義、行動規範、委譲スキル、および応答プロトコルを最新の標準フォーマットに準拠して洗練・体系化します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [.agents/agents/information-security-specialist.agent.md](../../.agents/agents/information-security-specialist.agent.md)
- [AGENTS.md](../../AGENTS.md)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- ドキュメントの見出し階層（H1/H2/H3）を標準化し、一貫したマークダウン構造を確立する。
- 委譲先スキルテーブルを拡張し、脅威モデリング（`threat-modeling`, `determine-threat-model`）、セキュリティスキャン（`run-security-scanner`, `scan_dependencies`）、実装計画・PoC（`create-security-implementation-plan`, `run-poc`）、監査レポート（`generate-security-audit-report`）、および Web セキュア開発ルール（`mandatory-secure-web-skills`）との連携関係を明文化する。
- 行動規範および機能別応答プロトコル（機能 A〜E）に最新の技術標準（STRIDE, CWE, CVSS, EPSS, CRYPTREC, OWASP, NIST SP800）および組織的対策（CSIRT, フォレンジック, BCP）を反映する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] `.agents/agents/information-security-specialist.agent.md` のマークダウン見出し階層が整合し、不整合がないこと。
- [ ] セキュリティスキルの委譲テーブルおよび機能別プロトコル（A〜E）が網羅的に定義されていること。
- [ ] `npm run test:traceability` 等のドキュメント検証スクリプトを通過すること。
