---
ID: 041
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ウェルカム画面オススメ本グリッドのローディングプレースホルダーの導入 (ID: 041)

## 1. 概要 / Summary
アプリ起動時や初期読込時のウェルカム画面（`/#/welcome`）において、オススメ書籍グリッドのロード中にスケルトンスクリーン（ローディングプレースホルダー）を表示し、非同期でカードをフェードイン表示させることで、レイアウトシフトを防ぎ、リッチなUXを構築します。

## 2. 影響範囲 / Impact Scope
- **ビュー (View)**: 
  - `index.html` および `src/css/modules/welcome.css` の更新。
- **制御ロジック (Controller)**:
  - `src/js/modules/ui.js` の `setupPredefinedBooksGrids` 関数の非同期更新ロジックへのリファクタリング。
- **テスト (Test)**:
  - 新規ユニットテスト `tests/unit/placeholder.test.js` [NEW] の追加。

## 3. 脅威モデルへの影響 / Security & Threat Review
本機能は内部的な表示遅延（`setTimeout`）およびCSSアニメーションのみを追加するため、特に追加のセキュリティ脅威（STRIDE）は想定されません。しかし、`setTimeout` 実行時にコンテキストやシーンの遷移（ハッシュ変更）が発生した場合に、アンロード済みのDOMを操作してエラーが起きないよう安全な参照チェックおよびライフサイクルイベントの整合性を担保します。

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/041-welcome-books-loading-placeholder`

### 4.1 設計ドキュメントの更新
- `docs/DSN-01-high_level_design.md`: 基本設計にプレースホルダー表示シーケンスの考え方を追記。

### 4.2 スタイリングの定義
- `welcome.css` にて `.book-card-skeleton` などのスケルトンスクリーン用スタイル、および `.book-card.fade-in` アニメーションを定義。

### 4.3 HTMLの更新
- `index.html` の `developer-books-grid` および `reader-books-grid` に、初期状態で表示される静的プレースホルダー（各3個）を配置。

### 4.4 制御ロジックの非同期化
- `ui.js` の `setupPredefinedBooksGrids` にて、
  1. 初期表示としてグリッドにプレースホルダーをレンダリング。
  2. `setTimeout` (600ms) の後に、本物カード（`fade-in` クラス付き）を差し替えてレンダリングする。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `index.html` にて初期表示時にスケルトンスクリーンが正常に表示されること。
- [x] 600msの遅延の後に、書籍カードがスムーズにフェードイン表示されること。
- [x] 各配色テーマ（セピア、ライト、ダーク、ブラック）においてスケルトンの色調が適合すること。
- [x] プレースホルダーの動作およびタイミングを検証するユニットテストがパスすること。
- [x] すべてのE2EテストおよびClosure Compilerビルドが正常パスすること。
