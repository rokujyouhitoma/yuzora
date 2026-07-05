---
ID: 038
種別: Bug
優先度: High
ステータス: Open (New)
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
<!-- 調査によって判明した真の根本原因（5つの「なぜ」や仮説など）を詳細に記述します。 -->

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: 
* **恒久対策 (Permanent Fix)**: 

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/038-mobile-tap-header-not-showing`

1. 

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] スマートフォン環境（モバイルエミュレーション含む）にて、本文タップでコントロールヘッダー/フッターが正しくトグル表示されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
