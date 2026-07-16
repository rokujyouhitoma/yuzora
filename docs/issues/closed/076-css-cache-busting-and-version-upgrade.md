---
ID: 076
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] CSSファイルのキャッシュバスター自動付与およびバージョンアップ (ID: 076)

## 1. 概要 / Summary
CSSの修正時にブラウザキャッシュによって古いレイアウト定義やスタイルルールが適用され続ける問題を防ぐため、JSファイルと同様に `Makefile` のビルド時にCSSファイルの読み込みパスへバージョンクエリパラメータ（例: `?v=xxxxxx`）を自動付与する仕組みを導入します。また、本機能の導入に伴い、アプリケーションのバージョンを `1.0.0` から `1.1.0` へアップデートします。

### 背景 / Context
- バックログ [060-cache-busting-for-css-files.md](../backlogs/closed/060-cache-busting-for-css-files.md) の要請に基づく。
- 以前に JS ファイルに対しては [060-cache-buster-on-build-to-fix-stale-js-cache.md](closed/060-cache-buster-on-build-to-fix-stale-js-cache.md) でキャッシュバスター自動埋め込みが実装されたが、CSS ファイルには適用されていなかったため、本件で拡張する。

---

## 影響範囲と関連ファイル / Scope and Affected Files
- [x] [Makefile](../../Makefile)
- [x] [index.html](../../index.html)
- [x] [package.json](../../package.json)
- [x] [package-lock.json](../../package-lock.json)

---

## 3. 実装方針 / Implementation Plan
Target Branch: `feat/076-css-cache-busting`

1. **`Makefile`**:
   - `embed-build-info` ターゲットに、`index.html` 内の `<link rel="stylesheet" href="src/css/...">` タグに対し `?v=$(BUILD_ID)` を付与・置換する sed ルールを追加する。
     ```makefile
     sed -i 's|src/css/\([^"]*\)\.css"|src/css/\1.css?v=$(BUILD_ID)"|g' index.html
     ```
2. **バージョンアップ**:
   - `package.json` および `package-lock.json` の `"version"` プロパティを `1.1.0` へ更新する。

---

## 4. 完了条件 / Success Criteria (DoD)
- [x] `make` 実行後、`index.html` 内のすべての `<link rel="stylesheet" href="src/css/...">` に現在の Git ハッシュ値を含む `?v=<BUILD_ID>` が正しく付与されていること。
- [x] `package.json` および `package-lock.json` のバージョンが `1.1.0` になっていること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
