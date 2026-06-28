---
ID: 018
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] デバッグ画面で「レイアウト診断」タブに切り替わらない (ID: 018)

## 1. 概要 / Summary
デバッグ画面（`#debug-modal`）において、「レイアウト診断（Layout Diagnosis）」タブをクリックしても、表示がレイアウト診断画面に切り替わらない不具合が発生している。

### 再現手順 / Steps to Reproduce
1. PCブラウザで読書画面を開く。
2. デバッグボタンをクリック、またはキーボードの `d` キーを押下してデバッグ画面を開く。
3. 「レイアウト診断」タブをクリックする（またはキーボードの `2` キーを押下する）。
4. 表示がシステムモニターのままで、「レイアウト診断」に切り替わらない。

### 再現環境 / Environment
- Browser / OS: PC環境全般
- Book / File: 読書画面全般

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
<!-- 影響を受ける機能や、調査・修正・作成が必要なファイルパスをリストアップします。 -->
- [x] [ui.js](../../src/js/modules/ui.js)
- [ ] [config.js](../../src/js/modules/config.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
<!-- 調査によって判明した真の根本原因を詳細に記述します。 -->
1. `src/js/modules/ui.js` の `setupEventListeners` におけるデバッグタブ切り替えのクリックイベントハンドラーにおいて、タブコンテンツ（`tabContentMonitor` / `tabContentDiagnose`）の切り替えに本来使用すべき `hidden` クラスの追加/削除 (`classList.add('hidden')` / `classList.remove('hidden')`) ではなく、誤って `active` クラスの追加/削除が行われていた。
2. このため、`index.html` にて初期状態で `hidden` クラスを持つ `tabContentDiagnose` が常に非表示のままとなり、タブの表示切り替えが機能していなかった。また、E2Eテストではタブボタンの `active` クラスのみを検証しており、コンテンツ要素の表示・非表示を検証していなかったため、このバグが検出されずにパスしていた。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
<!-- サービス復旧のための暫定回避策と、バグの根本原因を取り除く恒久対策を分けて記述します。 -->
* **暫定対処 (Workaround)**: なし。
* **恒久対策 (Permanent Fix)**:
  - `src/js/modules/ui.js` 内のタブ切り替えイベントリスナー（`tabBtnMonitor` および `tabBtnDiagnose` のクリックハンドラー）において、コンテンツ要素に対する `hidden` クラスの追加・削除を正しく行うように修正した。

---

## 5. 実装方針 / Implementation Plan
<!-- 恒久対策の具体的なコード修正内容、関数、スタイルの変更ステップを記述します。 -->
Target Branch: `fix/018-fix-debug-tab-switching`

1. **`src/js/modules/ui.js` の修正**:
   - `tabBtnMonitor` と `tabBtnDiagnose` のクリックイベントにおいて、以下のように `hidden` クラスを操作するよう変更した。
     - モニタータブ選択時: `tabContentMonitor.classList.remove("hidden")`, `tabContentDiagnose.classList.add("hidden")`
     - 診断タブ選択時: `tabContentDiagnose.classList.remove("hidden")`, `tabContentMonitor.classList.add("hidden")`
2. **ビルドの実行**:
   - `make` を実行して `main-min.js` をビルドした。
3. **E2Eテストの強化**:
   - `tests/e2e/viewer.spec.js` の `should control debug modal using keyboard shortcuts` テストケースにおいて、タブ切り替え時にそれぞれのコンテンツ要素が期待通りに `hidden` を持っているか/持っていないかを `expect` で検証するアサーションを追加した。
4. **テストの実行**:
   - `npm test` を実行し、すべてのテストがパスすることを確認した。

---

## 6. 完了条件 / Success Criteria (DoD)
<!-- 修正が完了したと判断するための具体的な検証条件やテストを記述します。 -->
- [x] デバッグ画面で「レイアウト診断」タブをクリック（または `2` キーを押下）した際、モニターコンテンツが非表示になり、レイアウト診断コンテンツが表示されること。
- [x] E2Eテストにおいて、タブ切り替え時のコンテンツ表示状態（`hidden` クラスの有無）の検証が追加され、正常にパスすること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 本実装は、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
