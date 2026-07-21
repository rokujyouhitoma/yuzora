---
ID: 076
種別: Refactor
優先度: Medium
ステータス: Closed
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

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- `.agents/agents/` 配下の各エージェント MD ファイル（計9ファイル）
- [docs/backlogs/README.md](README.md) (ステータス管理)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 IPA定義に基づく役割と業務の明文化
- `docs/references/` ディレクトリ配下にある各役割の公式リファレンス（IPA定義）に基づき、対象者像、業務と役割、および期待する技術水準を正確に定義・反映する。
- 英語名称および略号（DB, ES, SM, ST, NW, PM, QA, SA, AU）を明記する。

### 3.2 利用可能なスキル（委譲先）の定義
- プロジェクトで実際に利用可能なスキル（`adr-workflow`, `git-workflow`, `review-diff-code`, `create-issue`, `polish-issue` 等）を紐付ける。

### 3.3 行動規範と応答プロトコルの策定
- 各専門職（例：システム監査技術者の客観性・独立性、プロジェクトマネージャの進捗・リスク管理等）の立場に基づく行動指針および応答スタイル、機能ごとの応答プロトコルを記述する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] すべての対象エージェントファイル（9ファイル）に、IPA定義に整合した「対象者像」「業務と役割」「期待する技術水準」が記述されていること。
- [ ] すべての定義ファイルに、共通の「利用可能なスキル・コマンド（委譲先）」「行動規範」「機能ごとの応答プロトコル」「初期応答」セクションが完備されていること。
- [ ] Closure Compiler などのビルドやテストへの悪影響がないこと（ドキュメントのみの変更）。
