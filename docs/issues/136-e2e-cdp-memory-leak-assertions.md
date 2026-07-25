---
ID: 136
種別: Enhancement
優先度: Medium
ステータス: Open (In Progress)
---

# [Enhancement] Playwright CDP Session 経由での JSHeapUsedSize メモリリーク自動検証 (ID: 136)

## 1. 概要 / Summary
Playwright の Chrome DevTools Protocol (`CDPSession`) API (`Performance.getMetrics`) を活用し、大容量書籍の連続ロードおよび画面破棄時における `JSHeapUsedSize` メモリ増分（デルタ）が許容閾値以下に留まることを自動アサーションし、メモリリークを未然に防止します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — CDP メモリ増分アサーションの追加
- [x] [README.md](README.md) — Issue台帳の更新

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
大容量テキストの動的解体・再レンダリング時における JavaScript ヒープメモリの累積増分を、プロダクションコード無侵入・外部依存ゼロの標準ブラウザ API (`CDPSession`) で定量アサート可能にします。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  `tests/e2e/viewer.spec.js` 内で `newCDPSession` を開始し、`Performance.enable` 経由で書籍読み込み前後の `JSHeapUsedSize` 増分が健全な範囲内に収まることをアサートする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `feat/136-e2e-cdp-memory-leak-assertions`

1. `tests/e2e/viewer.spec.js` に `test('E2E Playwright CDP Session Memory Leak Guard', ...)` を追加。
2. `Performance.getMetrics` から `JSHeapUsedSize` を抽出し、メモリ増分（デルタ）をアサート。
3. `npm run healthcheck` で 100% グリーン通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] CDP メモリ増分アサーション E2E テストが実装され、100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix
- **要件**: [REQ-02](../../requirements/REQ-02-non_functional_requirements_specification.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
