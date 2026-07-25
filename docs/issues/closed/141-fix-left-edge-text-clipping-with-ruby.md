---
ID: 141
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] 縦書き読書画面の左右に20pxの読書余白を設定しテキスト・ルビの見切れを解消 (ID: 141)

## 1. 概要 / Summary

ユーザー要求に従い、縦書きビューアー画面の左右両端に約 20px のエレガントな読書安全余白（サイドパディング/マージン）を導入した。
これに伴い、ページ最右端（第1行目のルビ含む）および最左端（最終行）で発生していたテキストおよびルビ（`ruby` / `rt`）がビューポートの物理境界で切り取られて表示される（見切れる）レイアウト不具合を根本解決した。

- **画面左右余白**: `--reader-padding-x: 20px` を CSS 変数およびメディアクエリに明示設定し、読書画面全体に快適な 20px のセーフティゾーンを確保。
- **文字・ルビ見切れ解消**: 最右行のルビ飛び出し（`ruby-position: over`）および最左行の漢字グリフが物理境界で切り取られる現象を完全に排除（見切れ 0px）。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [base.css](../../src/css/modules/base.css) — `:root` に `--reader-padding-x: 20px` のグローバル余白変数を設定
- [x] [reader.css](../../src/css/modules/reader.css) — `.reader-viewport` の `left/right` 位置計算および `.reader-content` のカラム幅・段落余白 (`margin-right: 12px; margin-left: 6px;`) の最適化
- [x] [style.css](../../src/css/style.css) — グローバルスタイルの同期
- [x] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — 左右 20px 余白の確保および 0px 見切れ検証の E2E アサーション追加

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

### RCA 調査結果

`src/css/modules/reader.css` の既存 `:root` 変数設定:
```css
@media (min-width: 768px) {
    :root {
        --reader-padding-x: 0px;
        --reader-viewport-padding-x: 40px;
    }
}
```

**問題の本質とメカニズム**:
1. 従来の設計において `--reader-padding-x` が `0px` に設定されていたため、スクロールビューポート `.reader-viewport` が物理画面の左右両端に密着して配置されていた。
2. これにより、第1行目のルビ (`rt`) が親文字の右側に飛び出した際や、最左行の漢字の左端が画面境界に達した際、`overflow-x: hidden` の物理境界にダイレクトに接触して文字の左右が半分切れる（見切れる）視覚的不具合を生んでいた。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  1. `:root` およびレスポンシブメディアクエリ (`reader.css`, `style.css`, `base.css`) において、`--reader-padding-x: 20px` を設定し、画面左右に 20px の美しい安定余白を常時確保する。
  2. `column-width` の計算式 `calc(50% - var(--reader-padding-x) - ...)` および `.reader-content p` の `margin-left: 6px; margin-right: 12px;` セーフティを同期更新し、縦書きマルチカラムの整列精度を保護した。
  3. E2E テストで左右 20px の余白存在および見切れゼロを検証するアサーションを追加した。

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/141-fix-left-edge-text-clipping-with-ruby`

1. `base.css`, `reader.css`, `style.css` で `--reader-padding-x: 20px` を設定し、`column-width` のアライメント計算を更新。
2. `tests/e2e/viewer.spec.js` に左右 20px 余白と見切れ防止検証を追加。
3. `npm run healthcheck` を実行し、完全パスを確認。

---

## 6. 完了条件 / Success Criteria (DoD)

- [x] ビューアー画面左右両端に 20px の読書余白が常に確保されていること。
- [x] 最右端のルビ（`rt`）および最左端の文字の見切れが 0px（完全収容量）であること。
- [x] `npm run healthcheck` が 100% グリーン通過すること。
- [x] [DSN-01](../../designs/DSN-01-high_level_design.md) のレイアウト要件を満たしていること。

---

## 7. トレーサビリティ / Traceability Matrix

- **要件**: [REQ-01](../../requirements/REQ-01-user_requirements_specification.md), [REQ-03](../../requirements/REQ-03-system_requirements.md)
- **設計**: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)
- **テスト**: `tests/e2e/viewer.spec.js`, `npm run healthcheck`
