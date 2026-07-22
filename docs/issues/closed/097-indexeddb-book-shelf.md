---
ID: 097
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] IndexedDBを用いた本棚機能（マイライブラリ）の構築 (ID: 097)

## 1. 概要 / Summary
ドラッグ＆ドロップまたはファイル入力によってインポートされた青空文庫のテキストファイル（.txt）やHTMLファイルなどを、ブラウザの IndexedDB に永続的に保存し、ユーザーが「本棚」として整理・管理・選択できるようにします。これにより、同じデバイスで再訪問した際に以前インポートした書籍をすぐに再読できるようになり、定着率を高めます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): URD 1.1 書籍インポート, URD 1.2 本棚表示
- 関連要件 (SRD): SRD 1.1 書籍ファイル取り込み, SRD 1.2 マイライブラリ管理
- 関連バックログ: [077-indexeddb-book-shelf.md](../backlogs/077-indexeddb-book-shelf.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [repository.js](../../src/js/modules/storage/repository.js)
- [ ] [yuzora.js](../../src/js/modules/core/yuzora.js)
- [ ] [ui.js](../../src/js/modules/ui/ui.js)
- [ ] [viewer.js](../../src/js/modules/ui/viewer.js)
- [ ] [index.html](../../index.html)
- [ ] [welcome.css](../../src/css/modules/welcome.css)
- [ ] [types.d.ts](../../src/js/types.d.ts)
- [ ] [externs.js](../../src/externs.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/097-indexeddb-book-shelf`

1. **IndexedDBRepository および LibraryRepository の実装 (repository.js)**:
   * IndexedDB を用いた非同期ストレージクライアント `IndexedDBRepository` クラスを実装。データベース `yuzora_db` (v1) とオブジェクトストア `books` を設定。
   * インポート書籍データの CRUD を担当するドメインリポジトリ `LibraryRepository` クラスを実装。
2. **UI へのマイライブラリセクション追加 (index.html, welcome.css, ui.js)**:
   * `index.html` に「マイライブラリ」用のマークアップ `#library-section` とグリッドを追加。
   * `ui.js` 内の `setupPredefinedBooksGrids` にて、`LibraryRepository` から書籍情報を非同期取得し、本棚カードを動的生成。
   * カードホバー時に削除ボタン (×) を表示する CSS トランジションを `welcome.css` に定義し、クリックイベントを削除 API へバインド。
3. **インポート連動とルーティング (viewer.js, yuzora.js)**:
   * `viewer.js` の `handleFile` 内で、ファイルインポート時に `LibraryRepository` へ保存する処理を追加し、URLハッシュを `#/reader?library=filename` に変更。
   * `handleFile` の最初期エントリポイントにてファイルサイズが 2MB を超える場合にインポートを遮断する DoS 防御ガードを組み込む。
   * `yuzora.js` ルーターに `/reader?library=xxx` ルートを追加し、IndexedDB から書籍コンテンツを読み込んで描画するシーケンスを実装。
4. **型定義と Closure Compiler の同期 (types.d.ts, externs.js)**:
   * `types.d.ts` に `LibraryRepository` 関連メソッドの型宣言を追加。
   * `externs.js` にプロトタイプメソッド保護ルールを追記。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] ドラッグ＆ドロップでインポートした書籍が IndexedDB の `books` オブジェクトストアに正常に永続化されること。
- [ ] 2MB を超える書籍ファイルをインポートしようとした際、インポートが拒否されエラーメッセージが表示されること。
- [ ] ウェルカム画面でインポートした書籍が「マイライブラリ」グリッド内に美しいカードとして描画され、カードをクリックすると `#/reader?library=xxx` で正しく読書が開始できること。
- [ ] カード内の削除ボタン（ホバー時に表示）をクリックして確認承諾すると、データベースから削除され、本棚から即座にカードが消えること。
- [ ] すべてのE2Eテスト (`npm run test:e2e` 及び `npm run test:e2e:compiled`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が設計仕様書 [DSN-01](../designs/DSN-01-high_level_design.md) / [DSN-02](../designs/DSN-02-low_level_design.md) と完全に一致していること。
