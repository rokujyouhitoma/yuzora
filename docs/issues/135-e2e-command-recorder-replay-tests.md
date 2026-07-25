---
ID: 135
種別: Enhancement
優先度: High
ステータス: Open (In Progress)
---

# [Enhancement] 内蔵コマンドレコーダーを活用した E2E 決定論的シナリオテストの導入 (ID: 135)

## 1. 概要 / Summary
Yuzora の独自基盤である `UICommandRecorder` および `UICommandReplayer` (`src/js/modules/core/commands.js`) を活用し、決定論的な操作コマンドシーケンス（ページ繰り、フォントサイズ変更、テーマ切替、TOCジャンプ）を Playwright E2E テスト内で直接再生し、状態の整合性を自動検証します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — コマンドリプレイシナリオテストの追加
- [x] [README.md](README.md) — Issue台帳の更新

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
複雑なユーザー対話イベント（テーマトグル・フォントサイズ変更等）を非同期内部イベント駆動で再現テスト可能にし、Closure Compiler による難読化適用後（`test:e2e:compiled`）においても状態変化が正常にディスパッチされることを保証します。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  `tests/e2e/viewer.spec.js` にて `UICommandReplayer` を呼び出し、一連のコマンドログを連続実行後、DOM クラスおよび表示仕様の追従を自動アサーションする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `feat/135-e2e-command-recorder-replay-tests`

1. `tests/e2e/viewer.spec.js` に `test('E2E Deterministic Scenario Replay Test', ...)` を追加。
2. ページネーション・テーマ変更・フォントサイズ変更イベントの再生と状態追従をアサート。
3. `npm run healthcheck` で 100% グリーン通過を確認。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] コマンド決定論的再生 E2E テストが実装され、100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
- [x] 実装内容が [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

---

## 7. トレーサビリティ / Traceability Matrix
- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
