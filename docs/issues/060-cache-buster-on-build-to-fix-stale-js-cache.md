---
ID: 060
種別: Feature
優先度: High
ステータス: Open (New)
---

# [FEAT] ビルド時にスクリプトタグへキャッシュバスター付与でブラウザキャッシュ問題を解消 (ID: 060)

## 1. 概要 / Summary

`index.html` の `<script src="...">` タグにビルドごと固有のクエリパラメータ（キャッシュバスター）を
付与することで、JS ファイルのブラウザキャッシュによる「古いコードが使われ続ける」問題を解消する。

### 背景

Issue 059 の対応時、`parser.js` を修正してもブラウザのメモリキャッシュが古い
バージョンを使い続けるため、修正が反映されていないように見える事象が発生した。
通常のリロード（F5）では `304 Not Modified` が返り、キャッシュがヒットし続ける。
ユーザーが `Ctrl+Shift+R`（強制リロード）を知らない場合や、
CDN/プロキシキャッシュ環境では恒久的に古いコードが使われるリスクがある。

### 解決策

`Makefile` のビルドステップで、ビルド時刻または Git コミットハッシュを
`index.html` の全 `<script src="...">` タグに `?v=<BUILD_ID>` として埋め込む。

例：
```html
<!-- ビルド前 -->
<script src="src/js/modules/parser.js"></script>

<!-- ビルド後 (Makefile が自動書き換え) -->
<script src="src/js/modules/parser.js?v=a1b2c3d"></script>
```

`BUILD_ID` の候補:
- `$(shell git rev-parse --short HEAD)` — Git ショートハッシュ（推奨）
- `$(shell date +%s)` — Unix タイムスタンプ

---

## 2. トレーサビリティ / Traceability

- 関連要求 (URD): —
- 関連要件 (SRD): —

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [Makefile](../../Makefile) — ビルドステップにキャッシュバスター書き換えを追加
- [ ] [index.html](../../index.html) — 書き換え対象の `<script>` タグを持つファイル
- [ ] `main-min.js` — ビルドアーティファクト（git 管理外）

---

## 4. 実装方針 / Implementation Plan

Target Branch: `feat/060-cache-buster-on-build`

1. `Makefile` に `BUILD_ID` 変数を定義する:
   ```makefile
   BUILD_ID := $(shell git rev-parse --short HEAD)
   ```
2. ビルドステップ（`make` の末尾）に `index.html` の `<script src="...">` タグを
   `sed` で書き換えるステップを追加する:
   ```makefile
   # キャッシュバスター付与（src/js/... のみ対象）
   sed -i 's|src/js/\([^"]*\)\.js"|src/js/\1.js?v=$(BUILD_ID)"|g' index.html
   ```
3. `git checkout index.html` などで、コミット前に `index.html` を元の
   クエリなし状態に戻す手順を `make clean` またはプリコミットフックとして整備する。
   もしくは `index.html.template` アプローチ（元ファイルを template として保持し、
   ビルドで出力 `index.html` を生成する）を採用する。
4. `npm run lint` および `make` でエラーなしを確認する。

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `make` を実行すると `index.html` の `<script src="src/js/...">` タグに
  `?v=<git-short-hash>` が付与されること
- [ ] 異なるコミット状態で `make` を2回実行すると、異なる `?v=` 値が生成されること
- [ ] ブラウザで `?v=` 付きの URL へのリクエストが確認でき、
  古いキャッシュが使われないことがローカルで検証できること
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること
