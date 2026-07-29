---
ID: 145
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] CI/CD E2E TOCテスト — `#reader-viewport` クリック後もヘッダーが `hidden` のまま (ID: 145)

## 1. 概要 / Summary

Issue 143 の修正（`waitForTimeout` 短縮 + `toHaveClass(/hidden/)` 明示的待機）後も、
CI/CD パイプライン上で同一テスト `should observe headings and render TOC chunked progressive list` が引き続き失敗している。

```
Expected pattern: not /hidden/
Received string: "reader-header hidden"
Timeout: 10000ms
18 × locator resolved to <header class="reader-header hidden">
```

L344 `page.click('#reader-viewport')` 実行後、L345 `await expect(readerHeader).not.toHaveClass(/hidden/)` が
10 秒タイムアウトで失敗（18 回全リトライが hidden のまま）。

---

## 2. 根本原因分析 (RCA) / Root Cause Analysis

### 確定した根本原因

`ui.js` の `toggleControls(e)` には、interactive 子要素上のクリックをフィルタリングするガードがある:

```javascript
// ui.js L1092-1095
function toggleControls(e) {
    if (e && e.type === "click" && (e.target.closest("a") || e.target.closest("ruby") || e.target.closest("button"))) {
        return;  // 早期リターン！
    }
    ...
}
```

Playwright の `page.click('#reader-viewport')` は **要素の中心座標** をクリックする。
CI 環境（Chromium ヘッドレス、1280×720 viewport）では、書籍コンテンツのレイアウト結果によって
`#reader-viewport` の中心点が **ルビ（`<ruby>`）要素の上に重なる** 場合がある。

この場合 `click` イベントの `e.target` は `<ruby>` 要素となり、
`e.target.closest("ruby")` が truthy → `toggleControls` が早期リターン → `triggerHeaderShow()` は呼ばれない →
ヘッダーは `hidden` のまま → L345 のアサーションが永続的に失敗する。

### なぜ Issue 143 の修正では解消されなかったか

Issue 143 の修正は「タイマー競合」を対象としていたが、実際の根本原因は
「クリックターゲットが ruby 要素に当たる」というレイアウト依存の不確定性だった。

### シーケンス図（CI 失敗パス）

```
L331: secondTOCItem.click()
  └─ closeTOC() → triggerHeaderShow() → inactivityTimer[A] 3000ms 開始

L338: waitForTimeout(1500)

L342: expect(readerHeader).toHaveClass(/hidden/) ← タイマー[A] 発火後にパス ✅

L344: page.click('#reader-viewport')
  └─ e.target = <ruby>...</ruby>  ← CI 環境レイアウト次第でここになる
     e.target.closest("ruby") → true
     → toggleControls が早期リターン (return)
     → triggerHeaderShow() 呼ばれない
     → readerHeader は hidden のまま ❌

L345: expect(readerHeader).not.toHaveClass(/hidden/)
  → 10000ms タイムアウト → 18 × 失敗
```

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — L344: `page.click('#reader-viewport')` を確実に非テキスト領域をクリックするよう修正

---

## 4. 実装方針 / Implementation Plan

Target Branch: `fix/145-fix-ci-toc-header-still-hidden-viewport-click`

### 変更対象: `tests/e2e/viewer.spec.js` L344

#### 根本修正: クリック座標を `#reader-viewport` の左上隅付近（非コンテンツ領域）に固定する

`page.click('#reader-viewport', { position: { x: 10, y: 10 } })` を使い、
ビューポートの左上隅（テキストやルビが存在しない余白領域）を明示的にクリックする。

```javascript
// 修正前:
await page.click('#reader-viewport');

// 修正後:
// Click the top-left corner of the reader-viewport to avoid hitting ruby/text elements
// that would cause toggleControls() to early-return without showing the header.
await page.click('#reader-viewport', { position: { x: 10, y: 10 } });
```

#### 代替案（`dispatchEvent` で直接イベント発火）を採用しない理由:
- `page.dispatchEvent` は実際のユーザー操作をシミュレートしない
- テストの意図（「ユーザーがビューポートをタップするとヘッダーが表示される」）と乖離する
- `toggleControls(e)` の `e.target` フィルタリングロジックを実際に検証すべき

#### なぜ左上隅 (10, 10) が安全か:
- CSS の reading layout では書籍コンテンツは RTL で `padding-left` があるため左端は余白
- `position: { x: 10, y: 10 }` は `#reader-viewport` 要素内の座標（要素の左上から 10px, 10px）
- この位置にはテキスト・ruby・ボタン・リンクが存在しない可能性が極めて高い

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/viewer.spec.js` の `should observe headings and render TOC chunked progressive list` が CI/CD で安定してパスすること（リトライなし）。
- [ ] `page.click('#reader-viewport', { position: { x: 10, y: 10 } })` がローカルおよび CI の両方でヘッダーを表示させること。
- [ ] すべての E2E テスト (`npm run test:e2e`) が正常にパスすること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) のデザイン仕様と完全整合していること（テストのみの変更のため設計文書の更新は不要）。

---

## 6. トレーサビリティ / Traceability Matrix

- **関連 Issue**: Issue 143 (前回の修正試行)
- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`
