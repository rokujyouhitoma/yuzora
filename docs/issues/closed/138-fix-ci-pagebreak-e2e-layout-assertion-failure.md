---
ID: 138
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] CI/CD E2Eテスト pagebreak.spec.js のレイアウト境界アサーション失敗 (ID: 138)

## 1. 概要 / Summary

GitHub Actions CI で `tests/e2e/pagebreak.spec.js` の以下3テストが失敗していた不具合を修正する。  
同一テストはローカルでは通過していたが、Chromium で `columnWidth` の `getComputedStyle` が `'auto'` (NaN) を返すことで `.page-break` の幅計算がスキップされ、改ページ押し出しが不完全になっていた。

```
FAILED: Yuzora Page Break Tests › should successfully enforce column break on .page-break elements
FAILED: Yuzora Page Break Tests › should successfully enforce column break on .page-break elements even with short text
FAILED: Yuzora Page Break Tests › should successfully adjust page break sizes on window resize / different viewport widths
```

### 再現環境 / Environment

- CI: GitHub Actions (Ubuntu, ヘッドレス Chromium)
- Browser / OS: Headless Chromium (CI) / Ubuntu

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [pagebreak.spec.js](../../tests/e2e/pagebreak.spec.js) — 失敗していたE2Eテスト。`injectAndWaitForLayout` 導入と決定論的 `LAYOUT_REPAIRED` 待機
- [x] [renderer.js](../../src/js/modules/ui/renderer.js) — `resolveLayoutParameters` で `columnWidth` が `auto`/`NaN` の場合のフォールバック追加
- [x] [playwright.config.js](../../playwright.config.js) — `viewport: { width: 1280, height: 720 }` 明示設定

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### RCA 調査結果

1. **`resolveLayoutParameters` における `computedStyle.columnWidth` の `'auto'` (NaN) 返還**:
   Chromium ブラウザにおいて、CSS `column-width: calc(50% ...)` が動的に指定されている場合、`window.getComputedStyle(parent).columnWidth` が `'auto'`（`parseFloat` で `NaN`）を返す仕様/挙動が存在していた。
   これにより `resolveLayoutParameters` が `null` を返して早期リターンし、`applyPageBreakSizes()` が実行されず、`.page-break` の `width` が `0px` のまま維持されて文字の押し出し・改ページが行われていなかった。

2. **テストにおける非決定論的 `waitForTimeout` 待機**:
   従来のテストでは `waitForTimeout(500)` を使用していたが、Yuzora のレイアウト修復処理は非同期イベント (`LAYOUT_CHECK_REQUESTED` → `LAYOUT_REPAIRED`) 駆動で行われるため、イベント完了を検知する決定論的待機が必要であった。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  1. `renderer.js` の `resolveLayoutParameters` に、`columnWidth` が `NaN` の場合に `parent.clientHeight` および画面幅から物理カラム幅を算出するフォールバック処理を追加。
  2. `pagebreak.spec.js` で `YuzoraEventType.LAYOUT_REPAIRED` イベントを待機する `injectAndWaitForLayout` ヘルパーを導入し、決定論的アサーションを達成。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/138-pagebreak-e2e-ci-layout-assertion`

1. `renderer.js` の `resolveLayoutParameters` に `columnWidth` の NaN フォールバック計算を追加。
2. `playwright.config.js` に `viewport: { width: 1280, height: 720 }` を明示追加。
3. `tests/e2e/pagebreak.spec.js` に `LAYOUT_REPAIRED` リッスン待機を導入。
4. 全テストが Pass することを確認。

---

## 6. 完了条件 / Success Criteria (DoD)

- [x] `pagebreak.spec.js` の全3テストが CI/ローカル環境で100%パスすること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/pagebreak.spec.js`, `npm run healthcheck`
