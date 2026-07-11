---
ID: 052
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [ENH] ビルドバージョン番号をデバッグメニューで確認できるようにする (ID: 052)

## 1. 概要 / Summary

ビルドごとに埋め込まれたバージョン識別子（Git ショートハッシュ、ビルド日時）を
デバッグモーダル（`#debug-modal`）内に表示することで、ユーザー・開発者が
「どのバージョンのコードが実際に動いているか」を一目で確認できるようにする。

### 背景・モチベーション

Issue 059 の対応時、修正を行っても**ブラウザキャッシュが原因**で古いコードが実行され続け、
動作確認に困難を伴った。現在は実行中のコードがどのビルドかを確認する手段がなく、
デバッグ効率の低下・誤診断につながるリスクがある。

ビルドバージョンをデバッグメニューで確認できれば:
- 開発者がキャッシュ汚染を即座に検出できる
- バグ報告の際にユーザーが現行バージョンを正確に伝えられる
- Issue 060 (キャッシュバスター) と組み合わせることで、バージョン追跡が完結する

### 期待する表示内容

デバッグモーダルの「システム状態 (Monitor)」タブに以下のような情報を表示:

```
Build: a1b2c3d  2026-07-11T22:00:00+09:00
```

またはコンパクトに:

```
v20260711-a1b2c3d
```

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

| ファイル | 変更内容 |
| :--- | :--- |
| [`Makefile`](../../Makefile) | `BUILD_ID`・`BUILD_DATE` 変数の定義と `index.html` への `<meta>` タグ埋め込みステップを追加 |
| [`index.html`](../../index.html) | `<head>` 内に `<meta name="build-id">` / `<meta name="build-date">` タグを追加（テンプレート行として管理） |
| [`src/js/modules/config.js`](../../src/js/modules/config.js) | `ViewContext` にビルド情報用の DOM 参照フィールドを追加（任意）|
| [`src/js/modules/commands.js`](../../src/js/modules/commands.js) | `updateDebugMonitor()` を拡張して Build ID / Date をモニター出力に含める |
| [`src/externs.js`](../../src/externs.js) | 新規プロパティを Closure Compiler 向けに型定義 |

---

## 3. 設計方針 / Design Approach

### 3.1 アーキテクチャ適合性

本プロジェクトはクライアントサイドのみで完結するサーバーレスアーキテクチャ（`MNG-00`
に定義）を採用している。そのため、ビルド情報の埋め込みは**ビルド時**に静的に行い、
ランタイムで外部リソースに問い合わせない。

### 3.2 埋め込み方法の選択

**`<meta>` タグ方式**（推奨）を採用する。理由:

- `data-*` 属性を `<html>` や `<body>` に設置すると、`Makefile` の `sed` 置換ターゲットが曖昧になる
- `<meta name="build-id" content="PLACEHOLDER">` 形式は行が明確で `sed` 置換が容易
- 既存の CSP (`default-src 'self'`) に違反しない
- JS が `document.querySelector('meta[name="build-id"]').content` で読み取れる

Issue 060 の `BUILD_ID` 変数と同一のものを再利用し、整合性を保つ。

### 3.3 JS での読み取りと表示

既存の `commands.js::updateDebugMonitor()` を拡張する方針が最小侵食:

```js
updateDebugMonitor() {
    const viewContext = ...;
    if (viewContext.debugMonitor) {
        const buildId = document.querySelector('meta[name="build-id"]')?.content ?? 'dev';
        const buildDate = document.querySelector('meta[name="build-date"]')?.content ?? '---';
        viewContext.debugMonitor.textContent =
            `Build: ${buildId}  ${buildDate}\nHistory: ${this.commandHistory.length} operations.`;
    }
}
```

### 3.4 Makefile ステップの追加

```makefile
BUILD_ID   := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
BUILD_DATE := $(shell date -Iseconds)

# build後に meta タグを書き換える（index.html 内の PLACEHOLDER を実際の値に置換）
sed -i 's|content="BUILD_ID_PLACEHOLDER"|content="$(BUILD_ID)"|' index.html
sed -i 's|content="BUILD_DATE_PLACEHOLDER"|content="$(BUILD_DATE)"|' index.html
```

`make clean` 時は `git checkout index.html` でプレースホルダー状態に戻す。
またはテンプレートファイル（`index.html.template`）アプローチも検討可能。

### 3.5 セキュリティ考慮事項

- ビルド情報は `<meta>` タグの `content` 属性に格納するため、HTML インジェクションリスクは発生しない
- JS 側で `textContent`（非 `innerHTML`）に代入するため XSS リスクはない
- Git ショートハッシュは英数字のみであり、サニタイズ不要

---

## 4. 実装ステップ / Implementation Steps

1. `index.html` の `<head>` に以下のプレースホルダー行を追加:
   ```html
   <meta name="build-id" content="BUILD_ID_PLACEHOLDER">
   <meta name="build-date" content="BUILD_DATE_PLACEHOLDER">
   ```
2. `Makefile` に `BUILD_ID` / `BUILD_DATE` 変数を定義し、ビルドステップ末尾に `sed` 置換を追加する。
3. `make clean` に `git checkout -- index.html` を追加し、プレースホルダーへの復元を保証する。
4. `commands.js::updateDebugMonitor()` を拡張してビルド情報を表示する。
5. Closure Compiler の型安全性のため、`src/externs.js` に新規プロパティ型定義を追加する（必要に応じて）。
6. `npm run lint` および `make` でエラーなしを確認する。

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `make` を実行すると `index.html` の `<meta name="build-id">` / `<meta name="build-date">` が実際の値に書き換えられること
- [ ] デバッグモーダルを開いた際、「システム状態」タブの `#debug-monitor` に Build ID と日時が表示されること
- [ ] 異なるコミット状態で `make` を2回実行すると、異なる `build-id` 値が生成されること
- [ ] `make clean` 後、`index.html` がプレースホルダー状態に戻ること
- [ ] `npm run lint` および `make` がエラーなしで完了すること
- [ ] すべての E2E テスト (`npm run test:e2e`) とユニットテスト (`npm run test:unit`) が正常にパスすること
