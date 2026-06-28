---
ID: 013
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] GitHub Actions CI パイプラインと GitHub Pages デプロイ自動化の導入 (ID: 013)

## 1. 概要 / Summary
現在 GitHub Pages へのデプロイは `.github/workflows/static.yml` で行われているが、lint・テスト・ビルドを経由せずに直接デプロイされている。
本機能により以下を実現する:

1. **CI ワークフロー (`ci.yml`) の新規作成**: 全ブランチの push および main への PR に対して lint・ユニットテスト・E2E テスト・`make` を自動実行する。
2. **デプロイワークフロー (`static.yml`) の拡張**: CI が成功した場合のみデプロイされるよう `workflow_run` による依存関係を設ける。デプロイ前にも `make` を実行し、`main-min.js` をデプロイ成果物に含める。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-011 (ビルド自動化), REQ-012 (CI/CD自動化)
- 関連バックログ: [017-github-actions-ci-and-pages-deploy.md](../backlogs/017-github-actions-ci-and-pages-deploy.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [.github/workflows/ci.yml](../../.github/workflows/ci.yml) [NEW]
- [ ] [.github/workflows/static.yml](../../.github/workflows/static.yml) [MODIFY]

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/013-github-actions-ci-and-pages-deploy`

1. **`.github/workflows/ci.yml` の新規作成**:
   - `ubuntu-latest` 上で実行。
   - `actions/checkout@v4` を実行。
   - Node 18 のセットアップ (`actions/setup-node@v4`)。
   - `npm ci` での依存関係インストール。
   - `npm run lint` の実行。
   - `npm run test:unit` の実行。
   - `npx playwright install --with-deps chromium` による Playwright 依存環境のインストール。
   - `npm run test:e2e` の実行。
   - `actions/setup-java@v4` (Java 17) のセットアップ（Closure Compiler で java コマンドが必要なため）。
   - `make` を実行して `main-min.js` がコンパイル可能かチェック。

2. **`.github/workflows/static.yml` の編集**:
   - トリガーに `workflow_run` を設定。`CI` ワークフローの `completed` 状態かつ `main` ブランチを対象とする。手動トリガー `workflow_dispatch` も併用。
   - デプロイの `deploy` ジョブに `if` 条件を追加: `github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch'`
   - ジョブ内に `actions/setup-java@v4` のセットアップステップを追加。
   - `make` を実行して `main-min.js` をビルドするステップを追加。
   - `actions/upload-pages-artifact@v3` で `path: '.'` を指定してアップロードし、デプロイする。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `.github/workflows/ci.yml` が新規作成されていること。
- [ ] `.github/workflows/static.yml` が修正され、CI 依存かつデプロイ前ビルドを行うようになっていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] `npm run lint` が正常にパスすること。
- [ ] The implementation is fully consistent with DSN-01 and DSN-02 design specs (no dead documents).

