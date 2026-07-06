---
ID: 039
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 起動時のデフォルトルート自動リダイレクト機能 (ID: 039)

## 1. 概要 / Summary
アプリ起動時にURIのハッシュ部分が空（ルートURL `/`）である場合、ブラウザのアドレスバーに `/#/welcome` を自動補完してデフォルトルートへリダイレクトします。これによりアドレスバーの表示と表示画面の整合性を保ち、正しい画面遷移（ルーティング）を実現します。

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): 
- 関連要件 (SRD): 
- 関連バックログ: [035-auto-redirect-to-welcome-route.md](../backlogs/035-auto-redirect-to-welcome-route.md)

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [router.js](file:///workspace/yuzora/yuzora/src/js/frameworks/router.js) (自動リダイレクトロジックの追加)
- [MODIFY] [router.test.js](file:///workspace/yuzora/yuzora/tests/unit/router.test.js) (リダイレクト動作検証テストの追加)
- [MODIFY] [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) (ルーター自動リダイレクト挙動の追記)

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/039-auto-redirect-to-welcome-route`

1. **[router.js](file:///workspace/yuzora/yuzora/src/js/frameworks/router.js) の変更**:
   `Router.prototype.listen()` において、初期化時の `window.location.hash` が空（`""`, `"#"` または `"#/"`）の場合に `this.navigate("#/" + this.defaultRoute)` を呼び出し、ハッシュ変更をトリガーする。
   ハッシュが存在する場合は、従来通り `this.resolve(initialHash)` を呼び出す。
2. **[DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) の更新**:
   Routerの `listen()` の説明に「起動時にハッシュ値が空の場合、自動的に defaultRoute へのリダイレクト（アドレスバー補完）を行う」旨を追記する。
3. **[router.test.js](file:///workspace/yuzora/yuzora/tests/unit/router.test.js) の変更**:
   空のハッシュ値で `listen()` を呼び出した際に、`window.location.hash` が自動的に `#/welcome` (デフォルトルート) に更新されることを検証するテストケースを追加する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] ルートURL `/` でアプリを起動した際に、ブラウザのアドレスバーが自動的に `/#/welcome` に補完されること。
- [ ] すでに特定のハッシュ（例: `/#/reader?book=...`）が付与されたURLで直接アクセスした場合は、リダイレクトされずにそのハッシュの画面が表示されること.
- [ ] ユニットテストに「空のハッシュで起動した際にデフォルトルートへ自動リダイレクトされること」を検証するテストケースが追加され、パスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること（不整合ドキュメントの排除）。
