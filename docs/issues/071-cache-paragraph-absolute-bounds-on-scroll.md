---
ID: 071
種別: Refactor
優先度: High
ステータス: Open (In Progress)
---

# [FEAT/ENH] 段落のドキュメント絶対座標キャッシュ導入によるページ遷移判定の高速化 (ID: 071)

## 1. 概要 / Summary
ページめくり（遷移）完了時に実行されるはみ出し軽量チェック（`hasOverrunNearCurrentPage`）において、スクロールのたびに全段落の `getBoundingClientRect` を呼び出して境界との交差判定を行っているため、Layout Thrashing が発生しページ遷移や入力反応がもたつく問題を解決します。
レイアウト確定時（ロード・リサイズ・修復完了時）に、各段落の「ドキュメント左端からの絶対座標」を一括で計算してキャッシュし、ページ遷移時はこのメモリキャッシュを参照することで、`getBoundingClientRect` の呼び出しを完全に回避し、判定処理を 0ms に近づけます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (スムーズな操作性)
- 関連要件 (SRD): REQ-03-SRD-05 (パフォーマンス制御)
- 関連バックログ: [059-cache-paragraph-absolute-bounds-on-scroll.md](../backlogs/059-cache-paragraph-absolute-bounds-on-scroll.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [src/js/modules/renderer.js](../../src/js/modules/renderer.js)
  - `paragraphBoundsCache` プロパティの追加
  - `cacheParagraphBounds()` メソッドの追加
  - `adjustPageBreaksForOverrun()` 終了時のキャッシュ構築呼び出し
  - `checkBoundariesForChildren()` の判定ロジックでキャッシュを参照するようにリファクタリング
- [ ] [src/js/types.d.ts](../../src/js/types.d.ts)
  - `RendererInterface` や `VerticalRenderer` クラス定義、およびキャッシュ用オブジェクトの型定義の追加
- [ ] [src/externs.js](../../src/externs.js)
  - Closure Compiler 向けに新規追加プロパティ (`paragraphBoundsCache`, `docLeft`, `docRight`, `cacheParagraphBounds`) の extern 宣言を追加
- [ ] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md)
  - セクション 1.2.12 の軽量境界診断メソッド `hasOverrunNearCurrentPage()` の説明に、絶対座標キャッシュ機構の記述を追記

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/071-cache-paragraph-absolute-bounds`

1. **設計書の修正**:
   - [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) のセクション 1.2.12 の設計説明に、スクロール量に依存しない絶対座標をキャッシュし、ページ遷移時には `getBoundingClientRect` を呼び出さずに交差判定を行うキャッシュ機構の仕組みを追加する。

2. **型定義と extern の追加**:
   - `src/js/types.d.ts` に `paragraphBoundsCache` の型定義と `cacheParagraphBounds` のメソッドインターフェースを追加。
   - `src/externs.js` に `paragraphBoundsCache`, `docLeft`, `docRight`, `cacheParagraphBounds` を追記し、コンパイル後の難読化によるバグを防止する。

3. **`renderer.js` の修正**:
   - `VerticalRenderer` の `constructor` で `this.paragraphBoundsCache = [];` を定義。
   - `cacheParagraphBounds()` メソッドを新規実装する：
     - `readerContent.children` のうち改ページや空行を除いた要素を走査し、`rect = child.getBoundingClientRect()` から `docLeft = rect.left + absScroll`, `docRight = rect.right + absScroll` を取得。
     - オブジェクト配列 `{ element: child, docLeft, docRight }` を構築し、`this.paragraphBoundsCache` にキャッシュする。
   - `adjustPageBreaksForOverrun()` の終了時（`this.lastRepairMetrics = ...` の直前）で `this.cacheParagraphBounds()` を呼び出し、最新レイアウトのキャッシュを構築する。
     - なお、キャッシュクリア処理は `adjustPageBreaksForOverrun` の先頭などで行うか、`cachedScrollWidth = null` のタイミングで `this.paragraphBoundsCache = []` にクリアするようにする。
   - `checkBoundariesForChildren()` を修正：
     - キャッシュが未構築（空）の場合は、フォールバックとして `this.cacheParagraphBounds()` を呼び出して構築する。
     - `children` のループの代わりに `this.paragraphBoundsCache` を走査し、`docLeft < boundaryX && docRight > boundaryX` となる段落があるかを判定する（この段階での `getBoundingClientRect` の呼び出しを完全に排除）。
     - 条件を満たす段落がある場合のみ、ピンポイントで `findCharAtDocumentBoundary(cache.element, boundaryX, ...)` を呼び出して文字レベルのはみ出しを確認する。

4. **テスト実行**:
   - `npm run test:unit` を実行。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] ページ遷移完了後の `hasOverrunNearCurrentPage` の処理時間が 1ms 以下に削減されること。
- [ ] 「地の巻」などの大容量書籍で、ページ遷移（めくり・スナップ）中のカクつきが解消され、滑らかに動作すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) と完全に一致していること（デッドドキュメントがないこと）。
- [ ] `make` による Closure Compiler のコンパイルが正常に完了すること。
