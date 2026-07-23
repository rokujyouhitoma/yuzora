---
ID: 124
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] 大規模コンテンツロード時のUIメインスレッド無停止・タイムスライス最適化 (ID: 124)

## 1. 概要 / Summary
大容量書籍データ（500KB〜2MB超、数万〜十数万文字クラス）のロード時に、ブラウザのメインスレッドが長時間ロックされ操作不能（フリーズ）になる課題を解消しました。
フレーム予算型タイムスライス（10ms時間制限）、HTMLパースの非同期化 (`parseHTMLIncremental`)、およびユーザー入力優先 (`isInputPending`) 割り込みガードを導入し、完全なレスポンシブ UX を実現しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): [REQ-03 3.4 リソース管理要件](../requirements/REQ-03-system_requirements.md)
- 関連バックログ: [102-large-content-non-blocking-performance.md](../backlogs/closed/102-large-content-non-blocking-performance.md)
- 過去の関連Issue: [Issue 050 (async-layout-diagnostics)](050-async-layout-diagnostics.md), [Issue 070 (optimize-initial-layout-repair-algorithm)](070-optimize-initial-layout-repair-algorithm.md), [Issue 083 (improve-overrun-repair-precision-and-performance)](083-improve-overrun-repair-precision-and-performance.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [renderer.js](../../src/js/modules/ui/renderer.js)
- [x] [parser.js](../../src/js/modules/parser/parser.js)
- [x] [viewer.js](../../src/js/modules/ui/viewer.js)
- [x] [renderer.test.js](../../tests/unit/ui/renderer.test.js)
- [x] [parser.test.js](../../tests/unit/parser/parser.test.js)

---

## 4. 実装方針 / Implementation Details
Target Branch: `enh/124-large-content-non-blocking-performance`

1. **`renderer.js` (`adjustPageBreaksForOverrun`) の改修**:
   - 固定の `batchCounter >= 600` による `setTimeout` 譲渡を廃止。
   - `performance.now() - lastYieldTime >= 10` (10ms経過) および `isInputPending()` 判定により即座にメインスレッドを解放。

2. **`parser.js` (`parseHTMLIncremental`) の非同期タイムスライス化**:
   - 巨大 HTML ドキュメントの DOM パース・サニタイズ処理を chunk 単位でタイムスライス実行可能に改善。

3. **`viewer.js` のファーストビュー即時表示フロー**:
   - 先頭ページの描画完了時点で即座にスクロール位置復元と UI 操作可能状態を確定。

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] 1MB〜2MB クラスの大容量書籍ロード中においても、ブラウザが「応答なし」フリーズ状態に陥らないこと。
- [x] ロード・修復処理中にユーザーが画面操作（「戻る」ボタン、テーマ切り替え等）を行った際、遅延なく即座に応答すること。
- [x] 既存の単体テスト (`npm run test:unit`) および E2E テスト (`npm run test:e2e`) が全件パスすること。
