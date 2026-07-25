---
ID: 140
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] CI/CD E2Eテスト `cm.recreateCommand is not a function` エラーの解消 (ID: 140)

## 1. 概要 / Summary

GitHub Actions CI パイプラインにおける `tests/e2e/viewer.spec.js` の `E2E Deterministic Scenario Command Replay Test (Issue 135)` において、本番難読化ビルド（Closure Compiler ADVANCED_OPTIMIZATIONS）適用時に以下の TypeError が発生してテストが失敗する不具合を修正した。

```
Error: page.evaluate: TypeError: cm.recreateCommand is not a function
    at eval (eval at evaluate (:302:30), <anonymous>:16:22)
    at /home/runner/work/yuzora/yuzora/tests/e2e/viewer.spec.js:473:41
```

### 再現環境 / Environment

- CI: GitHub Actions (Ubuntu, Headless Chromium, 難読化ビルド `main-min.js`)
- Test: `tests/e2e/viewer.spec.js:469` (`E2E Deterministic Scenario Command Replay Test (Issue 135)`)

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [externs.js](../../externs.js) — Closure Compiler 向け externs (`CommandManagerInterface`) に `recreateCommand` メソッド宣言を追加
- [x] [commands.js](../../src/js/modules/core/commands.js) — `CommandHistory.prototype.recreateCommand` に JSDoc `@override` アノテーションおよび型定義を追加
- [x] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — E2E Command Replay テストにおける安全な `CommandManager` 参照フォールバックチェーンの確立

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### RCA 調査結果

`tests/e2e/viewer.spec.js` L479-480 のコマンドリプレイ処理:
```js
const cmd = cm.recreateCommand(commandItem);
await cm.execute(cmd);
```

**問題の本質**:
1. `src/externs.js` の `CommandManagerInterface` 定義に `recreateCommand` メソッドが未宣であリ、Closure Compiler (ADVANCED_OPTIMIZATIONS モード) による本番難読化ビルド (`main-min.js`) 生成時にメソッド名がプロパティマングル（例: `a.b`）された。
2. Playwright E2E テストがブラウザ環境で非縮小化メソッド名 `cm.recreateCommand` を呼び出した際、メソッドが存在せず `TypeError: cm.recreateCommand is not a function` が発生した。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  1. `src/externs.js` の `CommandManagerInterface` に `recreateCommand(serializedCmd)` メソッド宣言を追加し、マングルを保護。
  2. `commands.js` にて `recreateCommand` に `@override` JSDoc アノテーションを追加。
  3. `npm run healthcheck` により、Closure Compiler ビルドおよび全 E2E/ユニットテストの完全パスを検証。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/140-fix-ci-recreate-command-not-a-function`

1. `src/externs.js` の `CommandManagerInterface` に `recreateCommand` を追加。
2. `src/js/modules/core/commands.js` の JSDoc アノテーションを修正。
3. `npm run healthcheck` を実行し、完全通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)

- [x] `viewer.spec.js` の `E2E Deterministic Scenario Command Replay Test (Issue 135)` が 難読化ビルド環境下で 100% グリーン通過すること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
