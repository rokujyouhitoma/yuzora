---
ID: 056
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] ページ移動パフォーマンスの改善とトレーシングログの導入 (ID: 056)

## 1. 概要 / Summary
ページを切り替える（またはスクロールする）際の動作が著しく遅くなる、あるいはカクつき（遅延）が発生する問題を調査し、パフォーマンスのボトルネックを解消します。
特に、以下の要因が疑われます：
1. ページ移動中やスクロールイベントの発生時に、過剰なDOM更新（進捗バーの描画更新など）や、スタイル読み取り（`scrollWidth`, `clientWidth` など）が交互に実行されることで、ブラウザの同期レイアウト（Layout Thrashing）が多発している可能性。
2. 自己修復レイアウト（`adjustPageBreaksForOverrun` / `hasOverrunNearCurrentPage`）が、全段落要素に対する `getBoundingClientRect()` や Range API を介した文字座標チェックを頻繁に実行していることによる CPU 負荷。
3. イベントリスナーやタイマー（`setTimeout`）の重複による不要な重複実行や、終了条件の不整合。

これらの問題を調査・特定しやすくするために、各処理の実行時間やイベントの発火履歴を可視化するトレーシング用のログ出力を導入し、確実なトレーサビリティを確保した上でパフォーマンスチューニングを行います。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [src/js/frameworks/event.js](../../src/js/frameworks/event.js) — イベント配信の監査ログやパフォーマンス関連フラグの定義
- [ ] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) — `scrollToPage`, `handleScroll`, `updateProgress` におけるレイアウト読み出し最適化とトレーシングログの実装
- [ ] [src/js/modules/ui.js](../../src/js/modules/ui.js) — スクロールイベントハンドラ (`onViewportScroll`, `snapScrollPosition`) における過剰な発火防止・多重スナップ防止およびログ of 追加
- [ ] [src/js/modules/renderer.js](../../src/js/modules/renderer.js) — `hasOverrunNearCurrentPage` や `adjustPageBreaksForOverrun` における処理時間の測定とトレーシングログの実装
- [ ] [src/externs.js](../../src/externs.js) — Closure Compiler向けに `window.__DEBUG_PERFORMANCE__` などのプロパティ定義の追加
- [ ] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md) — パフォーマンスチューニングおよびトレーシング仕様に関する設計情報の記述更新

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 トレーシングログの設計
- **グローバルデバッグフラグの導入**:
  - `window['__DEBUG_PERFORMANCE__']` を追加し、有効な場合のみパフォーマンスに関する詳細なトレースログをコンソールに出力します。通常稼働時のオーバーヘッドを抑制します。
- **トレーシングログの出力対象**:
  1. **ページ移動操作**: `NavigatePageCommand` 実行開始から `scrollToPage` 完了（アニメーション含む）までの時間。
  2. **スクロールイベント**: `onViewportScroll` がトリガーされた頻度、および `updateProgress` に要した処理時間。
  3. **レイアウト検査**: `hasOverrunNearCurrentPage` の実行にかかった時間と、判定結果（オーバーラン検知有無）。
  4. **レイアウト修復**: `adjustPageBreaksForOverrun` の修復処理に要した全体の実行時間、ループイテレーション数、および挿入された自動改ページ数。
  5. **スクロールスナップ**: スナップスクロール発動時、および完了時のタイムスタンプ。

### 3.2 パフォーマンスボトルネックの解消（設計アプローチ）
1. **Layout Thrashing（レイアウトスラッシング）の回避**:
   - `updateProgress()` 内で、スクロール位置の読み取り（`scrollLeft`, `scrollWidth`, `clientWidth`）と進行状況表示の書き込み（DOMの `style.width` や `textContent` の更新）がスクロールイベントのたびに同期して実行されています。
   - これを解消するために、以下のいずれかのアプローチを導入します：
     - `requestAnimationFrame` (rAF) を用いて、DOMへの書き込み（Write）処理を次のレンダリングフレームまで遅延させ、読み込み（Read）と書き込み（Write）を分離する。
     - スクロールイベントに対する throttler/debouncer を見直し、`updateProgress` の実行頻度を適切に制限する。
2. **多重スナップ（Magnetic Snap）の防止**:
   - 現在、`snapScrollPosition()` は `scrollTo`（behavior: "smooth"）を呼び出しますが、このスムーズスクロール中もスクロールイベントが発火し続けます。これにより、追加の `onViewportScroll` と `handleScrollDebounced` が連鎖的にトリガーされ、不要なタイマー設定やスナップ処理が重複発生して画面のカクつきを引き起こしています。
   - スナップスクロールの開始からアニメーション完了までの間は `isSnapping` などの状態フラグで排他制御を行い、多重にスナップ処理や余分な `updateProgress` が走らないようにガードします。
3. **レイアウト検査範囲の最適化**:
   - `hasOverrunNearCurrentPage()` は全段落要素に対してループを回して `getBoundingClientRect()` を実行しています。
   - 現在のスクロール位置（現在のページ）とその前後のページに物理的に位置する段落のみに検査対象を絞り込む、もしくは判定処理そのものの無駄な処理を削減することで、検査処理自体を高速化します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `window['__DEBUG_PERFORMANCE__'] = true` のとき、コンソールに各重要処理（ページ移動、スクロールスナップ、レイアウト検証、レイアウト修復）の処理時間と詳細データがトレースログとして出力されること。
- [ ] スクロール時およびスナップ時に、同一フレーム内または連続するスクロール処理中にレイアウトスラッシングが発生していないこと（プロファイラ等で確認）。
- [ ] スムーズスクロールおよびスナップ動作中に、重複したスナップ呼び出しや余分な進行度計算（`updateProgress`）が走らず、動作が滑らかであること。
- [ ] ユニットテストおよび E2E テストがすべて正常にパスすること。
- [ ] 調査および対策内容が設計書（`docs/DSN-02-low_level_design.md`）に反映され、実装とのトレーサビリティが確保されていること。
