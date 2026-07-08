---
ID: 056
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] 自己修復レイアウトエンジン（動的改ページ自動挿入）の実装 (ID: 056)

## 1. 概要 / Summary
バウンディングボックスの制限やブラウザのフォントレンダリング端数誤差により、縦書きテキスト行が物理的にページの境界線上（カラムとギャップの境目）に乗り上げ、文字が見切れてしまう（半分にスライスされる）問題が発生します。

本対応では：
1. `VerticalRenderer` (`src/js/modules/renderer.js`) に `adjustPageBreaksForOverrun()` を実装し、見切れ交差が検出された要素の直前に動的な改ページ要素 `<div class="page-break dynamic-page-break"></div>` を自動で挿入する自己修復レイアウトエンジンを構築します。
2. 挿入後にレイアウト座標がリフローで変化するため、すべて見切れが解消されるかループ上限（最大30パス）に達するまで処理を繰り返すマルチパス自動補正ループを実装します。
3. 本ロード時、設定変更時、ウィンドウリサイズ時のレイアウト確定ライフサイクルイベントに本自己修復処理を結合し、見切れ不具合を全自動で回避します。

本Issueは、バックログ [048-self-correcting-page-breaks.md](../backlogs/048-self-correcting-page-breaks.md) をプロモートしたものです。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連バックログ: [048-self-correcting-page-breaks.md](../backlogs/048-self-correcting-page-breaks.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [renderer.js](../../src/js/modules/renderer.js) (`adjustPageBreaksForOverrun()` メソッドの実装、および `handleResize()` 呼び出しフック)
- [ ] [viewer.js](../../src/js/modules/viewer.js) (本ロード時の自己修復フック呼び出し)
- [ ] [ui.js](../../src/js/modules/ui.js) (設定変更時の自己修復フック呼び出し)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/056-self-correcting-page-breaks`

1. **`adjustPageBreaksForOverrun()` の実装**:
   - `VerticalRenderer` 内にメソッドとして追加する。
   - ループ実行（最大30回まで）:
     - 最初にすべての `.dynamic-page-break` 要素を削除してレイアウトをリセット。
     - 各段落要素を走査し、境界線（$k \times W$）と交差する文字を `findCharAtBoundary` から取得。
     - 該当する文字を含む段落要素を検知した場合、その段落要素の直前に `<div class="page-break dynamic-page-break"></div>` を動的に挿入。
     - 挿入後はDOM構造が変化するため、現在の段落ループを中断（break）し、次のループパスで最初から座標再検出を実施。
     - 1つも見切れが検出されなくなったら正常終了。
2. **呼び出しフックの統合**:
   - 本ロード完了時: `viewer.js` の `displayBook()` 内の `setTimeout`（100ms）の最初。
   - 設定変更時: `ui.js` の各設定スライダーやドロップダウンの値適用（`apply()` 実行）直後の `setTimeout` 処理内。
   - ウィンドウリサイズ時: `VerticalRenderer.prototype.handleResize()` の実行フロー内（スクロール座標補正前）。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 境界をまたぐ文字を検出した段落の直前に動的な改ページ要素が自動挿入され、見切れる文字が次のカラムへ正常に送り出されること。
- [ ] レイアウト変更に伴うリフローの最大再試行上限（30回）によって無限ループに陥らないこと。
- [ ] 自動改ページ挿入機能の実装により、E2Eテスト (`tests/e2e/diagnose.spec.js`) における文字見切れ件数が自動で 0件 に修正され、テストがGreenで通過すること。
- [ ] 本実装の内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（デッドドキュメントがないこと）。
