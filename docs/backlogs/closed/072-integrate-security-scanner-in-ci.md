---
ID: 072
種別: Enhancement
優先度: High
ステータス: Closed
---

# [Enhancement] Integrate Security Scanner in CI (ID: 072)

## 1. 概要 / Summary
GitHub Actions の CI/CD パイプラインにセキュリティスキャン（`npm audit` による依存関係脆弱性診断や、静的解析ルールによる XSS/セキュリティ問題チェック）を統合し、リリースのたびにセキュリティ監査が自動で実行されるシフトレフト体制を構築する。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [.github/workflows/static.yml](../../.github/workflows/static.yml) (CI/CD ワークフロー定義)
- [package.json](../../package.json) (セキュリティチェック用の npm スクリプト定義)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 依存関係スキャンの自動化
- CI パイプラインのジョブ実行開始時に `npm audit` を実行し、重大度（Severity）が `high` 以上の脆弱性を持つモジュールが存在する場合に CI を即時失敗（品質ゲート遮断）させる。
### 3.2 静的コード解析におけるセキュリティポリシーの厳格化
- `eslint-plugin-security` や `eslint-plugin-no-unsanitized` 等を導入（またはルール強化）し、`innerHTML` や `eval` などの危険な構文が誤って混入された場合に自動検知する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] CI パイプライン内で依存関係の脆弱性スキャン（npm audit）が自動実行されること。
- [ ] 深刻な脆弱性が検出された場合、デプロイジョブに移行せず CI がエラー終了すること。
- [ ] 開発者が意図せず脆弱なコードを追加した際、静的解析がエラーを検出しコミットを差し戻すこと。
