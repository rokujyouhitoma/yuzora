---
ID: 093
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] 大容量テキストのインクリメンタルパースおよびレンダリング (ID: 093)

## 1. 概要 / Summary
大容量の青空文庫テキスト（1MB以上など）を読み込む際、全行を一括でパース・レンダリングすることで発生するメインスレッドのフリーズ（画面ハングアップ）を解消するため、テキストのブロック解析・評価を一定チャンク単位にタイムスライス（`requestIdleCallback` 等）で非同期実行し、最初のチャンクを最速表示するとともに、残りのコンテンツをインクリメンタルに追記していく仕組みを導入する。

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01-user_requirements.md](../requirements/REQ-01-user_requirements.md)
- 関連要件 (SRD): [REQ-03-system_requirements.md](../requirements/REQ-03-system_requirements.md)
- 関連バックログ: [007-incremental-text-parsing.md](../backlogs/007-incremental-text-parsing.md)

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [parser.js](../../src/js/modules/parser/parser.js)
- [x] [renderer.js](../../src/js/modules/ui/renderer.js)
- [x] [viewer.js](../../src/js/modules/ui/viewer.js)

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/093-incremental-text-parsing`

1. `AozoraParser` に `parseAozoraTextIncremental(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel)` メソッドを新設する。
   - 内部で 500 ブロック処理するごとに `requestIdleCallback` (または `setTimeout`) でウェイトを挟むことで、メインスレッドのブロッキングを防ぐ。
2. `VerticalRenderer` に `appendRender(htmlContent)` メソッドを追加し、既存の HTML コンテンツの末尾に新たな HTML を安全に追記する。
3. `viewer.js` の `displayBook()` をインクリメンタル対応に修正し、最初のチャンク（500行分とカバーページ）で画面遷移・しおり復旧を即座に行い、残りのチャンクを非同期追記していく。
4. 全チャンクの追記完了後にレイアウト自己修復 (`adjustPageBreaksForOverrun`) を 1 回実行する。
5. 読込中の別本ロード時には、`currentLoadId !== loadId` に基づいて先行する非同期処理を速やかに中断する。

## 5. 完了条件 / Success Criteria (DoD)
- [x] 1MB超の大容量書籍を開いた際、フリーズすることなく1秒未満で最初のページが表示されること。
- [x] バックグラウンドで残りのパース・追記が走っている間も、ページのめくりや設定変更が60FPSでスムーズに動作すること。
- [x] すべてのE2Eテストおよびユニットテストが退行バグなくパスすること。
