---
ID: 143
種別: Bug
優先度: High
ステータス: Open (In Progress)
---

# [BUG] CI/CD E2Eテスト TOCドロワーテスト中の `#reader-viewport` クリックでヘッダーの `hidden` クラスが解除されない (ID: 143)

## 1. 概要 / Summary

CI/CD の E2E テスト (`tests/e2e/viewer.spec.js`) において、`should observe headings and render TOC chunked progressive list` テストが失敗する。

失敗箇所は L341:
```
await expect(readerHeader).not.toHaveClass(/hidden/);
```

テスト手順5「TOC ドロワーを再度開く」の直前に `#reader-viewport` をクリックしても `.reader-header` 要素の `hidden` クラスが除去されず、ヘッダーが表示されない。エラーログには次の内容が記録されている：

```
Expected pattern: not /hidden/
Received string: "reader-header hidden"
Timeout: 10000ms
```

エラーは Retry #2 でも発生しており、機能的な不具合である。

### 再現手順 / Steps to Reproduce

1. `npm run test:e2e` を実行する（または GitHub CI が `main` ブランチ push 後に実行）
2. `viewer.spec.js` の `should observe headings and render TOC chunked progressive list` テストが対象
3. TOCドロワーを開く → TOCアイテムをクリックしてページジャンプ → `page.waitForTimeout(3000)` 後に `#reader-viewport` をクリック
4. `await expect(readerHeader).not.toHaveClass(/hidden/)` の行でタイムアウトエラーが発生

### 再現環境 / Environment

- Browser / OS: GitHub CI (Ubuntu runner) / Chromium (Playwright)
- テスト対象: `tests/e2e/viewer.spec.js:301`
- CI ビルド: PR #122 (`docs(backlog): close Backlog 119`)
- Book / File: `#developer-books-grid .book-card` の最初のカード

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — L301-348: 失敗テスト本体（修正対象）
- [ ] [ui.js](../../src/js/modules/ui/ui.js) — `triggerHeaderShow()` (L1074-1088), `hideControls()` (L1064-1072), `toggleControls()` (L1090-1099): ヘッダー表示制御ロジック

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### 確定した根本原因

`ui.js` の `triggerHeaderShow()` は、ヘッダーを表示した後 **3000ms の自動非表示タイマー**（inactivityTimer）を開始する。

```
tests/e2e/viewer.spec.js のシーケンス:
```

```
L331: secondTOCItem.click()
  └─ jumpToHeading() → NavigatePageCommand → scrollToPage()
     └─ closeTOC() が先に呼ばれる
        └─ triggerHeaderShow() → [A] inactivityTimer 開始（3000ms）

L334: await expect(tocDrawer).not.toHaveClass(/open/)

L337: await page.waitForTimeout(3000)   ← タイマー[A]と同じ3000ms!
  └─ [A] inactivityTimer 発火 → hideControls() → readerHeader に hidden 追加

L340: await page.click('#reader-viewport')
  └─ toggleControls(e):
       nextVisible = readerHeader.classList.contains("hidden")  → true
       → ToggleControlsCommand(true) → triggerHeaderShow()
         └─ readerHeader.classList.remove("hidden")  ← hidden が除去される
         └─ inactivityTimer.trigger() → [B] 新タイマー開始 (3000ms後に再度 hidden)

L341: await expect(readerHeader).not.toHaveClass(/hidden/)  ← ここで検証
```

**通常であれば L341 の時点でヘッダーは表示中なので通るはず**。しかし CI 環境では以下の競合が発生している：

- `secondTOCItem.click()` によるページジャンプ実行中に `scrollToPage()` 内の `renderer.scrollToPage(pageNumber).then(...)` が遅延して完了する。
- `then()` 内で `PAGE_CHANGED` イベントが publish され、`yuzora.js` の `PAGE_CHANGED` ハンドラー内でも処理が走る。
- **CI 環境での遅延やタイムアウトの差異**により、`waitForTimeout(3000)` が終了する時点でタイマー[A]がちょうど発火して `hideControls()` が実行されるケースが発生。その後の `page.click` が **Playwright の非同期処理の都合上、`hideControls()` よりも前に deliver される**と、`nextVisible = false`（ヘッダーはまだ表示中と誤判定）→ `toggleControls` が `hideControls()` 方向に動く。

### 特に重大な競合点

**`toggleControls()` のロジック:**
```javascript
const nextVisible = viewContext.readerHeader.classList.contains("hidden");
CommandManager.execute(new ToggleControlsCommand(nextVisible));
```

`nextVisible = true` → `triggerHeaderShow()` → ヘッダー表示 ✅
`nextVisible = false` → `hideControls()` → ヘッダー非表示 ❌

CI 環境で `page.click` が deliver された時点でヘッダーがまだ `visible` 状態（タイマーが0.1ms遅延で未発火など）だった場合、`nextVisible = false` となり `hideControls()` が呼ばれてしまう。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: テスト L337 の `waitForTimeout(3000)` を `waitForTimeout(1500)` に短縮してタイマー[A]と競合しないようにする。
* **恒久対策 (Permanent Fix)**: テスト L340 の `page.click('#reader-viewport')` の前に、ヘッダーが `hidden` 状態になるのを明示的に `expect(readerHeader).toHaveClass(/hidden/)` で待ってから、クリックしてヘッダーを表示させ、アサーションするよう修正する。これにより「隠れている状態でクリック → 表示させる」という意図が明確になり、競合が排除される。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/143-fix-ci-toc-header-hidden-after-jump`

### 変更対象: `tests/e2e/viewer.spec.js` L336-341

#### 現在のコード (L336-341):
```javascript
// Wait for smooth scroll and IntersectionObserver to settle
await page.waitForTimeout(3000);

// 5. Open TOC drawer again
await page.click('#reader-viewport');
await expect(readerHeader).not.toHaveClass(/hidden/);
```

#### 修正後のコード:
```javascript
// Wait for smooth scroll and IntersectionObserver to settle
// Use 1500ms to avoid racing with the 3000ms inactivity auto-hide timer
await page.waitForTimeout(1500);

// 5. Open TOC drawer again
// First confirm header is auto-hidden by the inactivity timer
await expect(readerHeader).toHaveClass(/hidden/, { timeout: 5000 });
// Then click reader-viewport to show header (toggle from hidden → visible)
await page.click('#reader-viewport');
await expect(readerHeader).not.toHaveClass(/hidden/);
```

**修正の根拠:**
1. `waitForTimeout(1500)` に変更: スクロールアニメーション完了を待ちつつ、inactivityTimer(3000ms)は未発火の時点でテストが進む
2. `expect(readerHeader).toHaveClass(/hidden/)` 追加: inactivityTimer の発火を明示的に待ち、ヘッダーが確実に隠れた後に次のクリックを実行する（タイムアウト5000ms で余裕を持つ）
3. その後の `page.click('#reader-viewport')` は `nextVisible=true` が保証される

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/viewer.spec.js` の `should observe headings and render TOC chunked progressive list` テストが CI/CD 環境で安定してパスすること（リトライなし）。
- [ ] ローカルおよび CI の E2E テスト全件 (`npm run test:e2e`) がパスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) のデザイン仕様と完全整合していること（テストのみの変更のため設計文書の更新は不要）。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`
