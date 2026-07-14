---
ID: 073
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] 縦書きマルチカラムレイアウトにおいて改ページ（.page-break）が機能しない問題 (ID: 073)

## 1. 概要 / Summary
書籍表示画面において、はみ出し（overrun）を修復するために挿入される動的改ページ要素（`.page-break`）がブラウザのレイアウトエンジンによって無視され、改ページ（改カラム）が正常に行われない問題を解決します。
本問題は、縦書きマルチカラム環境下において改ページ要素が空の `div` であること、および `height: 0; width: 0;` と定義されているために、ブラウザがレイアウト計算上無視または崩壊させていることが原因です。

### 再現手順 / Steps to Reproduce
1. 書籍表示画面を開き、改ページが期待される段落（ルビや長い行がある段落）の挙動を確認する。
2. 改ページ要素（`.page-break`）が挿入されているにもかかわらず、次のカラムに改ページ（改カラム）が行われない。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/css/modules/reader.css](../../src/css/modules/reader.css)
  - `.page-break` のスタイル定義の修正
- [x] [src/css/style.css](../../src/css/style.css)
  - `.page-break` のスタイル定義の修正

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
- 縦書きマルチカラム（`writing-mode: vertical-rl`）かつ `column-fill: auto` の環境下では、空の `div`（`.page-break`）自体の物理サイズが `0` になり、かつコンテンツを持たないため、ブラウザ（Chromium/WebKit）のレイアウトエンジン最適化により `break-before: column` や `break-before: page` などの強制改カラム指定が完全に無視される。
- これを解決するためには、空の `.page-break` 自体にスタイルを当てるのではなく、**隣接兄弟セレクタ（`.page-break + *`）**を用いて、**直後の実体テキストを持つ段落要素自体に対して強制的に `break-before: column !important` を適用する**必要がある。これにより、ブラウザの改段処理が 100% 確実に発火する。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  - `src/css/modules/reader.css` および `src/css/style.css` に隣接兄弟セレクタ `.page-break + *` を追加し、改カラム指定を適用する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/073-fix-page-break-styling`

1. **CSS定義の修正**:
   - `src/css/modules/reader.css` および `src/css/style.css` に以下のルールを追加。
     ```css
     .page-break {
         display: block;
         width: 0;
         height: 0;
         visibility: hidden;
     }
     .page-break + * {
         break-before: column !important;
         -webkit-column-break-before: always !important;
         page-break-before: always !important;
     }
     ```
2. **E2Eテストの追加と実証**:
   - `tests/e2e/pagebreak.spec.js` を作成し、Playwright で実際の座標計算（`boundingBox()`）に基づき、`.page-break` の直後にある段落が物理的に隣のカラム（左側のカラム）へと押し出されていることを自動テストで検証する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] 挿入された `.page-break` 要素の直前で、100% 確実に改カラム（改ページ）が発生すること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] `make` による Closure Compiler のコンパイルが正常に完了すること。
- [x] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に整合していること（デッドドキュメントがないこと）。
