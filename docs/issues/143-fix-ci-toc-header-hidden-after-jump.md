---
ID: 143
種別: Bug
優先度: High
ステータス: Open (New)
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

エラーは Retry #2 でも発生しており、フレーキーなタイミング問題ではなく、機能的な不具合の可能性が高い。

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

- [ ] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — L301-348: 失敗テスト本体
- [ ] `src/js/` 以下のヘッダー表示ロジック — `#reader-viewport` のクリックイベントで `.reader-header` の `hidden` クラスを除去するコード
- [ ] 関連: `src/css/modules/reader.css` / `src/css/style.css` — `.reader-header.hidden` の CSS 定義

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

<!-- 調査によって判明した真の根本原因（5つの「なぜ」や仮説など）を詳細に記述します。 -->

**仮説:**

1. **テスト手順のタイミング問題**: TOC アイテムクリック後の `waitForTimeout(3000)` 中にページジャンプが完了し、その後のビューポートイベントハンドラーが何らかの理由でヘッダーを再び `hidden` 状態に戻してしまっている（スクロール位置変化に連動した自動隠し動作）。

2. **ヘッダー自動隠しロジックとのレースコンディション**: `IntersectionObserver` または `PAGE_CHANGED` イベント後のスクロール処理がヘッダーを再び自動的に隠し、その後の `#reader-viewport` クリックでの再表示が機能しない。

3. **ページジャンプ後の状態管理バグ**: `secondTOCItem.click()` によるページジャンプ後、ヘッダーの `hidden` 解除トリガーである `#reader-viewport` のクリックイベントリスナーが適切に機能していない。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: `#reader-viewport` クリック前に `page.waitForTimeout` を追加してヘッダー自動隠しが完了するのを待つ（ただし根本解決にはならない）。
* **恒久対策 (Permanent Fix)**: ヘッダーの `hidden` クラス制御ロジックを調査し、`#reader-viewport` クリックで確実にヘッダーが表示される状態になるよう修正する。または E2E テストのクリック後に `toHaveClass` でヘッダーが `hidden` でなくなるまで待機する。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/143-fix-ci-toc-header-hidden-after-jump`

1. `src/js/` のヘッダー表示ロジックを調査し、`#reader-viewport` クリックイベントハンドラーを特定する。
2. `PAGE_CHANGED` イベントやスクロール後のヘッダー自動隠し処理と、クリックによる表示処理の順序を確認する。
3. ヘッダー状態の競合を解消する修正を実施する（詳細は polish-issue フェーズで確定）。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/viewer.spec.js` の `should observe headings and render TOC chunked progressive list` テストが CI/CD 環境で安定してパスすること。
- [ ] ローカルおよび CI の E2E テスト全件 (`npm run test:e2e`) がパスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`
