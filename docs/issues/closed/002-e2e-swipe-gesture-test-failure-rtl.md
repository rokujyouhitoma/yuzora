---
ID: 002
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] E2Eテスト「RTLモードでのスワイプジェスチャー」が失敗する (ID: 002)

## 1. 概要 / Summary

CIにて `should navigate forward and backward using touch swipe gestures in RTL mode` テストが失敗している。
`reading-index` が `"1 / 1 ページ"` を返し続け、スワイプ後にページが変わらない。

### 再現手順 / Steps to Reproduce

1. `npm run test:e2e` を実行する
2. `should navigate forward and backward using touch swipe gestures in RTL mode` テストが失敗

### 根本原因

Playwright の `page.dispatchEvent()` でタッチイベントを発火する際、渡したオブジェクト (`touches`, `changedTouches`) はネイティブの `TouchList` インターフェースではなく Plain Object として渡される。
ヘッドレスブラウザ環境では `touchEvent.touches[0]` / `touchEvent.changedTouches[0]` へのアクセスが機能せず、
`touchStartX` が `0` のまま変化しないため、`deltaX` が 50px 未満となりページ遷移が発生しない。

### 再現環境 / Environment

- Browser / OS: Headless Chromium (Playwright CI)
- Book / File: Kokoro (デフォルトの開発者ライブラリ)

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — テストの `dispatchEvent` による TouchEvent 発火方法の修正
- [ ] [ui.js](../../src/js/modules/ui.js) — タッチイベントハンドラー（ソース側の問題ではない可能性が高い）

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

Playwright `dispatchEvent` はイベントのプロパティをシリアライズして渡すが、`touches` / `changedTouches` は `TouchList` オブジェクトではなく Plain Object として扱われる。

ソースコードの `touchstart` ハンドラー（ui.js L139-L145）の `touchEvent.touches[0].clientX` が 0 か undefined になる。
`touchend` ハンドラー（L147-L173）の `touchEvent.changedTouches[0].clientX` も同様。
よって `deltaX = 0 - 0 = 0` となり `Math.abs(deltaX) > 50` の条件を満たさず、ページ遷移が発生しない。

**修正方針**: テストで `page.evaluate()` を使用し、ブラウザ内でネイティブな `TouchEvent` コンストラクターを直接呼び出す。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし（テスト修正が必要）
* **恒久対策 (Permanent Fix)**: `page.dispatchEvent()` の代わりに `page.evaluate()` + `new TouchEvent()` で正しいネイティブタッチイベントを発火する

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/002-e2e-swipe-gesture-test-rtl`

1. `tests/e2e/viewer.spec.js` の `should navigate forward and backward using touch swipe gestures in RTL mode` テスト内のタッチイベント発火を `page.dispatchEvent()` から `page.evaluate()` + `new TouchEvent()` に変更する。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `should navigate forward and backward using touch swipe gestures in RTL mode` テストが CI で正常にパスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
