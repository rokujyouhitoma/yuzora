---
ID: 110
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] セキュリティスペシャリスト (Information Security Specialist / SC) エージェント定義の洗練と体系化 (ID: 110)

## 1. 概要 / Summary
IPA「情報処理安全確保支援士（SC）」試験区分の定義およびワークスペースにおける各種セキュリティスキル（STRIDE、スキャン、PoC検証、監査レポート等）との連携に基づき、`.agents/agents/information-security-specialist.agent.md` の役割定義、行動規範、委譲スキル、および応答プロトコルを最新の標準フォーマットに準拠して洗練・体系化しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 4.3 エージェント定義・セキュリティガバナンス
- 関連バックログ: [089-align-security-specialist-agent.md](../backlogs/closed/089-align-security-specialist-agent.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [.agents/agents/information-security-specialist.agent.md](../../.agents/agents/information-security-specialist.agent.md)

---

## 4. 実装内容 / Implementation Details
1. **マークダウン見出し階層 (H1/H2/H3) の標準化**:
   - ドキュメント全体で H1 をタイトルに統一し、`## 機能ごとの応答プロトコル` 配下の見出しレベル (`### 機能 A`〜`### 機能 E`) を統一。
2. **セキュリティスキルの委譲テーブル拡張**:
   - 脅威モデリング（`threat-modeling`, `determine-threat-model`）、セキュリティスキャン（`run-security-scanner`, `scan_dependencies`）、実装計画・PoC（`create-security-implementation-plan`, `run-poc`）、監査レポート（`generate-security-audit-report`）、および Web セキュア開発ルール（`mandatory-secure-web-skills`）との連携関係を一覧表として体系化。
3. **技術規準・組織的対策の反映**:
   - IPA SC 定義に基づく役割、技術水準（STRIDE, CWE, CVSS, EPSS, CRYPTREC, OWASP, NIST）、および組織的対策（CSIRT, フォレンジック, BCP）を明記。

---

## 5. 完了条件 (DoD) & 検証結果 / Success Criteria & Verification
- [x] `.agents/agents/information-security-specialist.agent.md` の見出し階層およびマークダウン構造の正常性確認。
- [x] `npm run test:traceability`（110 件の Issue ドキュメント検証）を通過。
