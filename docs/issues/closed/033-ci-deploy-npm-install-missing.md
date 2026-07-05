---
ID: 033
種別: Bug
優先度: High
ステータス: Closed
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

- [ ] [.github/workflows/static.yml](../../.github/workflows/static.yml) — `make` の呼び出しを lint なしのビルドターゲット指定に変更

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### ワークフロー設計上の問題

`static.yml` は `ci.yml` の成功を条件として実行される（`workflow_run: conclusion == 'success'`）。  
つまり **lint・テストは `ci.yml` で完了保証済み** であり、`static.yml` で再度 `make`（= lint + Closure Compiler ビルド）を実行するのは**役割の重複**かつ **`npm install` がないため実行不可**という二重の問題がある。

### `make` の依存関係

```makefile
all: lint $(JS_OUT) $(CSS_OUT)   # lint に依存している
lint:
    npm run lint                 # eslint が必要 → npm install なしでは不可
```

`static.yml` が行うべきことは**ビルド成果物の生成のみ**（`main-min.js` と `src/css/style.css`）であり、lint の再実行は不要。

### 修正方針

`static.yml` の `run: make` を `run: make main-min.js src/css/style.css` に変更し、lint ターゲットを除いたビルドのみを実行する。これにより `npm install` も不要となり、Java（Closure Compiler）のセットアップのみで動作する。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし（ワークフロー修正が必要）
* **恒久対策 (Permanent Fix)**: `static.yml` の `run: make` を `run: make main-min.js src/css/style.css` に変更する

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/033-ci-deploy-build-only`

### ステップ 1: `.github/workflows/static.yml` の修正

`Build main-min.js` ステップの `run: make` を以下に変更する：

```yaml
- name: Build static assets
  run: make main-min.js src/css/style.css
```

変更前後の対比：

```diff
- - name: Build main-min.js
-   run: make
+ - name: Build static assets
+   run: make main-min.js src/css/style.css
```

これにより：
- `lint` ターゲット（`npm run lint`）は実行されない → `npm install` 不要
- `main-min.js`（Closure Compiler）と `src/css/style.css`（CSS結合）のみビルドされる
- Java（Closure Compiler 用）のセットアップは引き続き必要なため、`Setup Java` ステップは残す

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `Deploy static content to Pages` ワークフローが `Build static assets` ステップでエラーなく完了すること。
- [ ] GitHub Pages へのデプロイが正常に完了すること（デプロイ先URL にアクセスできること）。
- [ ] `ci.yml` ワークフローは変更せず、lint・テストが引き続き正常に実行されること。
- [ ] DSN-01・DSN-02 設計ドキュメントへの影響なし（CI設定のみの変更）。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
