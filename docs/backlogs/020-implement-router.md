---
ID: 020
種別: Feature
優先度: Medium
ステータス: Approved
---

# [FEAT] Routerの実装とURLによる状態ディスパッチ機能 (ID: 020)

## 1. 概要 / Summary
読書状態や表示画面（ウェルカム画面、読書画面）をブラウザの URL ハッシュ（ハッシュルーティング）または History API を用いてディスパッチする Router 機構を導入します。

これにより、ユーザーが特定の書籍への直リンクによる遷移、ブラウザの「進む」「戻る」キーによる履歴遷移、リロード時の状態維持（しおり位置の復元や直前ページの保持）などが標準のWebアプリケーションの振る舞いとしてシームレスに機能するように設計します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/router.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [router.js](../../src/js/modules/router.js) (Routerの新規追加)
- [ui.js](../../src/js/modules/ui.js) (Router呼び出しへの置換)
- [viewer.js](../../src/js/modules/viewer.js) (URLパラメータ連携・書籍ロード起動の移行)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **ハッシュベースのルーティングの実装**:
   - `window.addEventListener('hashchange')` を監視し、ハッシュパスに対応するコールバックを実行します。
   - `router.register('/welcome', () => { ... })` や `router.register('/book/:id', (params) => { ... })` のようなパラメータ付与のパスパースに対応します。
2. **直リンク書籍ロード機能**:
   - 起動時にハッシュ（例：`#book=kokoro` または `#book/773`）が存在する場合、自動的に対応する推奨書籍または過去にインポートした書籍データを特定し、読書画面をダイレクト起動します。
3. **ブラウザ履歴との同期**:
   - 「ホームに戻る」ボタンや「書籍のロード」に伴い URL ハッシュを更新（遷移）させ、ブラウザの「戻る」ボタン押下によって期待通り前の画面へ遷移することを可能にします。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] 登録したパスとパラメータのパースが正確に行われる Router 単体のユニットテストがパスすること。
- [ ] ハッシュ値の切り替えにより、ウェルカム画面と読書画面の表示・非表示がリロードなく同期的に切り替わること。
- [ ] URLハッシュに特定の書籍IDを含めてリロードした際、ウェルカム画面をスキップして直接その書籍がローディング・表示されること。
- [ ] すべてのE2Eテストがパスすること。
