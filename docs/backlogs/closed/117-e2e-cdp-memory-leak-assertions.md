---
ID: 117
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] Playwright CDP Session 経由での JSHeapUsedSize メモリリーク自動検証 (ID: 117)

## 1. 概要 / Summary
Playwright の Chrome DevTools Protocol (`CDPSession`) API (`Performance.getMetrics`) を活用し、大容量書籍の連続ロードおよび画面破棄時における `JSHeapUsedSize` メモリ増分（デルタ）が許容閾値以下に留まることを自動アサーションし、メモリリークを未然に防止します。[MNG-00](../../MNG-00-development_philosophy.md) に適合するプロダクション非侵入型の動的プロファイル検証です。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — CDP メモリ増分アサーションの追加
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. `const client = await page.context().newCDPSession(page);` を生成し、`await client.send('Performance.enable');` を呼び出す。
2. 初期状態の `JSHeapUsedSize` メトリクスを取得。
3. 大容量書籍のロード・破棄・再ロードを連続実行。
4. 最終状態の `JSHeapUsedSize` と初期値の差分（デルタ）を計算し、許容範囲（例: 8MB以内）であることをアサート。

---

## 4. 要件と技術詳細 / Technical Requirements
- 追加の npm パッケージを導入せず、Playwright 標準の `CDPSession` を利用する。
- ガベージコレクションの影響を考慮し、複数回ロード後の安定状態を計測する。

---

## 5. 完了条件 (DoD) / Acceptance Criteria

### 5.1 要件・設計承認条件 (Approved条件)
- [x] CDP メモリ計測メトリクス (`JSHeapUsedSize`) の取得手順と閾値基準が確立されていること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に更新されていること。

### 5.2 実装・検証完了条件 (Closed条件 / 今後のIssue実装時)
- [x] `tests/e2e/viewer.spec.js` に CDP メモリリーク検証テストケースが実装されていること。
- [x] 書籍の連続ロード・解体後における Heap メモリ増分アサーションが 100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
