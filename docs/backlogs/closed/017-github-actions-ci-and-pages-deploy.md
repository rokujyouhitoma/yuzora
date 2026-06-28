---
ID: 017
種別: Feature
優先度: High
ステータス: Closed
---

# [Feature] GitHub Actions CI パイプラインと GitHub Pages デプロイ自動化の導入 (ID: 017)

## 1. 概要 / Summary

現在 GitHub Pages へのデプロイは `.github/workflows/static.yml` で行われているが、lint・テスト・ビルドを経由せずに直接デプロイされている。
品質を担保した上でデプロイが実行されるよう、以下の 2 つを実現する。

1. **CI ワークフロー (`ci.yml`) の新規作成**  
   全ブランチの push および main への PR に対して、lint → ユニットテスト → E2E テスト → `make`（Closure Compiler による `main-min.js` 生成）を順次実行する。

2. **デプロイワークフロー (`static.yml`) の拡張**  
   CI が成功した場合のみ GitHub Pages へデプロイされるよう `workflow_run` で依存関係を設け、デプロイ直前にも `make` を実行して `main-min.js` をデプロイ成果物に含める。

**MNG-00 との整合**:  
サーバーレス・クライアントサイド専用の静的 SPA という設計原則を維持しつつ、品質ゲートを自動化することで継続的デリバリーの安全性を確保する。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

| ファイル | 変更種別 | 備考 |
|---|---|---|
| `.github/workflows/ci.yml` | 新規作成 | lint / test / make を実行する CI ジョブ |
| `.github/workflows/static.yml` | 変更 | `workflow_run` による CI 依存 + デプロイ前 make 追加 |
| `Makefile` | 参照のみ | `make` コマンドで `main-min.js` を生成 |
| `tools/closure-compiler/closure-compiler-v20240317.jar` | 参照のみ | JAR はリポジトリ内に存在。Java は ubuntu-latest 標準搭載 |
| `package.json` | 参照のみ | `npm ci`, `npm run lint`, `npm run test:unit`, `npm run test:e2e` を使用 |
| `playwright.config.js` | 参照のみ | E2E テスト用 http-server は `webServer` で自動起動 |

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 CI ワークフロー (`ci.yml`)

```yaml
name: CI
on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["main"]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - run: make
```

### 3.2 デプロイワークフロー (`static.yml`) の拡張

- `on` に `workflow_run` を追加（CI が main ブランチで完了したとき）:
  ```yaml
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: ["main"]
  ```
- デプロイジョブに条件を追加:
  ```yaml
  if: |
    github.event.workflow_run.conclusion == 'success' ||
    github.event_name == 'workflow_dispatch'
  ```
- デプロイ手順に `make` ステップを追加（`main-min.js` を生成してからアップロード）

### 3.3 注意点

- `npm ci` は `package-lock.json` が必要。リポジトリに含まれていることを確認済み。
- `webServer` 設定（playwright.config.js）により E2E テスト時に http-server が自動起動するため、別途起動ステップは不要。
- `workflow_run` トリガーは同一リポジトリの `main` ブランチに push されたときのみ発火する（フォーク PR では動作しない点に注意）。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [ ] `.github/workflows/ci.yml` が新規作成されており、全ブランチの push・main への PR で自動実行される。
- [ ] CI ジョブ内で `npm run lint`（複雑度チェック含む）が実行され、エラーがある場合はジョブが失敗する。
- [ ] CI ジョブ内で `npm run test:unit` および `npm run test:e2e` が実行され、テスト失敗時はジョブが失敗する。
- [ ] CI ジョブ内で `make` が実行され、`main-min.js` が生成される。
- [ ] `.github/workflows/static.yml` が修正され、CI ワークフローが success のときのみデプロイが実行される。
- [ ] デプロイ成果物に `main-min.js` が含まれ、GitHub Pages から配信される。
- [ ] `workflow_dispatch` による手動デプロイが引き続き可能である。
- [ ] GitHub Actions タブで CI → Deploy の順でワークフローが実行されていることが確認できる。

