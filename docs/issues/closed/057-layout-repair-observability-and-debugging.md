---
ID: 057
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] レイアウト自己修復の観測機能と視覚的デバッグ補助の導入 (ID: 057)

## 1. 概要 / Summary
自己修復レイアウトエンジン（ID: 048 / Issue 056）の動作状況を定量的に検証・監視し、不具合時の原因特定を容易にするため、統計データ（テレメトリ）の収集、診断レポートへの出力、および開発環境向けの視覚的デバッグ補助スタイルの適用を行います。

本Issueは、バックログ [050-layout-repair-observability-and-debugging.md](../backlogs/050-layout-repair-observability-and-debugging.md) をプロモートしたものです。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連バックログ: [050-layout-repair-observability-and-debugging.md](../backlogs/050-layout-repair-observability-and-debugging.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [event.js](../../src/js/modules/event.js) (MODIFY: 新規イベントタイプ `LAYOUT_REPAIRED` の追加)
- [ ] [renderer.js](../../src/js/modules/renderer.js) (MODIFY: 自己修復ループ完了時の統計メトリクス保持、および `LAYOUT_REPAIRED` イベント発行)
- [ ] [diagnostics.js](../../src/js/modules/diagnostics.js) (MODIFY: レイアウト診断レポートへの自己修復統計の埋め込み)
- [ ] [reader.css](../../src/css/modules/reader.css) (MODIFY: デバッグ補助線表示スタイルの追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/057-layout-repair-observability-and-debugging`

1. **イベント定義の追加**:
   - `event.js` の `YuzoraEventType` に `LAYOUT_REPAIRED: 'system:layout-repaired'` を追加する。
2. **自己修復統計（テレメトリ）の収集とイベント発行**:
   - `VerticalRenderer` での自己修復ループ完了時に `passesCount`（判定パス数）、`insertedCount`（挿入数）、`durationMs`（ミリ秒時間）を算出し、`lastRepairMetrics` に保持する。
   - `yuzora.publisher.publish(YuzoraEventType.LAYOUT_REPAIRED, metrics)` 経由でシステムへ通知する。
3. **レイアウト診断レポートの拡張**:
   - `runLayoutDiagnosis()` 内で `VerticalRenderer` から最新の自己修復統計を取得し、診断レポート末尾に自己修復結果（パス数、挿入改ページ数、実行時間）を出力する項目を追加。
4. **デバッグ用「自動改ページ位置」の視覚的強調表示**:
   - `reader.css` にて、アプリがデバッグモードである場合（例: `#app` に `.debug-layout` クラスが存在する等の状態）、`.dynamic-page-break` に赤い境界点線と「✂［自動改ページ位置］」というラベルがフローティング表示されるデバッグ用スタイルを実装する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 自己修復処理終了時に、統計ペイロードを伴う `LAYOUT_REPAIRED` ドメインイベントが正しくパブリッシュされること。
- [ ] デバッグ補助線表示をオンにした際、動的に挿入された自動改ページ要素の位置が赤い点線とハサミアイコンのツールチップで視覚的に強調表示されること。
- [ ] `runLayoutDiagnosis()` の出力結果レポートに、最新の自己修復メトリクス（実行パス、挿入された改ページ数、ミリ秒）が出力されること。
- [ ] 本実装の内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（デッドドキュメントがないこと）。
