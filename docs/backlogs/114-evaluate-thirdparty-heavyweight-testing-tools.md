---
ID: 114
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] 高度パフォーマンス・ストレステストツールの評価およびCDPプロファイル計測の導入 (ID: 114)

## 1. 概要 / Summary
超大容量書籍（50,000行以上の青空文庫テキスト）や連続ページめくり時におけるメモリリーク (`JSHeapUsedSize`)、レイアウトシフト (CLS)、およびフレーム描画時間 (FPS / Frame Budget) をミリ秒・バイト精度で動的プロファイル計測するための高度テスト手法を評価・選定します。[MNG-00](../../MNG-00-development_philosophy.md) の「プロダクションコード無依存・ゼロランタイム追加」原則を厳格遵守し、Playwright の Chrome DevTools Protocol (CDP) プロファイリング機能や Lighthouse CI などの開発専用ツールの適用可能性を検証します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [package.json](../../package.json) — 開発・計測用スクリプト定義
- [ ] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — CDPプロファイルアサーションの実装
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. **プロダクション非侵入型の動的計測 (Non-Intrusive Profiling)**:
   プロダクションの JavaScript コード (`src/js/` および `main-min.js`) に計測用外部ライブラリを一切同梱せず、Playwright が標準提供する Chrome DevTools Protocol (CDP) API (`CDPSession`) を通じてブラウザエンジンの Heap メモリ・レイアウトトレース情報を直接収集します。
2. **評価対象手法のフィジビリティ比較**:
   - **候補 A: Playwright CDP Session (`Performance.getMetrics`)**: 追加 npm パッケージゼロ。`JSHeapUsedSize`, `LayoutCount`, `RecalculateStyleCount` を低オーバーヘッドで直接計測。
   - **候補 B: Lighthouse CI (Lhci)**: 開発用 CLI ツール。PWA性能・アクセシビリティ・Web Vitals の自動スコアリング。

---

## 4. 要件と技術詳細 / Technical Requirements
- Playwright E2E テスト環境において `const client = await page.context().newCDPSession(page);` を利用し、`Performance.enable` 経由でメモリ領域およびリフロー回数のメトリクスを取得・検証するプロトタイプを作成する。
- 大容量テキスト読み込み前後での `JSHeapUsedSize` の増分（デルタ）を測定し、メモリリークが発生していないことを評価する指標を確立する。
- 開発専用（`devDependencies` または CLI `npx` 実行）にとどめ、本番バンドルサイズおよびクライアント動作速度への影響をゼロとすること。

---

## 5. 完了条件 (DoD) / Acceptance Criteria

### 5.1 要件・設計承認条件 (Approved条件)
- [x] サードパーティ製計測ツールおよび CDP プロファイリング手法の比較評価が完了し、設計方針が確立されていること。
- [x] 本プロダクトのゼロ依存原則 ([MNG-00](../../MNG-00-development_philosophy.md)) を維持した計測手法が選定され、バックログが `Approved` 状態に更新されていること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に同期していること。

### 5.2 実装・検証完了条件 (Closed条件 / 今後のIssue実装時)
- [x] Playwright E2E テスト環境において CDP Session (`Performance.enable`) 経由でメモリ領域およびリフロー回数のメトリクスを取得・アサートするスクリプトが実装されていること。（Issue 136: JSHeapUsedSize, Issue 144: LayoutCount/RecalculateStyleCount）
- [x] 大容量テキスト読み込み前後での `JSHeapUsedSize` メモリリーク検証が自動テスト内でパスすること。（Issue 136 実装済み・15MB閾値アサート）
- [x] `npm run test:e2e` パイプラインに統合され、エラーなく実行完了すること。（`npm run test:e2e` に全 CDP テスト統合済み）
