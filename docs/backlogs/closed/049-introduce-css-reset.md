---
ID: 049
種別: Refactor
優先度: Low
ステータス: Closed
---

# [REFACT] CSSリセット（初期化CSS）の導入検討 (ID: 049)

## 1. 概要 / Summary
現在、ブラウザ標準のCSSリセット設定（Normalize.css や Modern Reset など）が明示的に定義されておらず、各ブラウザのユーザーエージェントスタイルシート（UA Style）に依存する部分が残っています。これにより、ブラウザ（Chrome, Safari, Firefox等）によって要素のデフォルトのマージンやパディング、ボックスサイジング（`box-sizing`）が微小に異なり、縦書きマルチカラムのスクロール座標や文字見切れ判定に悪影響を与えるリスクがあります。

本対応では：
1. アプリケーションに標準的なリセットCSS（Modern CSS Reset や Normalize.css など）を導入するか、独自のミニマルなCSSリセット定義を `src/css/modules/reset.css`（または既存の `base.css`）に組み込みます。
2. ボックスモデルを `box-sizing: border-box;` に統一し、パディングや枠線がカラム幅計算に予期しない影響を与えないように共通ルールを定め、表示の互換性を強化します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [base.css](../../src/css/modules/base.css) (または新設の `reset.css`: 初期化CSSルールの組み込み)
- [ ] [Makefile](../../Makefile) (CSSビルドルール・結合ファイルのパス確認)

---

## 3. 実装方針 / Implementation Plan
1. **初期化ルールの選定**:
   - `box-sizing: border-box;` を全要素 `*, *::before, *::after` に明示的に設定します。
   - `body`, `h1`〜`h6`, `p`, `ul`, `ol`, `figure` などのデフォルトマージンおよびパディングを `0` に初期化します。
   - 画像等の置換要素に対し、余計な余白（`vertical-align` 起因など）が発生しないようにリセット設定を追加します。
2. **CSSビルドパイプラインへの統合**:
   - `base.css` または新設した `reset.css`（その場合は `Makefile` の `CSS_SRCS` ビルド配列の先頭に追加）に記述。
   - `make` を実行して、単一の結合スタイルシート `src/css/style.css` がビルドされるように結合チェーンを構成します。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] 各ブラウザの開発者ツールで表示した際、`box-sizing: border-box` やデフォルト余白のリセットが主要要素に漏れなく適用されていること。
- [ ] スタイル初期化ファイルの追加後も、ウェルカム画面や読書画面のフォントサイズ・アライメント等の見た目が既存デザインとズレず、意図通りに維持されていること。
- [ ] リセットCSSの導入による悪影響がない状態で、ビルドコマンド（`make`）および全品質ゲートウェイテスト（`npm run test`）が成功すること。
