---
ID: 038
種別: Bug
優先度: High
ステータス: Open (In Progress)
---

# [BUG/SEC] スマートフォン（Android, Chrome）で本文をタップしてもヘッダーが表示されない (ID: 038)

## 1. 概要 / Summary

スマートフォン環境（AndroidのGoogle Chromeブラウザなど）において、読書画面（Reader Screen）の本文領域をタップしても、コントロールヘッダーやフッターなどの操作UIが表示/非表示切り替えされない不具合。

### 再現手順 / Steps to Reproduce
1. スマートフォン（Android, Chrome等）または開発者ツールのモバイルエミュレータにてYuzoraを開く。
2. 任意の書籍をロードし、読書画面（Reader Screen）へ遷移する。
3. 縦書き本文領域をタップ（タップ/クリック操作）する。
4. 本来であればコントロールバー（ヘッダー・フッター）がトグル表示されるべきだが、表示されない。

### 再現環境 / Environment
- Browser / OS: Google Chrome / Android (またはモバイルエミュレーション環境)
- Book / File: 任意の書籍

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
調査・修正対象として以下のファイルが考えられます：
- [ ] [ui.js](file:///workspace/yuzora/yuzora/src/js/modules/ui.js) (UIイベント・タップ操作処理のバインド部分)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
`src/js/modules/ui.js` にて、読書画面（`reader-viewport`）に対するクリック（タップ）イベントの `toggleControls` へのバインドが行われておらず、デスクトップでのキーボード操作（`ArrowUp`/`ArrowDown`）以外のメニュー表示切替手段が存在しなかった。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし。
* **恒久対策 (Permanent Fix)**: 読書画面用のイベントバインド関数 `setupReaderEvents()` 内にて、`viewContext.readerViewport` に対して `"click"` イベントリスナーを追加し、`toggleControls` を呼び出すようにする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/038-mobile-tap-header-not-showing`

1. [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) のメニュー表示切替仕様に「本文エリアのタップによるコントロール表示切替」を追記する。
2. [ui.js](../../src/js/modules/ui.js) の `setupReaderEvents()` 内で、`bindReaderEvent_(viewContext.readerViewport, "click", toggleControls)` を追加する。
3. `make clean && make` で Closure Compiler のコンパイルが成功することを確認する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] スマートフォン環境（モバイルエミュレーション含む）にて、本文タップでコントロールヘッダー/フッターが正しくトグル表示されること。
- [ ] リンク、ルビ、ボタン等のインタラクティブな要素をクリックした場合はコントロール表示がトグルされないこと。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（不整合ドキュメントの排除）。
