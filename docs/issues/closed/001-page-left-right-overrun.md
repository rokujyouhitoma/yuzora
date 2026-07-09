---
ID: 001
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] ページの左右が見切れてしまう (ID: 001)

## 1. 概要 / Summary
縦書きマルチカラムレイアウトにおいて、ページの左右の端にあるテキストが見切れてしまうバグを修正します。

> [!NOTE]
> 本バグは、以下の個別Issueの連携によって恒久対策（自己修復レイアウトエンジン）として実装され、無事クローズされました：
> - 診断の厳密化： [Issue 055](../issues/closed/055-strict-boundary-diagnostics-and-e2e-loop.md)
> - 自己修復ループの実装： [Issue 056](../issues/closed/056-self-correcting-page-breaks.md)
> - 観測テレメトリ・デバッグ表示： [Issue 057](../issues/closed/057-layout-repair-observability-and-debugging.md)

### 再現手順 / Steps to Reproduce
1. 開発用の青空文庫テキストファイル（例: `52396_yoko.txt`）を読み込ませる。
2. ページ 12/163 あたりまで進める。
3. ページの境界付近に配置された長い段落（長い `p` 要素）の文字が、境界（X: 0px または X: 1266px）をまたいではみ出しているか、見切れているのが観察される。

### 再現環境 / Environment
- Browser / OS: Chrome/Safari (RTL縦書きマルチカラム表示)
- Book / File: `52396_yoko.txt` 等、段落が長く複数ページにまたがる書籍

---

## 2. 根本原因分析 (RCA) / Root Cause Analysis
1. **第1次調査（カラム幅の計算誤差）**: 当初、`column-width` の `%` 指定がブラウザによって `auto` に解決され、端数計算ズレが起きることが根本原因と推定。`vw` ベースの計算式に修正したが、見切れは依然として発生。
2. **第2次調査（真の根本原因 - 長い段落のバウンディングボックスまたぎ）**:
   CSS Multi-column において、縦書きの `p` 要素が複数カラムに渡って流れるとき、`getBoundingClientRect()` はコンテンツ全体を囲む矩形を返すため、長い段落は現在表示ページの左右外側まで広がったバウンディングボックスを持つ。これが「見切れ」として診断レポート等で誤検出される一方、実際に段落の折り返し位置の文字（行矩形）が物理的にページ境界線と重なって見切れてしまう現象が混在している。

---

## 3. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし（恒久対策のみ実施予定）。
* **恒久対策 (Permanent Fix)**:
  1. `column-width` の `vw` ベースへの修正（適用済み）。
  2. `findCharAtBoundary` にて文字/行矩形レベルで厳密に境界をまたいでいるかを判定し、誤検出を排除する（診断ロジックの改善）。
  3. 物理的な境界またぎ（見切れ）が発生している段落の直前に `<div class="page-break dynamic-page-break"></div>` を自動的に挿入し、次のカラムへ強制送り（改ページ）して見切れを解消する。

---

## 4. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [style.css](../../src/css/style.css) (カラム幅の計算式を `vw` ベースに修正済み — ✅ column-width は正常化)
- [ ] [diagnostics.js](../../src/js/modules/diagnostics.js) (`runLayoutDiagnosis` の境界交差検出ロジック改善)
- [ ] [renderer.js](../../src/js/modules/renderer.js) (`adjustPageBreaksForOverrun()` の実装および `handleResize()` 呼び出し統合)
- [ ] [viewer.js](../../src/js/modules/viewer.js) (コンテンツロード時の自動改ページ挿入処理の呼び出し統合)
- [ ] [ui.js](../../src/js/modules/ui.js) (設定変更時の自動改ページ挿入処理の呼び出し統合)
- [ ] [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (詳細設計の更新)

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/001-page-left-right-overrun`

### 既実施（Step 1）
1. **`src/css/style.css` の修正（完了）**:
   - `(min-width: 768px)` の `column-width` を `calc(50vw - var(--reader-padding-x) - var(--reader-viewport-padding-x) * 2)` に変更。
   - `(max-width: 767px)` の `column-width` を `calc(100vw - var(--reader-padding-x) * 2 - var(--reader-viewport-padding-x) * 2)` に変更。
   - 結果: column-width の計算は ✅ 正常になったが、見切れは残存。

### 未実施（Step 2）— 追加対策

2. **`src/js/modules/diagnostics.js` の診断ロジック改善 (`findCharAtBoundary` & `runLayoutDiagnosis`)**:
   - `findCharAtBoundary(element, boundaryX)` を改善し、文字の境界が実際に `boundaryX` をまたいでいる（`rect.left < boundaryX - 0.5 && rect.right > boundaryX + 0.5`）場合のみ文字情報を返すように修正します。交差する文字が存在しない場合は `null` を返すようにし、フォールバックとして `closestMatch` を返す処理を廃止します。
   - `runLayoutDiagnosis()` 内で、各要素全体の bounding box による境界判定 (`rect.left < boundaryLeft && rect.right > boundaryLeft`) を廃止し、`findCharAtBoundary` が `null` 以外の実データを返したかどうかに基づいて `intersectsLeft` / `intersectsRight` を判定するように変更します。これにより、複数カラムにまたがる長い段落による誤検知を排除します。

3. **見切れ検出時の自動改ページ挿入処理の実装 (`VerticalRenderer` への統合)**:
   - カラム境界（ページ境界）をまたぐ文字を検出し、その要素の直前に `<div class="page-break dynamic-page-break"></div>` を動的に挿入する `adjustPageBreaksForOverrun()` メソッドを `VerticalRenderer`（`src/js/modules/renderer.js`）に実装します。
   - **`adjustPageBreaksForOverrun()` のアルゴリズム**:
     1. 以前に追加された動的改ページ要素 (`.dynamic-page-break`) をすべて削除します。
     2. ページの幅 `W` (`readerViewport.clientWidth`) および現在の送り方向（RTLかLTRか）を取得します。
     3. 境界との交差を検出するために、`hasCharOverrun(child, viewportRect, scrollLeft, W, isRTL)` ヘルパー関数を定義します。この関数は、要素内の各文字の絶対座標が `k * -W` (RTL) または `k * W` (LTR) の境界線と交差しているかを判定します。
     4. `readerContent.children` を順に走査し、境界をまたぐ文字が含まれる要素を検出した場合、その手前に `.dynamic-page-break` を挿入します。
     5. 挿入が行われると全体のレイアウト位置が変わるため、一度の走査につき1つの挿入を行い、挿入後はレイアウトの更新を待って（または再判定を行い）再度先頭からループをやり直します。最大ループ回数（例: 30回）に達するか、あるいはすべての見切れが解消されたら終了します。

4. **処理の呼び出しタイミングの統合**:
   - 以下のライフサイクルイベントで、レイアウトがレンダリングされて確定した直後に `adjustPageBreaksForOverrun()` を実行し、その後にスクロール位置の復元 (`restoreScrollPosition()`) およびプログレス更新を実行します。
     - **コンテンツロード時**: `viewer.js` の `displayBook()` 内の `setTimeout` (100ms) 処理の最初。
     - **設定変更時**: `ui.js` の設定変更時（テーマ、フォント、文字サイズ変更など）に適用後の `setTimeout` 処理の最初。
     - **リサイズ時**: `renderer.js` の `handleResize()` 内の再計算・位置復元の直前。

5. **設計ドキュメントの更新**:
   - `docs/DSN-02-low_level_design.md` に自動改ページ挿入処理の物理設計およびアライメントアジャストアルゴリズムを追加します。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] 診断レポートの境界交差検出が、`p` 要素の bounding box ではなく行・文字矩形レベルで正確に動作し、複数カラムにまたがる長い段落による誤検出が 0 件になること。
- [ ] コンテンツロード時、設定変更時、ウィンドウリサイズ時に、境界をまたぐ長い `p` 要素の直前に `dynamic-page-break` が自動挿入され、見切れる文字が次のカラムへ正しく送られること。
- [ ] 実装した `adjustPageBreaksForOverrun()` が無限ループなどの重大なバグを引き起こさないこと（最大ループ回数の制限が機能していること）。
- [ ] 開発用のE2Eレイアウト診断テスト (`tests/e2e/diagnose.spec.js` または該当テスト) を実行した際、出力される診断レポートで境界交差の件数が 0 になっていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 本実装の内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること（デッドドキュメントがないこと）。
