---
ID: 020
種別: Feature
優先度: Medium
ステータス: Promoted
---

# [FEAT] Routerの実装とURLによる状態ディスパッチ機能 (ID: 020)

## 1. 概要 / Summary

読書状態や表示画面（ウェルカム画面、読書画面）をブラウザの URL ハッシュ（ハッシュルーティング）を用いてディスパッチする Router 機構を導入します。

これにより、ユーザーが特定の書籍への直リンクによる遷移、ブラウザの「進む」「戻る」ボタンによる履歴遷移、リロード時の読書状態の維持（しおり位置の復元や直前ページの保持）などが標準のWebアプリケーションの振る舞いとしてシームレスに機能するように設計します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/router.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [NEW] [`router.js`](../../src/js/modules/router.js) — `Router` クラスの新規実装
- [MODIFY] [`scene.js`](../../src/js/modules/scene.js) — シーン遷移の開始・終了処理とURLハッシュ更新処理の統合（URL変更 ➔ `hashchange` ➔ `Router` ➔ `SceneDirector` の一方向遷移フローの確立）
- [MODIFY] [`yuzora.js`](../../src/js/modules/yuzora.js) — `boot()` 内で `Router` インスタンスを生成・登録し、URLハッシュ監視を開始
- [MODIFY] [`viewer.js`](../../src/js/modules/viewer.js) — 直リンク書籍ロードおよびしおり位置の復元処理を Router 契機へ移行
- [MODIFY] [`commands.js`](../../src/js/modules/commands.js) — `ExitReaderCommand` 等での遷移ロジックを直接の Scene 呼び出しから URL ハッシュ変更（`location.hash = 'welcome'`）へ移行
- [NEW] [`router.test.js`](../../tests/unit/router.test.js) — パスパース、パラメータ抽出、ルート登録コールバック呼び出しのユニットテスト追加
- [MODIFY] [`src/externs.js`](../../src/externs.js) — `RouterInterface` の追加（ADVANCED_OPTIMIZATIONS 適用時のリネーム防止）
- [MODIFY] [`Makefile`](../../Makefile) & [`index.html`](../../index.html) — ビルド・読み込みソースに `router.js` を追加

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

### 3-1. URLハッシュ設計 (URL Hash Schema)

ブラウザの履歴同期およびパラメータ受け渡しのため、以下のURLハッシュスキームを定義します：

1. **ウェルカム（ホーム）画面**: `#welcome` または空ハッシュ `#`
2. **読書画面（推奨書籍）**: `#reader?book={bookId}` (例: `#reader?book=kokoro`)
3. **読書画面（ローカルファイル）**: `#reader?local={fileName}`  
   - ※ ローカルファイルはブラウザのセキュリティ制限上、URL直リンクからの直接ロードは不可能です。リロード時は `SessionRepository` もしくは `localStorage` にファイル内容が一時キャッシュされているか、またはセッションから復元可能な場合のみ復元し、不可能な場合はウェルカム画面 (`#welcome`) へ安全にフォールバックさせます。

### 3-2. 状態遷移フロー（単一方向コントロール）

ブラウザの「戻る」「進む」キーに正しく応答するため、状態遷移のトリガーをハッシュ変更に統一します：

```
[User Action] ➔ [location.hash の更新] ➔ [hashchange イベント発火] ➔ [Router が解決] ➔ [SceneDirector.transitionTo()] ➔ [画面の切り替え]
```

- 直接 `SceneDirector.transitionTo()` を呼ぶ代わりに、`location.hash` を書き換えることで遷移を行います。
- `hashchange` 内で `SceneDirector.transitionTo()` を呼び出す際、現在のアクティブシーンとハッシュ状態が既に一致している場合は無限ループ防止のため早期リターンします。

### 3-3. Routerクラスの仕様
- **`register(pattern, callback)`**: ルート登録。パラメータ抽出（例：`:bookId` や `?book=xxx` などのクエリパラメータ）に対応。
- **`listen()`**: `hashchange` イベントの監視を開始。初回起動時のハッシュ解決も行う。
- **`navigate(hash)`**: 指定したハッシュへのプログラム的な遷移。

---

## 4. 完了条件 / Success Criteria (DoD)

- [ ] パス登録、パラメータ抽出（クエリパラメータ・ワイルドカード）、およびコールバック実行を検証する `Router` のユニットテストがパスすること。
- [ ] ブラウザのURLハッシュを `#welcome` から `#reader?book=kokoro` に書き換えた際、画面が自動的に読書画面に切り替わり「こころ」がロードされること。
- [ ] 読書画面から「戻る」ボタンを押した際、ブラウザの履歴が1つ戻り、URLが `#welcome` となってホーム画面へ正常に戻ること。
- [ ] `#reader?book=kokoro` の直リンクURLでページをリロードした際、ウェルカム画面を表示することなく直接「こころ」の読書画面が表示されること。
- [ ] Closure Compiler (ADVANCED_OPTIMIZATIONS) による難読化ビルドが警告・エラーなしで完了すること。
- [ ] すべてのE2Eテストがパスすること。
