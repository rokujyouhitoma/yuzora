---
ID: 089
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] Enforce E2E on Minified Build (ID: 089)

## 1. 概要 / Summary
Google Closure Compilerでビルドされた成果物（compiled.html）に対し、開発用 index.html と同等の Playwright E2E テストを実行可能にし、ビルド後のバグやプロパティの破損を自動検出する。

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01-user_requirements.md](../requirements/REQ-01-user_requirements.md)
- 関連要件 (SRD): [REQ-03-system_requirements.md](../requirements/REQ-03-system_requirements.md)
- 関連バックログ: [071-enforce-e2e-on-minified-build.md](../backlogs/071-enforce-e2e-on-minified-build.md)

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [playwright.config.js](../../playwright.config.js)
- [ ] [package.json](../../package.json)
- [ ] [Makefile](../../Makefile)

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/089-enforce-e2e-on-minified-build`

1. `playwright.config.js` にて環境変数（例：`TEST_TARGET=compiled`）に基づいて `baseURL` を `compiled.html` に変更する。
2. 難読化ビルド成果物の検証のために `npx playwright test` を実行するスクリプトを `package.json` に追加する。
3. すべてのE2Eテストが `compiled.html` の環境下でも正常動作することを確認する。

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 環境変数 `TEST_TARGET=compiled` を指定して E2E テストを実行した際、テスト対象が `compiled.html` に切り替わり、全件通過すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
