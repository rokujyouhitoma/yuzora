---
ID: 137
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] WAI-ARIA 属性およびキーボードフォーカス制御の E2E 自動検証 (ID: 137)

## 1. 概要 / Summary
読書画面およびドロワー UI において、`Tab`, `Escape`, 矢印キー操作時のフォーカス移動制御、および `aria-expanded` / `aria-hidden` / `aria-label` 属性の状態変化を Playwright E2E テストで自動アサーションし、アクセシビリティの回帰を防止します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — キーボード & ARIA 属性 E2E アサーションの追加
- [x] [README.md](README.md) — Issue台帳の更新

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
キーボード操作のみでのシステム操作性（スクリーンリーダー親和性含む）を自動テストの監視対象とし、アクセシビリティ仕様の退行を防止します。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  `tests/e2e/viewer.spec.js` にて `page.keyboard.press()` で操作を送信し、フォーカス状態および `aria-*` 属性の変化をテストアサートする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `feat/137-e2e-keyboard-accessibility-assertions`

1. `tests/e2e/viewer.spec.js` に `test('E2E Accessibility & Keyboard Focus Navigation Guard', ...)` を追加。
2. ドロワー開閉時の `aria-expanded` / `aria-hidden` およびフォーカス移動を検証。
3. `npm run healthcheck` で 100% グリーン通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] キーボードアクセシビリティ E2E テストが実装され、100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix
- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
