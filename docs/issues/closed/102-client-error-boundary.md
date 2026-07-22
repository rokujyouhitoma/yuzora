---
ID: 102
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] クライアントサイドでのエラー境界と診断レポート出力 (ID: 102)

## 1. 概要 / Summary
パースエラーやレンダリング時の例外処理が発生した場合に、画面全体がフリーズするのを防ぐ「エラー境界（ErrorBoundary / 安全停止機構）」を導入します。また、予期せぬエラー時に、ユーザー環境のブラウザ情報、エラーログ、および再現のための操作履歴（Command History）をまとめた「診断レポート」をワンクリックでローカルエクスポートできる仕組みを提供します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.4 エラー境界・診断レポート
- 関連バックログ: [080-client-error-boundary.md](../backlogs/080-client-error-boundary.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [diagnostics.js](../../src/js/modules/core/diagnostics.js)
- [ ] [yuzora.js](../../src/js/modules/core/yuzora.js)
- [ ] [types.d.ts](../../src/js/types.d.ts)
- [ ] [externs.js](../../src/externs.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enh/102-client-error-boundary`

1. **ErrorBoundary ロジックの実装 (`diagnostics.js`)**:
   - `ErrorBoundary` クラスを実装。大域的な `onerror` / `unhandledrejection` リスナーを登録し、例外ハンドリングを実施。
   - `exportDiagnosticReport` メソッドを実装し、エラーログ、環境情報、CommandHistory を含む JSON レポートを出力。
2. **型定義と Closure Compiler の同期 (`types.d.ts`, `externs.js`)**:
   - `ErrorBoundary` の型定義と externs ルールを追加。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `ErrorBoundary` クラスが正常に動作し、キャッチしたエラーログを保存できること。
- [ ] 診断レポートのエクスポート機能が実装され、ユニットテストで検証されること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
