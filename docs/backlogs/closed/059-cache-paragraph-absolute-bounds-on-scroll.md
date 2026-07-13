---
ID: 059
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] 段落のドキュメント絶対座標キャッシュ導入によるページ遷移判定 of 高速化 (ID: 059)

## 1. 概要 / Summary
ページめくり（遷移）完了時に実行されるはみ出し軽量チェック（`hasOverrunNearCurrentPage`）において、スクロールのたびに全段落の `getBoundingClientRect` を呼び出して境界との交差判定を行っているため、Layout Thrashing が発生しページ遷移や入力反応がもたつく問題を解決します。
レイアウト確定時（ロード・リサイズ・修復完了時）に、各段落の「ドキュメント左端からの絶対座標」を一括で計算してキャッシュし、ページ遷移時はこのメモリキャッシュを参照することで、`getBoundingClientRect` の呼び出しを完全に回避し、判定処理を 0ms に近づけます。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [src/js/modules/renderer.js](../../src/js/modules/renderer.js)
  - `paragraphBoundsCache` のプロパティ追加
  - `cacheParagraphBounds()` メソッドの追加
  - `adjustPageBreaksForOverrun` の終了時にキャッシュを再構築する処理の追加
  - `checkBoundariesForChildren` で `getBoundingClientRect` の代わりにキャッシュを参照する処理の追加
- [src/js/types.d.ts](../../src/js/types.d.ts)
  - `RendererInterface` や関連する型定義への追加
- [src/externs.js](../../src/externs.js)
  - Closure Compiler 向けのプロパティマッピングの追加

---

## 3. 要件と技術的詳細 / Requirements and Technical Details

### 3.1 キャッシュの管理ライフサイクル
各段落のドキュメント絶対座標（`docLeft = rect.left + absScroll`, `docRight = rect.right + absScroll`）は、スクロール動作中には一切変化しません。変化するのは以下のタイミングのみです。
- 新しい書籍のロード完了時
- ウィンドウのリサイズ完了時
- 表示設定（フォント、フォントサイズ、行間、文字間隔）の変更時
- はみ出し修復に伴い動的改ページ（`.page-break`）が挿入または削除されたとき

そのため、これらのレイアウト変更が完了した最後のタイミング（＝`adjustPageBreaksForOverrun` の処理終了直後）でキャッシュを一括構築（`cacheParagraphBounds`）します。

### 3.2 キャッシュを使用した高速交差判定
`hasOverrunNearCurrentPage()` の判定フローを以下のように見直します。
1. 現在の表示ページに基づき、チェック対象となる境界のX座標リスト（`boundaries`）を計算する。
2. キャッシュが存在しない場合はその場で構築する。
3. `boundaries` の各境界 `boundaryX` に対し、`paragraphBoundsCache` を走査して、`docLeft < boundaryX && docRight > boundaryX` となる段落があるかを判定する。
   - この段階では `getBoundingClientRect()` を一切呼び出しません。
4. 交差する段落が見つかった場合のみ、その段落に対してピンポイントで `findCharAtDocumentBoundary` を呼び出して文字レベルのはみ出しを確認する。
5. これにより、ページ遷移中の Layout Thrashing を完全に排除し、判定ロジックの実行時間を 0.1ms 程度に削減します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [x] ページ遷移完了後の `hasOverrunNearCurrentPage` の処理時間が 1ms 以下に削減されること。
- [x] ページめくりおよびスクロールスナップの動作中にカクつきが発生しないこと。
- [x] テストスイート（`tests/unit/renderer.test.js` など）がすべてパスすること。
- [x] `make` による Closure Compiler のビルドがエラーなしで完了すること。
