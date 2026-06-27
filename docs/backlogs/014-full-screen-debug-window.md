---
ID: 014
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [ENH] デバッグ画面の全画面表示（画面いっぱい化） (ID: 014)

## 1. 概要 / Summary
開発および検証時に表示される「デバッグ情報 & 操作」のウィンドウ（`#debug-modal`）について、CSSレイアウトを修正して画面いっぱいの広さ（全画面表示）に拡張します。
デバッグ用途であるため、表示領域を最大限に広げて操作履歴 JSON やレイアウト診断結果の視認性を最大化します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [src/css/style.css](../../src/css/style.css)
  - `.debug-modal` スタイルの修正（全画面対応：`width: 100vw; height: 100vh;` 等への変更）
- [docs/DSN-01-high_level_design.md](../../docs/DSN-01-high_level_design.md)
  - デバッグ画面のコンポーネント構成や表示イメージ記述の更新（事前設計更新）

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

1. **CSSスタイルクラスの全画面化（Full Screen Modal）**:
   - `.debug-modal` の現在のダイアログ表示スタイル（最大幅 500px / 最大高さ 85vh / 画面中央配置）を廃止し、画面全体を覆うようにスタイリングします。
   - `top: 0; left: 0; transform: none; width: 100vw; height: 100vh; max-width: none; max-height: none; border-radius: 0;` などの全画面カバーCSSを適用します。
   - レンダリング時のフェードインアニメーションについても、全画面表示に違和感のないシンプルな挙動へと見直します。

2. **表示情報エリアの自動拡張**:
   - モーダル全体が全画面になるため、`.debug-modal-body` 内にある「診断レポート表示エリア（`#diagnose-report-output`）」や「操作履歴 JSON 表示エリア（`#debug-history-json`）」などのスクロール可能テキストエリアの縦横高さが、画面全体のサイズに合わせて追従して最大化されるように Flexbox 等の伸縮設定（`flex-grow` / `height` / `min-height`）を調整します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] PCおよびモバイルのいずれの画面サイズにおいても、デバッグ画面（`d`キー押下時）が画面いっぱいに（余白なく全画面で）表示されること。
- [ ] 操作履歴 JSON や診断レポートのテキストエリアが、全画面のサイズに合わせて縦横に広く引き伸ばされて表示され、情報の一覧性が大幅に向上すること。
- [ ] デバッグ画面を閉じるボタン（右上および Escape キー）による非表示化が、全画面表示の状態からでも問題なく動作すること。
- [ ] すべてのE2Eテストおよびユニットテストが正常にパスすること。
- [ ] 実装は [DSN-01](../docs/DSN-01-high_level_design.md) などの設計書記述と完全に整合していること。

