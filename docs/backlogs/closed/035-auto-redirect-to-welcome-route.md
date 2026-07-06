---
ID: 035
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] 起動時のデフォルトルート自動リダイレクト機能 (ID: 035)

## 1. 概要 / Summary
現在、アプリの初期起動時（ルートURL `/` にアクセスした際）にハッシュ部分が空になり、URIが `/#/welcome` でない状態になります。
ユーザーの表示している画面とブラウザのアドレスバーの整合性を保ち、正しい画面遷移（ルーティング）を実現するため、起動時にハッシュが存在しない場合、あるいは空の場合に自動的にデフォルトのルートである `/#/welcome` へリダイレクト（ハッシュを補完）する機能を実装します。

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [src/js/frameworks/router.js](../../../src/js/frameworks/router.js) (Routerの初期化/listen処理)
- [tests/unit/router.test.js](../../../tests/unit/router.test.js) (Routerのユニットテスト)

## 3. 要件と技術的詳細 / Technical Specifications
- `Router.prototype.listen()` において、初期化時の `window.location.hash` が空（`""`, `"#"` または `"#/"`）の場合、`this.navigate("#/" + this.defaultRoute)` を実行する。
- ハッシュ変更イベント（`hashchange`）によって自動的に `resolve` が呼ばれるため、ハッシュが空の場合の初期 `resolve` 呼び出しはスキップする（`navigate` 後の `hashchange` に委ねる）。
- ハッシュが存在する場合は、従来通り即座に `this.resolve(initialHash)` を呼び出す。

## 4. 完了条件 / Success Criteria (DoD)
- [ ] ルートURL `/` でアプリを起動した際に、ブラウザのアドレスバーが自動的に `/#/welcome` に補完されること。
- [ ] すでに特定のハッシュ（例: `/#/reader?book=...`）が付与されたURLで直接アクセスした場合は、リダイレクトされずにそのハッシュの画面が表示されること。
- [ ] ユニットテストに「空のハッシュで起動した際にデフォルトルートへ自動リダイレクトされること」を検証するテストケースが追加され、パスすること。
- [ ] 全てのユニットテストおよびE2Eテストが正常にパスすること。
