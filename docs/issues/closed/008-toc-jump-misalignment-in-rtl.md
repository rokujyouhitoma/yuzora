---
ID: 008
種別: Bug
優先度: Medium
ステータス: Closed
---

# [BUG/SEC] 目次ジャンプ先がRTL縦書き時に微小にズレる問題 (ID: 008)

## 1. 概要 / Summary
目次（TOC）から見出し項目（例：「毒茸」「一」など）をクリックしてスムーズスクロールジャンプを行った際、RTL縦書き表示（`writing-mode: vertical-rl`）において、スクロールの目標位置（`pageIndex`）が本来の見出しがある位置からわずかにずれる（前後のページまたは数カラム分ズレる）不具合が発生していました。

### 再現手順 / Steps to Reproduce
1. `52396_yoko.txt`（宮本武蔵 02 地の巻）などをロードし、RTL（右から左・縦書き）表示にする。
2. 目次ドロワーを開き、「毒茸」または「一」をクリックする。
3. ジャンプ先のページを確認すると、該当の見出し項目がページ内に現れず、その後の段落（または別のページ）が表示され、位置が数カラム分ずれている。

### 再現環境 / Environment
- Browser / OS: Chrome/Firefox (Linux)
- Book / File: `52396_yoko.txt` (宮本武蔵 02 地の巻) などの縦書きRTL表示

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/app.js](../../src/js/app.js) (の `jumpToHeading` 内のページインデックス計算ロジック)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
- `getBoundingClientRect()` から算出した絶対座標 `absolutePosition` は、RTL と LTR の送り方向の違い（RTL では右端から、LTR では左端から流れる）を考慮するよう設計されましたが、要素の開始位置（RTLでは `rect.right`）の1点のみを基準に `viewportWidth` で除算し `Math.floor` で切り捨てているため、字下げやマージン、ブラウザによるカラム回り込み処理の端数影響（境界付近で 5〜10px 程度のブレ）により、要素の物理表示位置が次のページであるにもかかわらず前のページへ丸め込まれてしまうことが原因です。

---

## 4. 暫定対処と恒真対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: 
  - なし。手動でのスクロールによる位置合わせ。
* **恒久対策 (Permanent Fix)**: 
  - 見出し要素の「開始端」と「終了端」（`left` と `right`）の両方から算出された **「中心座標（Horizontal Center）」** を基準に `pageIndex` を算出します。これにより、マージンや字下げによる数ピクセル〜数十ピクセルの境界ブレを安全に吸収し、要素の大部分が実際に描画されている正しい論理ページへ正確にジャンプさせます。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/008-toc-jump-misalignment`

1. **`app.js` の `jumpToHeading` 関数の修正**:
   - `getBoundingClientRect()` から見出し要素の `left` と `right` を取得。
   - RTL および LTR それぞれのモードで、要素の「左端絶対位置」と「右端絶対位置」を算出。
   - 両者の平均値から要素の「中心絶対位置（`absoluteCenter`）」を求め、これに基づいて `pageIndex = Math.floor(absoluteCenter / viewportWidth)` を計算する。
2. **設計書との整合性確保**:
   - 本実装に伴う座標計算の変更点を [DSN-02](../../docs/DSN-02-low_level_design.md)（詳細設計書）の「5.2 目次（TOC）ジャンプ座標計算仕様」に反映・追記する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] RTL縦書き表示において、「毒茸」「一」などの見出し項目クリック時、ズレることなくその見出しが属するページへ正確にジャンプすること。
- [x] 本実装は [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
