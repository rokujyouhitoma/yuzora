---
ID: 017
種別: Bug
優先度: Medium
ステータス: Closed
---

# [BUG/SEC] キーボードの上・下矢印キーによるメニュー表示切替が機能しない (ID: 017)

## 1. 概要 / Summary
読書画面において、PCでキーボードの上矢印キー（`ArrowUp`）または下矢印キー（`ArrowDown`）を押下しても、画面上下のメニュー（ヘッダー・フッター）の表示・非表示が切り替わらない不具合が発生している。基本設計（[DSN-02-low_level_design.md](../DSN-02-low_level_design.md)）およびシステム要件（[REQ-03-system_requirements.md](../REQ-03-system_requirements.md)）に定められているキーボード操作によるメニュー表示トグル機能が実装されていない、もしくは機能していない。

### 再現手順 / Steps to Reproduce
1. PCブラウザで読書画面を開く。
2. キーボードの上矢印キー（`ArrowUp`）または下矢印キー（`ArrowDown`）を押下する。
3. 画面上下のメニュー（ヘッダー・フッター）の表示・非表示が切り替わらない（何も起きない）。

### 再現環境 / Environment
- Browser / OS: PC環境全般
- Book / File: 読書画面全般

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
<!-- 影響を受ける機能や、調査・修正・作成が必要なファイルパスをリストアップします。 -->
- [x] [ui.js](../../src/js/modules/ui.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
<!-- 調査によって判明した真の根本原因を詳細に記述します。 -->
1. `src/js/modules/ui.js` の `document.addEventListener("keydown", ...)` イベントリスナー内において、`ArrowLeft` および `ArrowRight` によるページ送り/戻し操作はハンドリングされているが、`ArrowUp` および `ArrowDown` キー押下時のイベントハンドリングおよび `toggleControls(e)` の呼び出し処理が記述されていなかった。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
<!-- サービス復旧のための暫定回避策と、バグの根本原因を取り除く恒久対策を分けて記述します。 -->
* **暫定対処 (Workaround)**: なし（恒久対策のみ実施予定）。
* **恒久対策 (Permanent Fix)**:
  1. `src/js/modules/ui.js` の `keydown` イベントリスナー内に `ArrowUp` と `ArrowDown` のイベント検知を追加し、検知時に `toggleControls(e)` を呼び出す。
  2. 上下矢印キー押下時は、ブラウザのスクロール等のデフォルト動作を防ぐために `e.preventDefault()` を実行する。

---

## 5. 実装方針 / Implementation Plan
<!-- 恒久対策の具体的なコード修正内容、関数、スタイルの変更ステップを記述します。 -->
Target Branch: `fix/017-toggle-menu-with-arrow-keys`

1. **`src/js/modules/ui.js` の修正**:
   - `keydown` リスナー（行 121〜130 付近）の `if (!isModalOpen)` ブロック内に、以下の判定処理を追加する（適用済み）。
     ```javascript
     if (e.key === "ArrowUp" || e.key === "ArrowDown") {
         toggleControls(e);
         e.preventDefault();
     }
     ```
2. **ビルドの実行**:
   - `make` を実行し、`src/js/modules/ui.js` の変更内容を `main-min.js` にコンパイル・反映する（適用済み）。
3. **自動テストの追加・実行**:
   - `tests/e2e/viewer.spec.js` に、上下矢印キーによるメニュー表示/非表示（トグル）のE2Eテストを追加する（適用済み）。
   - `npm run test`（lint、unit、e2eを含む）を実行し、すべてのテストがパスすることを確認する（適用済み）。

---

## 6. 完了条件 / Success Criteria (DoD)
<!-- 修正が完了したと判断するための具体的な検証条件やテストを記述します。 -->
- [x] 読書画面上でキーボードの上矢印キー（`ArrowUp`）または下矢印キー（`ArrowDown`）を押下した際、ヘッダーおよびフッターメニューの表示/非表示（トグル）が切り替わること。
- [x] 上下矢印キー押下時、ブラウザのスクロール等のデフォルト動作が抑制されること (`preventDefault`)。
- [x] テストスイート `tests/e2e/viewer.spec.js` にメニュー切り替えのE2Eテストが追加され、正常にパスすること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 本実装は、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
