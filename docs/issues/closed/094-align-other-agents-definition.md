---
ID: 094
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 他のエージェント定義ファイルのブラッシュアップ (ID: 094)

## 1. 概要 / Summary
バックログ ID: 076 に基づき、情報セキュリティスペシャリスト（SC）での詳細構造（IPA定義に整合した対象者像、業務と役割、技術水準、利用可能スキル、行動規範、応答プロトコル等）を他9つのエージェント定義ファイルに横展開し、エージェント定義を全面的に見直してブラッシュアップする。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [076-align-other-agents-definition.md](../backlogs/076-align-other-agents-definition.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [database-specialist.agent.md](../../.agents/agents/database-specialist.agent.md)
- [ ] [embedded-systems-specialist.agent.md](../../.agents/agents/embedded-systems-specialist.agent.md)
- [ ] [information-technology-service-manager.agent.md](../../.agents/agents/information-technology-service-manager.agent.md)
- [ ] [information-technology-strategist.agent.md](../../.agents/agents/information-technology-strategist.agent.md)
- [ ] [network-specialist.agent.md](../../.agents/agents/network-specialist.agent.md)
- [ ] [project-manager.agent.md](../../.agents/agents/project-manager.agent.md)
- [ ] [software-quality-assurance-specialist.agent.md](../../.agents/agents/software-quality-assurance-specialist.agent.md)
- [ ] [systems-architect.agent.md](../../.agents/agents/systems-architect.agent.md)
- [ ] [systems-auditor.agent.md](../../.agents/agents/systems-auditor.agent.md)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/094-align-other-agents-definition`

1. **リファレンス情報の読み込みと反映**:
   - `docs/references/` ディレクトリ配下にある各エージェントに対応するファイルの内容に基づき、各エージェント定義ファイルの「対象者像」「業務と役割」「期待する技術水準」を記述する。
2. **セクション構成の標準化**:
   - セキュリティスペシャリスト（SC）定義ファイルの最新構造に合わせ、以下の構成を統一する：
     - フロントマター (name, description)
     - 初期宣言文 (`あなたは〇〇です。...`)
     - `# <役割名称> (<英語名称> / <略号>)`
     - `# <略号> としての責務`
     - `## 対象者像（IPA定義）`
     - `## 業務と役割（IPA定義）`
     - `## 期待する技術水準（IPA定義）`
     - `# 利用可能なスキル・コマンド（委譲先）`（共通で利用可能な `threat-modeling`, `create-issue` → `polish-issue`, `review-diff-code`, `adr-workflow` を定義）
     - `## 行動規範`（各役割の専門性を反映させたポリシー、評価・助言の明示方法、応答スタイルなど）
     - `## 機能ごとの応答プロトコル`（主要機能における思考・アウトプットステップの定義）
     - `## 初期応答（起動時）`（メニュー形式の提示）
3. **役割特有の行動規範の追加**:
   - DB: データインテグリティ、概念モデリングと正規化の徹底、スキーマ設計でのセキュリティ配慮。
   - ES: リアルタイム処理とリソース制約への配慮、ハードウェア連携。
   - SM: サービス継続性、サービス品質指標（SLA/SLO）の維持、障害対応プロトコル。
   - ST: ビジネス価値の最大化、投資対効果（TCO）、システム化構想策定。
   - NW: ネットワークトラフィックの可用性と安全性、プロトコル設計。
   - PM: QCD（品質・コスト・納期）のバランス、マイルストーン進捗管理、リスク軽減策。
   - QA: 品質メトリクス評価、テスト自動化、バグ分析。
   - SA: アーキテクチャの整合性と全体最適、非機能要件定義。
   - AU: システム監査の独立性・客観性、監査証跡（ログなど）の評価、法令順守性の確認。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] すべての対象エージェント定義ファイル（9つ）に、IPA定義に準拠した「対象者像」「業務と役割」「期待する技術水準」が完備されていること。
- [ ] すべての定義ファイルに、共通の「利用可能なスキル・コマンド（委譲先）」「行動規範」「機能ごとの応答プロトコル」「初期応答」が記述されていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 本実装はドキュメント整備であり、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) 設計書と整合していること（影響がないこと）。
