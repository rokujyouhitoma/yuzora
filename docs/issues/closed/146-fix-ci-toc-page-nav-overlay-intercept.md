---
ID: 146
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] CI/CD E2E TOCテスト — `#page-nav-left` オーバーレイによる `#reader-viewport` クリック遮断の修正 (ID: 146)

## 1. 概要 / Summary

CI/CD パイプラインにおける E2E テスト (`tests/e2e/viewer.spec.js`) の `should observe headings and render TOC chunked progressive list` において、`#reader-viewport` へのクリックがタイムアウトエラーで失敗する。

```
<div title="次のページへ" id="page-nav-left" class="page-nav page-nav-left"></div> intercepts pointer events
347 | await page.click('#reader-viewport', { position: { x: 10, y: 10 } });
```

---

## 2. トレーサビリティ / Traceability

- 関連 Issue: Issue 143, Issue 145
- 関連要件: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- 関連設計: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- テスト: `tests/e2e/viewer.spec.js`

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

Issue 145 にて ruby 要素との干渉を避けるため座標 `{ position: { x: 10, y: 10 } }` を指定してクリックする修正を行ったが、ビューポート左上角領域には左右ページめくり用の透明オーバーレイ要素 `#page-nav-left`（`class="page-nav page-nav-left"`）が配置されている。

Playwright はデフォルトでクリック対象要素の上に他要素が重なっていないかアサーション（Actionability Check）を行うため、`#page-nav-left` がポインターイベントを遮断（`intercepts pointer events`）していると判定され、10秒間のタイムアウトに達してテストが失敗した。

---

## 4. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — L347 周辺のクリック処理の修正

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/146-fix-ci-toc-page-nav-overlay-intercept`

### 変更対象: `tests/e2e/viewer.spec.js` L347

Playwright の `force: true` オプションを利用して、オーバーレイ要素の重なり判定をバイパスし、直接 `#reader-viewport` へクリックイベントを発行させる。

```javascript
// 修正前:
await page.click('#reader-viewport', { position: { x: 10, y: 10 } });

// 修正後:
// Use force: true to bypass Playwright actionability checks for overlay elements (#page-nav-left)
// and trigger click directly on #reader-viewport to toggle header controls.
await page.click('#reader-viewport', { force: true });
```

`force: true` を適用することにより：
1. `#page-nav-left` 等のオーバーレイによるクリック遮断（Actionability check failure）が回避される。
2. クリックイベントのターゲットが確実に `#reader-viewport` となり、`toggleControls(e)` 内の `e.target.closest("ruby")` や `a` フィルタによる意図しない早期リターンが発生しない。
3. `nextVisible` が正しく判定され、`triggerHeaderShow()` が確実に実行されてヘッダーの `hidden` クラスが除去される。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/viewer.spec.js` の `should observe headings and render TOC chunked progressive list` テストがパスすること。
- [ ] CI/CD 環境およびローカルで `npm run test:e2e` が全件正常終了すること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常パスすること。
- [ ] 本実装が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) 仕様と整合していること。
