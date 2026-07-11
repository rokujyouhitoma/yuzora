---
ID: 061
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ビルドバージョン番号をデバッグメニューで確認できるようにする (ID: 061)

## 1. 概要 / Summary

ビルドごとに埋め込まれたバージョン識別子（Git ショートハッシュ・ビルド日時 UTC）を
デバッグモーダル（`#debug-modal`）の「システム状態」タブ (`#debug-monitor`) の先頭行に表示する。

`Makefile` のビルドステップで `BUILD_ID`（Git ショートハッシュ）と `BUILD_DATE`（UTC固定）を
`index.html` の `<meta>` タグへ静的に埋め込み、JS 側から読み取ってモニターに表示する。

Issue 060（キャッシュバスター）と同一の `BUILD_ID` 変数を共有し、整合性を保つ。

**MNG-00 適合性**: クライアントサイドのみで完結するサーバーレスアーキテクチャを維持。
ランタイムで外部リソースへの問い合わせは一切行わない。

---

## 2. トレーサビリティ / Traceability

- 関連要求 (URD): —
- 関連要件 (SRD): —
- 関連バックログ: [052-show-build-version-in-debug-menu.md](../backlogs/052-show-build-version-in-debug-menu.md)
- 関連Issue: [060-cache-buster-on-build-to-fix-stale-js-cache.md](060-cache-buster-on-build-to-fix-stale-js-cache.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [`Makefile`](../../Makefile) — `BUILD_ID`/`BUILD_DATE` 変数定義と `index.html` 書き換えステップ、`clean` ターゲットのリストア処理追加
- [ ] [`index.html`](../../index.html) — `<head>` 内にビルド情報 `<meta>` プレースホルダー2行を追加
- [ ] [`src/js/modules/commands.js`](../../src/js/modules/commands.js) — `updateDebugMonitor()` にビルド情報行を追加
- [ ] [`.github/workflows/static.yml`](../../.github/workflows/static.yml) — GitHub Pages デプロイ時にも `index.html` 書き換えを実行
- [ ] [`docs/DSN-02-low_level_design.md`](../DSN-02-low_level_design.md) — セクション 6.1「収集対象パラメータスキーマ」に `build` フィールドを追加

---

## 4. 実装方針 / Implementation Plan

Target Branch: `feat/061-show-build-version-in-debug-menu`

### Step 1: `index.html` にプレースホルダー `<meta>` タグを追加

`<head>` 内、CSP `<meta>` の直後に以下2行を挿入:

```html
<meta name="build-id" content="BUILD_ID_PLACEHOLDER">
<meta name="build-date" content="BUILD_DATE_PLACEHOLDER">
```

### Step 2: `Makefile` を更新

`BUILD_ID`・`BUILD_DATE` 変数定義と、ビルドステップ末尾の書き換えコマンドを追加。
Issue 060 も同時に実装されていない場合は、この Issue でキャッシュバスターも対応する。

```makefile
BUILD_ID   := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
BUILD_DATE := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
```

ビルドレシピ末尾:
```makefile
	sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"$(BUILD_ID)\"|" index.html
	sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"$(BUILD_DATE)\"|" index.html
```

`clean` ターゲット:
```makefile
clean:
	rm -f $(JS_OUT) $(CSS_OUT)
	# WARNING: This discards all uncommitted changes to index.html.
	# Do not run if you have manual edits to index.html that haven't been committed.
	git checkout -- index.html
```

### Step 3: `commands.js::updateDebugMonitor()` を拡張

現在の実装（L637–642）:
```js
updateDebugMonitor() {
    const viewContext = ...;
    if (viewContext.debugMonitor) {
        viewContext.debugMonitor.textContent = `History: ${this.commandHistory.length} operations.`;
    }
}
```

変更後:
```js
updateDebugMonitor() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.debugMonitor) {
        const buildId = document.querySelector('meta[name="build-id"]')?.content ?? 'dev';
        const buildDate = document.querySelector('meta[name="build-date"]')?.content ?? '---';
        viewContext.debugMonitor.textContent =
            `Build: ${buildId}  ${buildDate}\nHistory: ${this.commandHistory.length} operations.`;
    }
}
```

`textContent` 代入のため XSS リスクなし。`meta[name]` セレクターは Closure Compiler
`ADVANCED_OPTIMIZATIONS` で問題なく動作する（既存の類似パターンあり）。

### Step 4: `static.yml` を更新

GitHub Pages デプロイビルドで `index.html` にも書き換えを適用する:

```yaml
- name: Build static assets
  run: |
    make main-min.js src/css/style.css
    BUILD_ID=$(git rev-parse --short HEAD)
    BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"${BUILD_ID}\"|" index.html
    sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"${BUILD_DATE}\"|" index.html
```

### Step 5: `DSN-02` を更新

セクション 6.1「収集対象パラメータスキーマ」の JSON スキーマに `build` フィールドを追記:
```json
{
  "build": {
    "id": "string (Git ショートハッシュ / dev)",
    "date": "string (UTC ISO8601形式 / ---)"
  },
  ...
}
```

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `make` を実行すると `index.html` の `<meta name="build-id">` / `<meta name="build-date">` が実際の値（UTC）に書き換えられること
- [ ] デバッグモーダルを開いた際、「システム状態」タブの `#debug-monitor` の先頭に `Build: <hash>  <date>` が表示されること
- [ ] 表示される `BUILD_DATE` が UTC 形式（末尾 `Z`）であること
- [ ] ビルド情報はデバッグモーダル内のみに表示され、通常のウェルカム・リーダー画面には露出しないこと
- [ ] `make clean` 後、`index.html` がプレースホルダー状態に戻ること
- [ ] GitHub Actions `static.yml` でデプロイされた GitHub Pages の `index.html` にビルド情報が埋め込まれていること（手動確認）
- [ ] `npm run lint`・`npm run test:types`・`make` がエラーなしで完了すること
- [ ] すべての E2E テスト (`npm run test:e2e`) とユニットテスト (`npm run test:unit`) が正常にパスすること
- [ ] 実装は DSN-01 / DSN-02 設計仕様と完全に一致しており、デッドドキュメントが存在しないこと
