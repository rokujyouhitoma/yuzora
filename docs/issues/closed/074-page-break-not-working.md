---
ID: 074
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] CSSの.page-breakでページがブレイクしていない問題 (ID: 074)

## 1. 概要 / Summary
書籍表示画面（縦書きマルチカラムレイアウト）において、改ページ（.page-break）が意図通りに機能しておらず、短い段落などの状況下でページがブレイクしない問題を解決します。
以前のIssue 073での修正（`.page-break + *` による `break-before: column` 適用）は、テキストが長い場合のみ自然改行（overrun）によって改カラムされているように見えていただけで、短いテキストのケースでは改段が完全に無視されていました。これは Chromium の縦書きマルチカラムにおける CSS fragmentation プロパティのバグに起因します。

### 再現手順 / Steps to Reproduce
1. 縦書きマルチカラムの表示環境において、数文字程度の短い段落の直後に `[＃改ページ]`（`.page-break`）を配置する。
2. `.page-break` に到達した際、期待される改ページ（カラムのブレイク）が行われず、直前の短い段落と直後の段落が同一カラム（ページ）内に横並びで表示されてしまう。

### 再現環境 / Environment
- Browser / OS: Chromiumベースのブラウザ全般
- Book / File: 縦書き書籍コンテンツ全般

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [reader.css](file:///workspace/yuzora/src/css/modules/reader.css)
- [ ] [style.css](file:///workspace/yuzora/src/css/style.css)
- [ ] [renderer.js](file:///workspace/yuzora/src/js/modules/renderer.js)
- [ ] [pagebreak.spec.js](file:///workspace/yuzora/tests/e2e/pagebreak.spec.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
Chromium（Blinkエンジン）は、`writing-mode: vertical-rl` のマルチカラムレイアウト下において、`break-before: column` や `break-after: column`、`column-span: all` などのすべての fragmentation/pagination CSSプロパティを無視するバグがあります。
物理的な進行軸が逆転しているため、空の要素やブロック要素に対する改カラム指定が正常に機能しません。

これを解決するためには、CSSの改ページプロパティに頼るのではなく、**「物理的に現在のカラムの残りスペースをぴったりと埋める透明なダミー要素（改ページ要素）」**として `.page-break` を機能させます。
RTLの座標計算に基づき、直前の要素の左端（進行方向の端）から次のカラム境界までの残り幅（`remainingWidth`）を算出し、`.page-break` の `width` スタイルに動的に適用することで、直後の要素を確実に次のカラムの先頭から開始させることができます。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  - `.page-break` のデフォルトCSSスタイルを `height: 100%; width: 0; display: block;` に修正。
  - `renderer.js`（`VerticalRenderer`）に `applyPageBreakSizes()` メソッドを新設し、静的・動的すべての `.page-break` に対して直前要素からの相対距離に基づき `width` を動的に設定する。
  - `cacheParagraphBounds()` の開始時、およびレイアウト修復完了時に `applyPageBreakSizes()` を呼び出す。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/074-page-break-not-working`

1. **CSS定義の修正**:
   - `src/css/modules/reader.css` および `src/css/style.css` の `.page-break` 定義を修正：
     ```css
     .page-break {
         display: block;
         width: 0;
         height: 100%;
         visibility: hidden;
     }
     ```
   - `.page-break + *` に設定されていた `break-before: column` 等の無効な指定を削除。

2. **JavaScriptの修正 (`src/js/modules/renderer.js`)**:
   - `VerticalRenderer` クラスに `applyPageBreakSizes()` を追加し、コンテナ内での各 `.page-break` の残り幅を計算して `style.width` に設定する。
   - `cacheParagraphBounds()` の先頭で `this.applyPageBreakSizes()` を呼ぶ。

3. **E2Eテストの修正と追加 (`tests/e2e/pagebreak.spec.js`)**:
   - 既存のテストケースにおいて、長いテキストの自然改行ではなく、短いテキストに対しても改ページ（改カラム）が100% 確実に動作することを確認する検証アサーションを追加。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] 短いテキストの間に挿入された `.page-break` の箇所で、100% 確実に改ページ（改カラム）が発生すること（隣のカラムへ押し出されること）。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] Closure Compiler によるコンパイルが正常に完了すること。
- [ ] 本実装は [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) 設計仕様と完全に整合していること。
