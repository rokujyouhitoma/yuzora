---
ID: 044
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] レンダラー（Renderer）クラスの導入による描画ロジックの分離 (ID: 044)

## 1. 概要 / Summary
現在、青空文庫テキストのパース（`parser.js`）以外の、縦書きマルチカラムレイアウトの計算、ページ分割、リフロー制御、RTLにおけるスクロール位置の調整などの具体的なHTML/DOM描画ロジックが [viewer.js](../../src/js/modules/viewer.js) などのコントローラ層に組み込まれています。
表示と制御の関心事を明確に分離し、保守性と拡張性を向上させるため、描画・レイアウト計算処理を専門に扱う `Renderer`（または `LayoutEngine`）を導入します。

本修正により、以下の実現を目指します。
* コントローラ層からレイアウトや表示関連の具体的な座標・CSS調整ロジックを分離。
* ページの見切れ問題（Issue 001）などの高度なレイアウト計算・動的改ページ調整をきれいに隠蔽・カプセル化する器を作る。
* 将来的な横書きモード（001）のサポート時に、`VerticalRenderer` / `HorizontalRenderer` を差し替えるだけで対応可能にする。
* クライアントサイド静的SPAとしての完全なサーバーレス実行モデル（MNG-00）を遵守する。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01
* 関連要件 (SRD): SRD-01 (レイアウト表示), SRD-03 (保守性)
* 関連バックログ: [036-introduce-renderer-class.md](../backlogs/036-introduce-renderer-class.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [renderer.js](file:///workspace/yuzora/yuzora/src/js/modules/renderer.js) (NEW)
* [ ] [viewer.js](file:///workspace/yuzora/yuzora/src/js/modules/viewer.js) (MODIFY)
* [ ] [types.d.ts](file:///workspace/yuzora/yuzora/src/js/types.d.ts) (MODIFY)
* [ ] [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/044-introduce-renderer-class`

### 4.1. 型定義の追加 (`types.d.ts`)
* `RendererInterface` インターフェースを定義。
  ```typescript
  interface RendererInterface {
      render(htmlContent: string): void;
      restoreScrollPosition(progress: number): void;
      scrollToPage(pageNumber: number): Promise<void>;
      handleResize(progress: number): void;
  }
  ```
* `LocatorInterface` で `Renderer` が解決できるように型アノテーションをサポート。

### 4.2. `renderer.js` の新規実装 (NEW)
* `RendererInterface` を実装する `VerticalRenderer` クラスを定義。
* メンバ変数として、`Locator` から `ViewContext` および `ConfigModel` を解決・保持。
* メソッドの実装:
  * `render(htmlContent)`: 
    - `viewContext.readerContent.innerHTML = htmlContent` による描画。
    - （将来のIssue 001用）改ページ調整やレイアウト初期化ロジック（`style.width = 'max-content'` など）をここに内包。
  * `restoreScrollPosition(progress)`: 
    - 読書進捗率 (`progress`) と `configModel.direction` （`rtl` / `ltr`）に基づいて `scrollLeft` 座標を算出し設定。
  * `scrollToPage(pageNumber)`:
    - ページ番号に対応する `scrollLeft` 座標へのスムーズスクロール（`scrollTo({left, behavior: 'smooth'})`）を実行。
    - スクロール完了を待つPromiseを返す。
  * `handleResize(progress)`:
    - リサイズ前進捗 `progress` を基に、一時的に `style.width = 'auto'` にリセット後、100msの遅延を経て `width = 'max-content'` に戻し、`scrollLeft` を再計算・設定。

### 4.3. `viewer.js` のリファクタリング (MODIFY)
* `displayBook()`, `restoreScrollPosition()`, `restoreScrollPositionSmooth()`, `scrollToPage()`, `handleResize()` 内の具体的なDOM幅操作、スクロール座標の直接計算・代入を `Renderer` クラスに委譲。
* `DOMContentLoaded` イベントリスナーで `Locator.resolve(VerticalRenderer)` (後ほどFactoryで切り替えられるようにする) を解決し、グローバルまたはスコープ変数 `renderer` に保持。
* `yuzora.js` の `boot()` にて `VerticalRenderer` クラスおよびそのインスタンスを `Locator` に登録。

### 4.4. 設計書 `DSN-02-low_level_design.md` の更新 (MODIFY)
* 構造設計のセクションに `RendererInterface` と `VerticalRenderer` の説明・役割を追加。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `VerticalRenderer` クラスが新規作成され、既存の `viewer.js` 内の描画・レイアウトロジックが美しくカプセル化されていること。
- [ ] 読書画面への遷移、スクロール、ページ送り（前後）、ウィンドウリサイズ時のレイアウト調整が、既存と同様に正常に機能すること。
- [ ] すべての JSDoc 型アノテーションが適切に記述され、`npm run typecheck` (tsc による静的型チェック) で警告およびエラーが 0 件であること。
- [ ] 実装内容が [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) に正しく反映され、ドキュメントの同期が取れていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
