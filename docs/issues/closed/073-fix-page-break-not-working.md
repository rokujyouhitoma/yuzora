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
- `break-before: column` はブロック要素に対して機能するが、対象要素である `.page-break` に `display: block;` が明示されていない。
- 縦書きマルチカラム（`writing-mode: vertical-rl`）では、カラムの進行方向が水平（X軸）であり、高さ（Y軸）は固定です。
- `.page-break` が `height: 0; width: 0;` の空のブロックとして定義されているため、ブラウザ（WebKit/Blink）の最適化またはバグにより、高さと幅のないレイアウト要素として無視され、改カラムブレイクが発生しない。
- 解決するためには、`display: block; height: 100%; width: 0;` と定義し、ブラウザに対して「カラム高さ全体を占める空のブロックである」と認識させることで、`break-before: column` による改カラムを 100% 確実に強制させる必要があります。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**:
  - `src/css/modules/reader.css` および `src/css/style.css` の `.page-break` スタイル定義を修正し、`display: block; height: 100%; width: 0;` を適用する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/073-fix-page-break-styling`

1. **CSS定義の修正**:
   - `src/css/modules/reader.css` の `.page-break` 定義を修正。
   - `src/css/style.css` の `.page-break` 定義を修正。
     ```css
     .page-break {
         display: block;
         break-before: column;
         -webkit-column-break-before: always;
         page-break-before: always;
         height: 100%;
         width: 0;
     }
     ```

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] 挿入された `.page-break` 要素の直前で、100% 確実に改カラム（改ページ）が発生すること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] `make` による Closure Compiler のコンパイルが正常に完了すること。
- [x] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に整合していること（デッドドキュメントがないこと）。
