---
ID: 015
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] GitHub Actions CI でのスクリーンショット保存先権限エラー (ID: 015)

## 1. 概要 / Summary
GitHub Actions の CI 実行時、E2Eテスト `tests/e2e/diagnose.spec.js` が以下のエラーにより失敗する。

```
Error: EACCES: permission denied, open '/root/.gemini/antigravity-ide/brain/6924368e-3ebf-4fff-abbf-f141657e7754/page1.png'
```

これは、スクリーンショットの保存先パスとしてハードコードされている `/root/.gemini/antigravity-ide/brain/...`（エージェント専用のアーティファクト保存領域）が、GitHub Actions 上で存在しないか、権限がないためである。

### 再現手順 / Steps to Reproduce
1. GitHub リポジトリにコードをプッシュし、GitHub Actions の CI ワークフローを実行する。
2. `npm run test:e2e` ステップにおいて、`diagnose.spec.js` の実行で上記エラーが発生して失敗するのを確認する。

### 再現環境 / Environment
- CI/CD Environment: GitHub Actions (ubuntu-latest)
- Book / File: `tests/e2e/diagnose.spec.js`

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [tests/e2e/diagnose.spec.js](../../tests/e2e/diagnose.spec.js) [MODIFY]

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
`tests/e2e/diagnose.spec.js` 内において、スクリーンショットの保存先となる `artifactPath1` および `artifactPath2` にエージェント環境専用の絶対パスである `/root/.gemini/...` がハードコードされている。
GitHub Actions 上で動作する Playwright ランナーは、コンテナ内のセキュリティ制限やディレクトリ不在により、この絶対パス配下への書き込み権限を持たないため、`EACCES: permission denied` エラーが発生する。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  - テスト内でスクリーンショットの出力先パスをハードコードされた絶対パスではなく、環境を問わず書き込み可能な相対パス（例：`test-results/` または環境変数で指定可能なパス）に変更する。
  - 具体的には、環境変数 `ARTIFACTS_DIR` が指定されている場合はそのディレクトリ配下へ保存し、指定されていない場合はプロジェクトルート配下の `test-results/`（または同様のローカルディレクトリ）にフォールバックするように設計を変更する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/015-github-actions-ci-permission-denied`

1. `tests/e2e/diagnose.spec.js` を変更する:
   - 環境変数 `ARTIFACTS_DIR` 等からパスを取得するか、無ければ `./test-results/` などのプロジェクト直下相対パスを使用するように変更。
   - 例:
     ```javascript
     const artifactsDir = process.env.ARTIFACTS_DIR || path.join(__dirname, '../../test-results');
     const artifactPath1 = path.join(artifactsDir, 'page1.png');
     ```
   - 保存先ディレクトリが存在しない可能性を考慮し、保存前に `fs.mkdirSync(artifactsDir, { recursive: true })` を呼び出すようにし、安全に作成する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] CI（GitHub Actions）で `tests/e2e/diagnose.spec.js` を実行した際、権限エラーが発生せずにスクリーンショットが保存され、ジョブが正常にパスすること。
- [ ] ローカル環境で `npm run test:e2e` を実行した際、ローカルの `test-results` ディレクトリにスクリーンショットが保存されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] The implementation is fully consistent with DSN-01 and DSN-02 design specs (no dead documents).
