---
ID: 036
種別: Feature
優先度: Medium
ステータス: Open (In Progress)
---

# [FEAT] Routerの実装とURLによる状態ディスパッチ機能 (ID: 036)

## 1. 概要 / Summary

バックログ [020-implement-router.md](../backlogs/closed/020-implement-router.md) をプロモートしたイシュー。

読書状態や表示画面（ウェルカム画面、読書画面）をブラウザの URL ハッシュを用いて管理・ディスパッチする Router 機構を導入します。これにより、特定の書籍への直リンクによる起動、ブラウザの履歴キー（戻る・進む）による遷移、およびリロード時の読書状態の自動復元を実現します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [NEW] [`src/js/modules/router.js`](../../src/js/modules/router.js) — `Router` クラスの実装
- [MODIFY] [`src/js/modules/scene.js`](../../src/js/modules/scene.js) — `SceneDirector` でのアクティブシーン状態とURLハッシュの整合性維持
- [MODIFY] [`src/js/modules/yuzora.js`](../../src/js/modules/yuzora.js) — 起動時（`boot`）における `Router` のセットアップ・起動処理
- [MODIFY] [`src/js/modules/viewer.js`](../../src/js/modules/viewer.js) — URLパラメータによる推奨書籍の直接ロード・しおり復元ロジックの移行
- [MODIFY] [`src/js/modules/commands.js`](../../src/js/modules/commands.js) — `ExitReaderCommand` での遷移トリガーを `location.hash` の書き換えに移行
- [NEW] [`tests/unit/router.test.js`](../../tests/unit/router.test.js) — Routerのパス解決・パラメータ抽出・コールバック実行のユニットテスト
- [MODIFY] [`src/externs.js`](../../src/externs.js) — `RouterInterface` の追加
- [MODIFY] [`Makefile`](../../Makefile) — `JS_SRCS` に `router.js` を追加
- [MODIFY] [`index.html`](../../index.html) — スクリプト読み込みに `router.js` を追加
- [MODIFY] [`docs/DSN-02-low_level_design.md`](../../docs/DSN-02-low_level_design.md) — ルーティング連携シーケンス仕様の追記

---

## 3. 実装方針 / Implementation Plan

Target Branch: `feat/036-implement-router`

### ステップ 1: `Router` クラスの新規実装
- パスとコールバックを管理するクラスを定義。
- パス定義に含まれる動的パラメータ（例：`/reader/:bookId`）や、クエリパラメータ（例：`/reader?book=kokoro`）をパースし、コールバック関数に引数として引き渡すパースエンジン（正規表現）を構築。
- `listen()` で `window.addEventListener('hashchange', ...)` をバインド。

### ステップ 2: 状態遷移とURLハッシュの統合
- イベントハンドラー内での画面切り替え指示（オススメ書籍カードのクリックや、戻るボタンのクリック）は、直接 `transitionTo` を呼ぶのではなく、`location.hash = ...` を更新するように変更。
- ルーターのルート定義：
  - `#/welcome` ➔ `SceneDirector.transitionTo('welcome')`
  - `#/reader` ➔ URL内の `book` または `local` パラメータに応じて対応する書籍をロードし、`SceneDirector.transitionTo('reader')`
    - ※ 推奨書籍は `loadPredefinedBook(bookId)` を実行。
    - ※ ローカルファイルは、リロード時に `SessionRepository` から同一ファイル名が検知でき、かつキャッシュが有効な場合のみ復元。不可能な場合は警告表示のうえ `#/welcome` へリダイレクト。

### ステップ 3: ユニットテストおよびビルド・externsの設定
- `tests/unit/router.test.js` を新規作成し、URLハッシュの各パターンの解決動作、およびクエリパラメータのパース精度を検証するテストコードを実装。
- `externs.js` に `RouterInterface`（`register`, `listen`, `navigate` 等）を追加し、Closure Compiler ADVANCED_OPTIMIZATIONS による名前破壊を防止。

---

## 4. 完了条件 / Success Criteria (DoD)

- [ ] URLハッシュに `#/reader?book=kokoro` を指定してリロードした際、ウェルカム画面を通らず直接「こころ」がロードされ、読書画面が表示されること。
- [ ] 読書画面の「戻る」ボタンを押した際、URLハッシュが `#/welcome` に変わり、履歴が残り、ホーム画面に戻ること。
- [ ] ブラウザの「戻る」ボタンを押した際、読書画面からホーム画面へ適切に戻り、イベントの二重登録などの不具合が発生しないこと。
- [ ] `npm run test:unit` が全件パスすること。
- [ ] `npm run test:e2e` が全件パスすること。
- [ ] `make all` による Closure Compiler ビルドがエラーなしで成功すること。
