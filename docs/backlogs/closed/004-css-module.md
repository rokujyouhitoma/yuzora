---
ID: 004
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] CSSスタイルのモジュール化 (ID: 004)

## 1. 概要 / Summary
単一の `style.css` が肥大化して管理が困難になるのを防ぐため、デザインシステム、レイアウト、コンポーネント（設定ドロワー、ビューアー等）ごとに CSS ファイルを論理的に分割・モジュール化し、メンテナンス性を向上させるためのリファクタリング。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [reset.css](../../src/css/modules/reset.css) (CSSリセット)
- [base.css](../../src/css/modules/base.css) (基本UI・変数定義)
- [welcome.css](../../src/css/modules/welcome.css) (ウェルカム画面)
- [reader.css](../../src/css/modules/reader.css) (読書ビューアー画面)
- [drawers.css](../../src/css/modules/drawers.css) (各種設定・目次ドロワー)
- [debug.css](../../src/css/modules/debug.css) (デバッグモーダル)
- [Makefile](../../Makefile) (モジュール統合ビルドターゲットの定義)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 CSSの分割とモジュール化
- `style.css` に含まれるすべてのスタイルを機能別に上記のモジュールへ完全に分割する。
- 開発環境（`index.html`）では、キャッシュバスティング（`?v=`）を考慮しつつ各モジュールを個別に読み込み、デバッグ容易性を確保する。
- ビルド時（`Makefile`）には `cat` コマンドによりモジュールファイルを結合して `style.css` を生成し、本番環境（`compiled.html`）では `style.css` のみを読み込んでパフォーマンスを担保する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] すべてのCSSルールが `src/css/modules/` 配下のファイルに漏れなく分割され、`src/css/style.css` がビルドによって正しく生成されること。
- [x] 結合された `style.css` の表示スタイルが分割前と完全に一致し、各画面のUIに崩れがないこと。
