---
ID: 071
種別: Enhancement
優先度: High
ステータス: Approved
---

# [Enhancement] Enforce E2E on Minified Build (ID: 071)

## 1. 概要 / Summary
Google Closure Compiler の `ADVANCED_OPTIMIZATIONS` で難読化・圧縮されたビルド成果物（`compiled.html` / `main-min.js`）に対し、開発用 `index.html` と同等の Playwright E2E テストを強制適用し、難読化起因のバグ（プロパティ名破損など）を自動検知するためのテストプロセス改善案。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [playwright.config.js](../../playwright.config.js) (E2E テスト実行設定)
- `tests/e2e/` 内 of 各テストスクリプト (テストターゲットを compiled.html に切り替える機能の追加)
- [Makefile](../../Makefile) / [package.json](../../package.json) (テストコマンドの追加・修整)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 テスト対象の動的切り替え
- 環境変数（例：`TEST_TARGET=compiled`）を設定することで、Playwright のテスト対象 URL を `index.html`（開発用）から `compiled.html`（ビルド済製品用）に切り替えて実行できるようにする。
- 難読化時にグローバル変数や公開 API が正しく Service Locator または `window.Yuzora` に公開されており、テストコードからのアクセスが破壊されていないかを検証する。

### 3.2 難読化ビルド専用のテストシナリオ
- 難読化によって外部変数アクセスが難しくなる箇所（コマンド履歴インポートなど）について、コンパイラ externs 設定に正しく登録されており、難読化後もテストシミュレータが正常動作することを確認する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] 環境変数 `TEST_TARGET=compiled` を指定して `npx playwright test` を実行した際、すべての E2E テストが `compiled.html` を対象に実行され、正常終了すること。
- [ ] 難読化後のビルド成果物に構文エラーやプロパティ破損があった場合、自動的にテストが失敗すること。
