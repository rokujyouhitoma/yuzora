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

デバッグモーダルの「システム状態 (Monitor)」タブの `#debug-monitor` 先頭行に表示:

```
Build: a1b2c3d  2026-07-11T13:00:00Z
History: N operations.
```

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

| ファイル | 変更内容 |
| :--- | :--- |
| [`Makefile`](../../Makefile) | `BUILD_ID`・`BUILD_DATE` 変数定義、`index.html` への `<meta>` 書き込みステップ追加、`make clean` のリストア処理追加 |
| [`index.html`](../../index.html) | `<head>` 内にプレースホルダー `<meta>` タグ2行を追加（ビルド時に実値へ置換） |
| [`src/js/modules/commands.js`](../../src/js/modules/commands.js) | `updateDebugMonitor()` を拡張して Build ID / Date をモニター出力先頭に追加 |
| [`src/js/modules/config.js`](../../src/js/modules/config.js) | `ViewContext` への DOM 参照追加は不要（`document.querySelector` で直接読み取り） |
| [`src/externs.js`](../../src/externs.js) | 変更なし（`document.querySelector` は既存の Externs に含まれる） |
| [`.github/workflows/static.yml`](../../.github/workflows/static.yml) | デプロイビルドステップに `index.html` 書き換えコマンドを追加 |

---

## 3. 設計方針 / Design Approach

### 3.1 アーキテクチャ適合性（SA）

本プロジェクトはクライアントサイドのみで完結するサーバーレスアーキテクチャ（`MNG-00`
に定義）を採用している。そのため、ビルド情報の埋め込みは**ビルド時**に静的に行い、
ランタイムで外部リソースに問い合わせない。

### 3.2 埋め込み方法の選択と根拠（SA）

**`<meta>` タグ + Makefile `sed` 置換方式**を採用する。

| 方式 | メリット | デメリット |
| :--- | :--- | :--- |
| `<meta>` タグ + sed | シンプル、ファイル追加なし、JS から容易に読み取れる | `index.html` がビルドで変更される（dirty state）|
| `index.html.template` | リポジトリに書き換え済みファイルが混入しない | ビルドプロセスの複雑化、ファイル追加が必要 |
| 専用 `build-info.js` 生成 | JS モジュールとして型安全に管理できる | ファイル追加、Closure Compiler の `--js` への追加が必要 |

3方式を比較した結果、**`<meta>` タグ方式**は既存の Makefile・CSP・JS 読み取り方式との親和性が最も高い。
ただし後述の「dirty state 問題」への対処を必ず実施する。

### 3.3 Makefile ステップの追加（SA）

```makefile
BUILD_ID   := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
BUILD_DATE := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
```

> **⚠ SA 注意点 — タイムゾーン統一**
> `date -Iseconds` は実行環境のタイムゾーンに依存するため、ローカル（JST）と
> GitHub Actions（UTC）で異なる出力になる。`date -u +%Y-%m-%dT%H:%M:%SZ` で
> **常に UTC（末尾 `Z` 固定）** に統一する。

```makefile
# キャッシュバスター付与（Issue 060 との共有）
sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"$(BUILD_ID)\"|" index.html
sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"$(BUILD_DATE)\"|" index.html
```

> **⚠ SA 注意点 — `sed` のデリミタ選択**
> `BUILD_DATE` が UTC 固定であれば `:` や `+` は含まれず `|` デリミタで安全。
> ただし `echo dev` フォールバック以外の文字が混入しないよう引数の `$()` 展開は
> ダブルクォートで囲む（シングルクォートでは変数展開されない）。

### 3.4 dirty state 問題の解決（SA・最重要）

`sed -i` により `index.html` が変更されると、`git status` が dirty になり：
- CI（`ci.yml`）の `make` 実行後に E2E テストが変更済み `index.html` を対象とする → **これは正しい動作**
- しかし CI 完了後のチェックアウト後に汚染状態が残る心配はない（GitHub Actions は都度クリーンな環境）
- **ローカル開発では** `make` 後に `index.html` が変更済みとなり、意図しない `git add` でビルド成果物をコミットするリスクがある

**対策：**

1. `make clean` に `git checkout -- index.html` を追加してプレースホルダーに戻す：
   ```makefile
   clean:
       rm -f $(JS_OUT) $(CSS_OUT)
       git checkout -- index.html
   ```
   > **⚠ SA 注意点** — `git checkout -- index.html` は `index.html` の
   > **すべての未コミット変更を破棄**する。`index.html` を直接編集中の場合は
   > `make clean` を実行しないよう注意する（ドキュメントに明記が必要）。

2. `.gitignore` への追加は行わない（`index.html` はリポジトリ管理対象）。

3. **代替案（推奨度 高）**: `make clean` の代わりに、`$(JS_OUT)` ビルド前にプレースホルダーを事前チェックし、
   ビルド成果物を `artifacts/` 等の `.gitignore` 対象ディレクトリへ出力する方式。
   ただし既存アーキテクチャへの変更が大きいため、このバックログのスコープ外とする。

### 3.5 CI/CD パイプラインへの影響（SA）

現在の CI/CD フローは以下の2段階:

```
ci.yml: make → lint → typecheck → unit tests → E2E tests
          ↓ (成功時)
static.yml: make main-min.js src/css/style.css → Pages デプロイ
```

**問題点**:
- `static.yml` の `make` コマンド（`make main-min.js src/css/style.css`）は `index.html` を対象としていないため、
  GitHub Pages にデプロイされる `index.html` には**ビルド情報が埋め込まれない**。
- `ci.yml` の `make` はフル `make`（`all`）を実行するため `index.html` が書き換えられるが、
  その結果は E2E テストの対象となるだけでデプロイには使われない。

**対処**:
`static.yml` のビルドステップに `index.html` 書き換えコマンドを明示的に追加する:

```yaml
- name: Build static assets
  run: |
    make main-min.js src/css/style.css
    BUILD_ID=$(git rev-parse --short HEAD)
    BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"${BUILD_ID}\"|" index.html
    sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"${BUILD_DATE}\"|" index.html
```

### 3.6 JS での読み取りと表示

既存の `commands.js::updateDebugMonitor()` を最小変更で拡張する:

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

`meta` 要素の `content` は文字列型（`DOMString`）であり、Closure Compiler の
`ADVANCED_OPTIMIZATIONS` で問題なく扱われる。

---

## 4. セキュリティ評価 / Security Analysis（SC）

### 4.1 情報開示リスク（CWE-200: Exposure of Sensitive Information）

`<meta name="build-id" content="a1b2c3d">` は HTML ソースを閲覧できる**全ユーザーに公開**される。
これにより攻撃者はデプロイ済みコードの Git ハッシュを特定できる。

**リスク評価**:

| 項目 | 評価 |
| :--- | :--- |
| 機密性 | 低 — 本プロジェクトは GitHub 公開リポジトリであり、コードは既知。ハッシュの公開に新たな情報は少ない |
| 悪用可能性 | 低 — クライアントサイドのみのアプリであり、ハッシュから攻撃対象サーバーを特定できない |
| バージョン固定攻撃 | 低 — 特定バージョンに既知脆弱性があった場合にターゲットにされる可能性はあるが、本アプリの攻撃面は小さい |
| 総合 | **許容可能（Acceptable）** — ただし `BUILD_DATE` のタイムゾーン情報には注意（後述） |

### 4.2 タイムゾーン情報の漏洩防止（SC）

`BUILD_DATE` に JST（`+09:00`）を含む `date -Iseconds` の出力を使用すると、
開発者またはビルドサーバーの地理的位置・タイムゾーンが推測可能となる（CWE-200 の軽微な例）。

**対策**: `date -u +%Y-%m-%dT%H:%M:%SZ` で **UTC 固定**とする（SA 節 3.3 と同じ）。
これにより地理的情報の漏洩を防ぎ、ローカルと CI の出力も一致する。

### 4.3 XSS リスク（CWE-79）

- **`<meta>` タグへの書き込み（Makefile）**: `sed` による静的置換であり、ビルド時の入力（`git rev-parse` 出力）は英数字のみ。XSS リスクなし。
- **JS での表示（`commands.js`）**: `textContent` 代入（非 `innerHTML`）のため XSS リスクなし。現設計は正しい。

### 4.4 デバッグ情報のスコープ限定（SC・現設計は適切）

ビルド情報の表示先が `#debug-monitor`（デバッグモーダル内）のみに限定されている現設計は
最小権限の原則に沿っており**適切**。通常のリーダー画面やウェルカム画面には露出しない。
この設計を実装時も厳守すること。

### 4.5 `make clean` の git 操作リスク（SC・SA 共通）

`git checkout -- index.html` は `index.html` の未コミット変更を**すべて破棄**する破壊的操作であり、
開発者が意図しない変更消失を招く恐れがある。

**対策**:
- `make clean` の `PHONY` ターゲットにコメントで警告を明記する。
- または `git diff --quiet -- index.html || echo "WARNING: index.html has uncommitted changes."` を
  事前チェックとして挿入する。

---

## 5. 実装ステップ / Implementation Steps

1. `index.html` の `<head>` 内（CSP `<meta>` の直後）にプレースホルダー行を追加:
   ```html
   <meta name="build-id" content="BUILD_ID_PLACEHOLDER">
   <meta name="build-date" content="BUILD_DATE_PLACEHOLDER">
   ```
2. `Makefile` に `BUILD_ID` / `BUILD_DATE` 変数を定義し（UTC 固定）、ビルドステップ末尾に `sed` 置換を追加。
3. `Makefile` の `clean` ターゲットに `git checkout -- index.html` と警告コメントを追加。
4. `commands.js::updateDebugMonitor()` を拡張し、ビルド情報を `#debug-monitor` 先頭行に表示。
5. `.github/workflows/static.yml` のビルドステップに `index.html` 書き換えコマンドを追加（セクション 3.5 参照）。
6. `npm run lint`・型チェック・`make` でエラーなしを確認する。

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `make` を実行すると `index.html` の `<meta name="build-id">` / `<meta name="build-date">` が実際の値（UTC）に書き換えられること
- [ ] デバッグモーダルを開いた際、「システム状態」タブの `#debug-monitor` に Build ID と日時が先頭行に表示されること
- [ ] 表示される `BUILD_DATE` は UTC 形式（末尾 `Z`）であること
- [ ] 異なるコミット状態で `make` を2回実行すると、異なる `build-id` 値が生成されること
- [ ] `make clean` 後、`index.html` がプレースホルダー状態に戻ること
- [ ] GitHub Actions の `static.yml` でデプロイされた GitHub Pages の `index.html` にビルド情報が埋め込まれていること
- [ ] ビルド情報はデバッグモーダル内のみに表示され、通常の画面（ウェルカム・リーダー）には露出しないこと
- [ ] `npm run lint`・`npm run test:types`・`make` がエラーなしで完了すること
- [ ] すべての E2E テスト (`npm run test:e2e`) とユニットテスト (`npm run test:unit`) が正常にパスすること
