---
ID: 046
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] CSS変数の完全活用による「CSSテーマエンジン」の導入 (ID: 046)

## 1. 概要 / Summary
現在、カラーテーマ（和紙、明、暗、漆黒など）の切り替え時に、`ConfigModel.apply()` 内で JavaScript がボディ要素（`document.body`）に対して `theme-light` などのスタイルクラス名を追加・削除しています。これによってブラウザのスタイル再計算が広範囲で発生し、描画パフォーマンスに影響を与える可能性があります。

この依存関係を整理し、描画パフォーマンスおよびコードの保守性を高めるため、以下の実装を行います。
- 背景色、文字色、境界線色などを CSS カスタムプロパティ（CSS変数、例: `--bg-app`, `--text-main`）として定義。
- JavaScript側のテーマ切り替えでは、ボディ要素の属性値を1つ変更する（例: `document.body.setAttribute('data-theme', theme)`）だけで完結させ、クラスの動的な付け替えを廃止する。
- CSS側でも、クラスセレクタによるテーマ指定を属性セレクタ（`body[data-theme="..."]`）に変更する。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01 (機能要件)
* 関連要件 (SRD): SRD-03 (UI/UX設計)
* 関連バックログ: [041-css-theme-engine.md](../backlogs/041-css-theme-engine.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [config.js](file:///workspace/yuzora/yuzora/src/js/modules/config.js) (MODIFY)
* [ ] [base.css](file:///workspace/yuzora/yuzora/src/css/modules/base.css) (MODIFY)
* [ ] [reader.css](file:///workspace/yuzora/yuzora/src/css/modules/reader.css) (MODIFY)
* [ ] [debug.css](file:///workspace/yuzora/yuzora/src/css/modules/debug.css) (MODIFY)
* [ ] [viewer.spec.js](file:///workspace/yuzora/yuzora/tests/e2e/viewer.spec.js) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/046-css-theme-engine`

### 4.1. JS 側のテーマ切り替えロジック変更
* `src/js/modules/config.js` の `ConfigModel.prototype.apply()` 内で、`document.body.className = ...;` の処理を `document.body.setAttribute('data-theme', this.theme);` に置き換えます。

### 4.2. CSS セレクタの属性セレクタ化
* `src/css/modules/base.css` 内のテーマ切り替え用クラス定義（`.theme-light`, `.theme-dark`, `.theme-black`）を、それぞれ属性セレクタ（`body[data-theme="light"]`, `body[data-theme="dark"]`, `body[data-theme="black"]`）に変更します。
* デフォルト（和紙, `sepia`）についても `body[data-theme="sepia"]` を定義し、設定読み込み時に正しく反映されるようにします。
* `src/css/modules/reader.css` および `debug.css` 内の `.theme-dark` / `.theme-black` を含む子孫セレクタを、それぞれ `[data-theme="dark"]` / `[data-theme="black"]` に変更します。

### 4.3. E2Eテストのアサーション修正
* `tests/e2e/viewer.spec.js` のテーマ切り替えテストにおいて、ボディ要素の `data-theme` 属性が `dark` であることを期待するアサーションに変更します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] テーマ切り替え時に、`body` 要素へのクラス追加・削除が廃止され、`data-theme` 属性が制御されること。
- [ ] HTML/CSS 全体において、テーマセレクタが属性セレクタに移行し、和紙・明・暗・漆黒の配色が正常に適用されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。

