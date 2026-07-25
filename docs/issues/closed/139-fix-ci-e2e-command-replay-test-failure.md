---
ID: 139
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] CI/CD E2Eテスト E2E Deterministic Scenario Command Replay Test の失敗 (ID: 139)

## 1. 概要 / Summary

GitHub Actions CI パイプラインにおいて、`tests/e2e/viewer.spec.js` 内の `E2E Deterministic Scenario Command Replay Test (Issue 135)` が以下のエラーで失敗する不具合を修正した。

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

### 再現環境 / Environment

- CI: GitHub Actions (Ubuntu, Headless Chromium, 難読化ビルド環境)
- Test: `tests/e2e/viewer.spec.js:469` (`E2E Deterministic Scenario Command Replay Test (Issue 135)`)

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — CommandManager 取得処理の堅牢化 (`window.yuzora.CommandManager` / `locator.resolve` フォールバックの追加)
- [x] [commands.js](../../src/js/modules/core/commands.js) — `window['CommandManager']` 明示公開の追加

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### RCA 調査結果

`tests/e2e/viewer.spec.js` L473-476:
```js
const replayResult = await page.evaluate(async () => {
    if (!window.CommandManager) {
        return { success: false, reason: 'CommandManager not available' };
    }
    // ...
```

**問題発生メカニズム**:
1. `src/js/modules/core/commands.js` 内では `var CommandManager = ...` として宣言されており、トップレベルスコープの `var` に依存していた。
2. Closure Compiler 等の難読化・バンドルビルドを経由すると、トップレベル `var` は即時実行関数 (IIFE) スコープにカプセル化されるか、変数が難読化され `window.CommandManager` プロパティとしてグローバル公開されなくなる。
3. これにより `window.CommandManager` の存在チェックが `undefined` となり、`{ success: false, reason: 'CommandManager not available' }` が返却されてテストが失敗していた。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  1. `commands.js` にて `window['CommandManager'] = CommandManager;` を明示的にグローバル展開。
  2. `viewer.spec.js` のテストコード内において、`const cm = window.CommandManager || (window.yuzora && window.yuzora.CommandManager) || (window.Yuzora && window.Yuzora.locator.resolve('CommandHistory'));` のフォールバックチェーンを採用し、難読化ビルド環境でも安定してコマンドリプレイを実行できるように改善した。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/139-fix-ci-e2e-command-replay-test-failure`

1. `src/js/modules/core/commands.js` で `window['CommandManager'] = CommandManager;` を明示登録。
2. `tests/e2e/viewer.spec.js` で `CommandManager` 取得を `window.CommandManager || (window.yuzora && window.yuzora.CommandManager) || ...` に強化。
3. `npm run healthcheck` を実行し、難読化ビルド (`main-min.js`) の生成と全 E2E テストの通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)

- [x] `viewer.spec.js` の `E2E Deterministic Scenario Command Replay Test (Issue 135)` が 100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
