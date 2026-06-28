---
ID: 010
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] デバッグ画面の拡大表示（大部分をカバーする広幅ウィンドウ化） (ID: 010)

## 1. 概要 / Summary
開発および検証時に表示される「デバッグ情報 & 操作」のウィンドウ（`#debug-modal`）について、丸角や枠線、半透明のオーバーレイといったウィンドウとしての質感を美しく残したまま、画面の大部分を覆うサイズへと拡大します。
これにより、大容量の操作履歴 JSON やレイアウト診断 Markdown レポートの視認性および編集・確認作業の効率を最大化します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-06-debug (デバッグ検証性の向上)
- 関連バックログ: [014-full-screen-debug-window.md](../backlogs/closed/014-full-screen-debug-window.md) (ID: 014 - Promoted)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/css/style.css](../../src/css/style.css) (.debug-modal のスタイル定義)
- [x] [docs/DSN-01-high_level_design.md](../../docs/DSN-01-high_level_design.md) (デバッグ画面コンポーネント構成図)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/010-large-debug-window`

1. **`.debug-modal` CSS クラスの変更 (`src/css/style.css`)**:
   - `width: 90%;` をそのまま生かしつつ、`max-width: 500px;` から `max-width: 1200px;` （大画面での最大幅）へ拡張。
   - `max-height: 85vh;` から `max-height: 90vh;` もしくは固定高 `height: 90vh;` に変更して高さを画面の大部分まで拡大。
   - ウィンドウの角丸 `border-radius: 16px`、ボーダー、背景ぼかし（backdrop-filter）、背後の半透明のオーバーレイ（`debug-modal-overlay`）はそのまま維持。
2. **モーダルボディのレイアウト伸縮調整**:
   - `.debug-modal-body` 内で要素がウィンドウ全体の高さ拡大に合わせて適切に伸び縮みするよう、`display: flex; flex-direction: column;` の中で、テキストエリアプレビュー領域（`#debug-history-json` や `#diagnose-report-output`）が利用可能な縦方向スペースを一杯に使うように、`flex: 1;` などの適切な Flexbox 伸張プロパティを設定。
   - テキストエリア自体に `height: 100%;` や `min-height: 250px;` などを設定して、操作履歴 JSON や診断レポートが長くても十分にスクロールして見渡せるようにする。
3. **基本設計書（DSN-01）の更新**:
   - デバッグUI構成のコンポーネント仕様にて、モーダルウィンドウの想定サイズや適用方針に関する設計記述を同期して更新する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] PCおよび大画面環境において、デバッグ画面（`d`キーで展開）がウィンドウ風の質感（丸角・背後グレー透過オーバーレイ）を残したまま、画面の大部分（最大幅 1200px、最大高さ 90vh）に広がって美しくレイアウト表示されること。
- [x] モバイルや小画面環境においては、画面幅の 90% に自動で縮小フィット（レスポンシブ動作）し、ウィンドウの下部が見切れたりしないこと。
- [x] デバッグボディ内部 of テキストエリア（操作履歴および診断レポート）が、ウィンドウ全体の高さに追従して縦方向に引き伸ばされ、以前よりも多くの情報（行数）が一画面で確認できること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 本実装は [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
