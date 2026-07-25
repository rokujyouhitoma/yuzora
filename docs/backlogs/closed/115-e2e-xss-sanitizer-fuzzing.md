---
ID: 115
種別: Enhancement
優先度: High
ステータス: Closed
---

# [Enhancement] E2Eテストにおけるインライン HTML サニタイズ・XSS ファジング検証 (ID: 115)

## 1. 概要 / Summary
Playwright E2Eテストスイートにおいて、青空文庫テキストのルビ・注記・見出し内に悪意ある HTML/JavaScript ペイロード（`<script>`, `onerror=`, `javascript:`, `<svg/onload>` 等）を含んだコンテンツを動的注入し、`AozoraEvaluator` および `VerticalRenderer` のサニタイズ処理が完全に無力化・保護することを自動検証します。[MNG-00](../../MNG-00-development_philosophy.md) に基き、完全クライアントサイド環境における DOM XSS 堅牢性を強化します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — インライン XSS ファジング E2E アサーションの追加
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. `tests/e2e/viewer.spec.js` 内に XSS ペイロード群（スクリプトタグ、イベントハンドラ属性、危険なプロトコル URL）を定義。
2. Playwright の `page.evaluate()` または動的 DOM 構築経由で描画領域 (`#reader-viewport`) へ注入。
3. `window.__xssTriggered__` フラグやスクリプト実行が発生していないこと、かつエスケープ・サニタイズされた安全なテキストとして描画されていることをアサート。

---

## 4. 要件と技術詳細 / Technical Requirements
- `<script>window.__xssTriggered__=true</script>`, `<img src=x onerror="window.__xssTriggered__=true">`, `<a href="javascript:window.__xssTriggered__=true">` を注入ターゲットとする。
- 注入後、`window.__xssTriggered__` が `undefined` または `false` であることをアサート。
- `npm run test:e2e` および `npm run healthcheck` パイプラインに統合する。

---

## 5. 完了条件 (DoD) / Acceptance Criteria

### 5.1 要件・設計承認条件 (Approved条件)
- [x] インライン XSS ファジングアプローチおよび検証対象ペイロードが明確化されていること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に更新されていること。

### 5.2 実装・検証完了条件 (Closed条件 / 今後のIssue実装時)
- [x] `tests/e2e/viewer.spec.js` に XSS サニタイズ動的検証テストケースが実装されていること。
- [x] すべての XSS 攻撃ケースにおいてスクリプト実行が阻止され、テストが 100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
