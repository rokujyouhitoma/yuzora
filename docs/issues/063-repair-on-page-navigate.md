---
ID: 063
種別: Feature
優先度: High
ステータス: Open (In Progress)
---

# [FEAT] ページ移動後にはみ出し検査を行い、問題があればレイアウトを自己修復する (ID: 063)

## 1. 概要 / Summary

現在、`adjustPageBreaksForOverrun()` は書籍ロード直後とウィンドウリサイズ時にのみ呼ばれており、**ページ移動（`nextPage()` / `prevPage()` / TOCジャンプ）後には呼ばれない**。
そのため、ページ移動後に新たにページ境界をまたぐ段落が現れても自動修復されない。

`scrollToPage()` の完了後、現在ページの境界付近に overrun がないかを軽量に検査し、検出された場合のみ `adjustPageBreaksForOverrun()` を実行して自己修復する。

### 再現手順
1. 書籍を開く。
2. 数ページ移動する。
3. ページ境界上に文字が見切れている可能性があるがレイアウト修復が走らない。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) — `hasOverrunNearCurrentPage()` 新メソッド追加
- [ ] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) — `scrollToPage()` の `.then()` に呼び出し追加
- [ ] [src/js/types.d.ts](../../src/js/types.d.ts) — `RendererInterface` に型定義追加
- [ ] [src/externs.js](../../src/externs.js) — Closure Compiler 用 extern 追加
- [ ] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md) — セクション 1.2.11/1.2.12 に新メソッドを追記

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

`scrollToPage()` は smooth scroll の完了後に `updateProgress()` と `saveBookmark()` のみを実行しており、レイアウト修復チェックが含まれていない。
修復メソッド `adjustPageBreaksForOverrun()` は全境界をスキャンして DOM を書き換えるため、毎回ページ移動時に呼ぶのはコストが高い。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処**: なし
* **恒久対策**: 現在ページ境界に限定した軽量な読み取り専用チェック (`hasOverrunNearCurrentPage()`) を追加し、overrun 検出時にのみ `adjustPageBreaksForOverrun()` を呼ぶ。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `feat/063-repair-on-page-navigate`

### Step 1: `renderer.js` — `hasOverrunNearCurrentPage()` メソッドを追加

`VerticalRenderer` クラスに新しい読み取り専用メソッドを追加する。

- 現在ページの両隣の境界 (`(currentPage-1)*clientWidth` と `currentPage*clientWidth`) をチェック対象とする。
- `getBoundingClientRect()` を使って各子要素が境界をまたいでいるかを確認する。
- 境界またぎの候補が見つかった場合は `findCharAtDocumentBoundary()` で文字レベル確認を行い、真の overrun かを判定する（偽陽性排除）。
- DOM の書き換えは一切行わない（read-only check）。

### Step 2: `viewer.js` — `scrollToPage().then()` に検査と修復を追加

```js
renderer.scrollToPage(pageNumber).then(() => {
    viewContext.isReflowing = false;
    if (renderer.hasOverrunNearCurrentPage()) {
        renderer.adjustPageBreaksForOverrun();
    }
    const maxScroll = ...;
    bookmarkModel.bookmarkProgress = ...;
    updateProgress();
    saveBookmark();
});
```

### Step 3: 型定義・extern の更新

- `types.d.ts`: `RendererInterface` に `hasOverrunNearCurrentPage(): boolean;` を追加
- `externs.js`: `RendererInterface.prototype.hasOverrunNearCurrentPage` を追加

### Step 4: DSN-02 更新

セクション 1.2.11 (`RendererInterface`) と 1.2.12 (`VerticalRenderer`) に新メソッドを追記する。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] ページ移動後に overrun がある場合、`adjustPageBreaksForOverrun()` が自動的に呼ばれること。
- [ ] overrun がない場合、`adjustPageBreaksForOverrun()` が呼ばれないこと（不要な DOM 書き換えをしない）。
- [ ] すべての E2E テスト (`npm run test:e2e`) が正常にパスすること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に整合していること。
