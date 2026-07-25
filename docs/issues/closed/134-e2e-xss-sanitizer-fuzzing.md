---
ID: 134
種別: Security
優先度: High
ステータス: Closed
---

# [BUG/SEC] E2Eテストにおけるインライン HTML サニタイズ・XSS ファジング検証の導入 (ID: 134)

## 1. 概要 / Summary
Playwright E2Eテストスイートにおいて、青空文庫テキストのルビ・注記・見出し内に悪意ある HTML/JavaScript ペイロード（`<script>`, `onerror=`, `javascript:`, `<svg/onload>` 等）を含んだコンテンツを動的注入し、`AozoraEvaluator` および `VerticalRenderer` のサニタイズ処理が完全に無力化・保護することを自動検証します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — インライン XSS ファジング E2E アサーションの追加
- [x] [README.md](README.md) — Issue台帳の更新

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
単体テストにおける `DOMPurify` および `escapeHTML` 単独の検証に加え、E2E ブラウザ環境（Chromium リアルレンダリングエンジン）上でのインライン HTML 注入に対するサニタイズ・エスケープ結果の最終防御層自動チェックを強化します。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  `tests/e2e/viewer.spec.js` 内に動的 XSS 注入テストシナリオを追加し、`window.__xssTriggered__` が呼び出されないこと、およびノード内容が安全に描画されることをアサートする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/134-e2e-xss-sanitizer-fuzzing`

1. `tests/e2e/viewer.spec.js` に `test('E2E XSS Sanitization & Inline Payload Fuzzing Guard', ...)` を追加。
2. `<script>window.__xssTriggered__=true</script>`, `<img src=x onerror="window.__xssTriggered__=true">`, `<a href="javascript:window.__xssTriggered__=true">` ペイロードの安全性を検証。
3. `npm run healthcheck` で 100% グリーン通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] インライン XSS 攻撃ケースにおいてスクリプト実行が阻止され、E2Eテストがパスすること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix
- **要件**: [REQ-03](../../requirements/REQ-03-software_requirements_specification.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
