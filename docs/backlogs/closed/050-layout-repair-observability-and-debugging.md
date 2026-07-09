---
ID: 050
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] レイアウト自己修復の観測機能と視覚的デバッグ補助の導入 (ID: 050)

## 1. 概要 / Summary
自己修復レイアウトエンジン（ID: 048）の動作状況を定量的に検証・監視し、不具合時の原因特定を容易にするため、統計データ（テレメトリ）の収集、診断レポートへの出力、および開発環境向けの視覚的デバッグ補助スタイルの適用を行います。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [renderer.js](../../src/js/modules/renderer.js) (MODIFY: 自己修復ループ完了時の統計メトリクス保持、および `LAYOUT_REPAIRED` イベント発行)
- [ ] [diagnostics.js](../../src/js/modules/diagnostics.js) (MODIFY: レイアウト診断レポートへの自己修復統計の埋め込み)
- [ ] [reader.css](../../src/css/modules/reader.css) (MODIFY: デバッグ補助線表示スタイルの追加)

---

## 3. 実装方針 / Implementation Plan
1. **自己修復統計（テレメトリ）の収集とイベント発行**:
   - `VerticalRenderer` での自己修復ループ完了時に `passesCount`（判定パス数）、`insertedCount`（挿入数）、`durationMs`（ミリ秒時間）を算出し、`yuzora.publisher.publish(YuzoraEventType.LAYOUT_REPAIRED, { ... })` 経由でシステムへ通知する。
2. **レイアウト診断レポートの拡張**:
   - `runLayoutDiagnosis()` 内でレンダラーから最新の自己修復統計を取得し、診断レポート末尾に自己修復結果（パス数、挿入改ページ数、実行時間）を出力する項目を追加。
3. **デバッグ用「自動改ページ位置」の視覚的強調表示**:
   - `reader.css` にて、ボディ要素にデバッグ属性がある場合（例: `#app` にデバッグ用のクラスが存在する等の状態）、`.dynamic-page-break` に赤い境界点線と「✂［自動改ページ位置］」というラベルがフローティング表示されるデバッグ用スタイルを実装する。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] 自己修復処理終了時に、統計ペイロードを伴う `LAYOUT_REPAIRED` ドメインイベントが正しくパブリッシュされること。
- [ ] デバッグ補助線表示をオンにした際、動的に挿入された自動改ページ要素の位置が赤い点線とハサミアイコンのツールチップで視覚的に強調表示されること。
- [ ] `runLayoutDiagnosis()` の出力結果レポートに、最新の自己修復メトリクス（実行パス、挿入された改ページ数、ミリ秒）が出力されること。
