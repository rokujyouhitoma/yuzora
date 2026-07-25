---
ID: 116
種別: Enhancement
優先度: High
ステータス: Closed
---

# [Enhancement] 内蔵コマンドレコーダーを活用した E2E 決定論的シナリオテスト (ID: 116)

## 1. 概要 / Summary
Yuzora の独自基盤である `UICommandRecorder` および `UICommandReplayer` (`src/js/modules/core/commands.js`) を活用し、決定論的な操作コマンドシーケンス（ページ繰り、フォントサイズ変更、テーマ切替、TOCジャンプ）を Playwright E2E テスト内で直接再生し、状態の整合性を自動検証します。プロダクションコードを変更せず、既存のコマンドディスパッチ層を利用します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — コマンドリプレイシナリオテストの追加
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. `UICommandReplayer` に事前定義されたコマンドログ (`[ { type: 'NEXT_PAGE' }, { type: 'CHANGE_FONT_SIZE', size: 18 }, { type: 'TOGGLE_THEME', theme: 'dark' } ]`) を渡す。
2. Playwright の `page.evaluate()` 経由でリプレイを実行し、各コマンド適用後の DOM 状態・クラス（例: `theme-dark`, フォントサイズ CSS プロパティ）が正しく変化したことをアサート。

---

## 4. 要件と技術詳細 / Technical Requirements
- `window.Yuzora.replayer` または `UICommandReplayer` インスタンスにアクセスし、非同期再生を実行。
- コマンド適用完了後に画面の崩れや非同期エラーが発生しないことを自動検証。

---

## 5. 完了条件 (DoD) / Acceptance Criteria

### 5.1 要件・設計承認条件 (Approved条件)
- [x] コマンドリプレイテストのシリアライズ形式と検証手順が確定していること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に更新されていること。

### 5.2 実装・検証完了条件 (Closed条件 / 今後のIssue実装時)
- [x] `tests/e2e/viewer.spec.js` にコマンド決定論的再生テストケースが実装されていること。
- [x] リプレイ実行後のテーマ・フォント・ページ状態アサーションが 100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
