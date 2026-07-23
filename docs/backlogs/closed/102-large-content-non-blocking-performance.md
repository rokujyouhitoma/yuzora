---
ID: 102
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] 大規模コンテンツロード時のUIメインスレッド無停止・タイムスライス最適化 (ID: 102)

## 1. 概要 / Summary
「ゆうぞら」において大容量書籍データ（500KB〜2MB超、数万〜十数万文字クラス）をロードした際、ブラウザのメインスレッドが長時間占有され、ユーザーのクリック・タッチ・キー入力等の操作を受け付けず「応答なし（フリーズ）」状態に陥る致命的な UX 課題を根本解決しました。
プロジェクトマネージャ（PM）およびシステムアーキテクト（SA）の評価に基づき、パース・レンダリング・レイアウト自己修復（`adjustPageBreaksForOverrun`）の全フェーズにおいて **10ms フレーム予算型タイムスライス**、**HTML 非同期分割処理**、および **ユーザー入力最優先（isInputPending）インターラプト機構** を導入し、大規模本ロード中も 60fps / 応答性 100% を維持するノンブロッキングアーキテクチャを確立しました。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [renderer.js](../../src/js/modules/ui/renderer.js) — `adjustPageBreaksForOverrun` のバッチ処理を固定個数（600個）から `performance.now()` 基準の 10ms フレーム予算型へ改修および `isInputPending()` / タイムスライス譲渡処理の刷新
- [MODIFY] [parser.js](../../src/js/modules/parser/parser.js) — HTMLパース (`parseHTMLIncremental`) の非同期タイムスライス化
- [MODIFY] [viewer.js](../../src/js/modules/ui/viewer.js) — 大規模コンテンツ読み込み中におけるファーストビュー即時レンダリングとバックグラウンド修復進捗フィードバックの統合
- [MODIFY] [renderer.test.js](../../tests/unit/ui/renderer.test.js) — フレーム予算超過なし、およびタイムスライス中のUI非フリーズ単体テストの追加
- [MODIFY] [parser.test.js](../../tests/unit/parser/parser.test.js) — HTML 非同期分割パースの単体テストの追加

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 課題の根幹原因 (Root Cause Analysis)
1. **レイアウト修復バッチの巨大化**: `adjustPageBreaksForOverrun()` での処理バッチ数が 600 個/tick に固定されており、1バッチあたり 100ms〜500ms の Long Task が連続発生してブラウザイベントループを数秒間完全に遮断している。
2. **HTML 形式の全量同期パース**: `.html` / `.xhtml` ファイルが全量同期パース (`parseHTML`) されており、大容量 HTML 読み込み時に即座にメインスレッドがロックされる。
3. **ユーザー入力優先度制御の欠落**: レイアウト修復中にユーザーが「戻る」ボタンや「設定」ボタンを押下しても、修復ループがイベント処理へメインスレッドを譲渡しないため入力が無視・遅延する。

### 3.2 アーキテクチャ改修方針 (SA Architecture Strategy)
- **10ms フレーム予算型タイムスライス (Frame-budgeted Time-Slicing)**:
  `performance.now()` を用いて 1 フレーム（16ms）内のレイアウト計算時間を最大 10ms に制限。10ms を超えた場合は `await new Promise(r => setTimeout(r, 0))` で即座にメインスレッドをブラウザ描画・イベント処理へ返還。
- **入力割り込みガード (Input Interrupt Guard)**:
  `navigator.scheduling?.isInputPending?.()` またはキャンセルフラグを毎フレーム評価し、ユーザー操作を検出した場合は修復処理を一時中断・スレッド譲渡。
- **ファーストビュー優先表示 (Progressive First-Viewport Render)**:
  先頭数ページ分のDOM描画と表示を最速完了させ、ユーザーが即座に読書を開始できる状態を構築した上で、後続ページのレイアウト計算をバックグラウンドで段階実行。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] 1MB 以上の大容量テキスト/HTML ファイルをロードした際、ブラウザの「ページが応答しません」警告が一切発生しないこと。
- [x] 大容量コンテンツのロード・レイアウト修復処理中であっても、ヘッダーの「戻る」ボタンやメニュー操作が遅延なく（100ms以内）即座に反応すること。
- [x] 全ユニットテスト `npm run test:unit` および E2E テスト `npm run test:e2e` が正常に通過すること。
