---
ID: 033
種別: Bug
優先度: High
ステータス: Open (New)
---

# [BUG] GitHub Actions デプロイワークフローで `eslint: not found` エラーが発生する (ID: 033)

## 1. 概要 / Summary

GitHub Actions の `Deploy static content to Pages` ワークフロー (`static.yml`) において、`make` ステップ実行時に `npm run lint` が呼び出されるが、ワークフロー内で `npm install` が実行されていないため ESLint がインストールされておらず、以下のエラーで失敗する。

```
sh: 1: eslint: not found
make: *** [Makefile:25: lint] Error 127
Error: Process completed with exit code 2.
```

### 再現手順 / Steps to Reproduce

1. `main` ブランチへのプッシュまたは手動で `Deploy static content to Pages` ワークフローをトリガーする
2. `Build main-min.js` ステップ（`run: make`）が失敗する

### 再現環境 / Environment

- CI: GitHub Actions (`ubuntu-latest`)
- Workflow: `.github/workflows/static.yml`
- 失敗ステップ: `Build main-min.js` → `make` → `npm run lint` → `eslint src/js/`

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [.github/workflows/static.yml](../../.github/workflows/static.yml) — `npm install` ステップの追加が必要

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

`static.yml` ワークフローには Java のセットアップ（Closure Compiler 用）は含まれているが、Node.js のセットアップ（`actions/setup-node`）および `npm install` が含まれていない。`Makefile` の `all` ターゲットは `lint` に依存しており、`lint` は `npm run lint`（= `eslint src/js/`）を実行するため、devDependencies がインストールされていない環境ではエラーになる。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし（ワークフロー修正が必要）
* **恒久対策 (Permanent Fix)**: `static.yml` に `actions/setup-node` ステップと `npm install` ステップを追加し、Closure Compiler ビルド前に devDependencies を確実にインストールする

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/033-ci-deploy-npm-install`

1. `.github/workflows/static.yml` の `Setup Java` ステップの前後に以下を追加する：
   - `actions/setup-node@v4`（Node.js バージョンは `package.json` の engines フィールドまたは最新 LTS を指定）
   - `npm install` ステップ（devDependencies をインストール）

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `Deploy static content to Pages` ワークフローが `make` ステップでエラーなく完了すること。
- [ ] GitHub Pages へのデプロイが正常に完了すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
