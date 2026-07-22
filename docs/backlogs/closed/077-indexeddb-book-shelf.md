---
ID: 077
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] IndexedDBを用いた本棚機能（マイライブラリ）の構築 (ID: 077)

## 1. 概要 / Summary
ドラッグ＆ドロップまたはファイル入力によってインポートされた青空文庫のテキストファイル（.txt）やHTMLファイルなどを、ブラウザの IndexedDB に永続的に保存し、ユーザーが「本棚」として整理・管理・選択できるようにします。これにより、同じデバイスで再訪問した際に以前インポートした書籍をすぐに再読できるようになり、定着率を高めます。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [repository.js](../../src/js/modules/storage/repository.js) (IndexedDB の初期化および LibraryRepository の新規追加)
- [yuzora.js](../../src/js/modules/core/yuzora.js) (ルーターでの `/reader?library=xxx` ルートの追加と初期化)
- [ui.js](../../src/js/modules/ui/ui.js) (ウェルカム画面でのマイライブラリセクション描画とカード削除イベントハンドリング)
- [viewer.js](../../src/js/modules/ui/viewer.js) (インポート時の IndexedDB への自動保存連動)
- [index.html](../../index.html) (マイライブラリセクション表示用 HTML マークアップの追加)
- [welcome.css](../../src/css/modules/welcome.css) (本棚カードおよび削除ボタンのホバーマイクロアニメーション追加)
- [types.d.ts](../../src/js/types.d.ts) (LibraryRepository および型定義の拡張)
- [externs.js](../../src/externs.js) (Closure Compiler 難読化保護用の記述追加)

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 IndexedDB の接続と LibraryRepository の実装
- データベース名: `yuzora_db`, バージョン: `1`, オブジェクトストア名: `books`
- キーパスは `fileName` (一意のファイル名) とし、以下の構造体スキーマでレコードを永続化する。
  ```javascript
  {
    fileName: string,
    title: string,
    author: string,
    content: string,
    fileType: string, // "txt" | "html"
    importedAt: number
  }
  ```
- リポジトリクラス `LibraryRepository` は以下の非同期 API を実装する。
  - `saveBook(fileName, title, author, content, fileType)`
  - `getBooks()` (メタデータリストの取得。ソート順: importedAt 降順)
  - `getBook(fileName)` (特定書籍の取得)
  - `deleteBook(fileName)` (書籍の削除)
  - `clearAll()` (ライブラリの全クリア)

### 3.2 UI とルーターの連携
- ウェルカム画面に「マイライブラリ (インポートした本)」セクション（ID: `#library-section`）を追加する。
- 起動時またはシーン遷移時、`LibraryRepository` からインポート済み書籍リストを読み込み、書籍風カードを動的に描画する。
  - 本棚が空の場合はセクション自体を非表示 (`hidden` クラス適用) とする。
- 各カードのホバー時に「削除ボタン (×)」をフェードイン表示する。削除クリック時は確認ダイアログ（`confirm`）を挟み、`deleteBook` 実行後に本棚を再描画する。
- 新規ファイルのインポート完了時、ローカルセッションの一時保存に加え、`LibraryRepository` へ永続保存を行い、URLハッシュを `#/reader?library=filename` に書き換える。
- ルーターで `#/reader?library=xxx` を検知した際、`LibraryRepository` から IndexedDB 経由でコンテンツをロードし、`ResourceDirector` を通してビューアーへ流し込む。

### 3.3 非機能要件（セキュリティとパフォーマンス）
- **ファイルサイズDoS制限 (ID: 083 の統合)**: ドラッグ＆ドロップまたはファイル入力直後の最も外側のエントリポイント (`handleFile`) で、ファイルサイズが 2MB（`2 * 1024 * 1024` バイト）を超える場合はパース前にエラー表示（アラート）して処理を遮断する。
- **XSS防御**: データベースから取り出されるタイトル、著者名、コンテンツはすべて既存のセキュアレンダリングパイプラインを通過させ、危険な HTML インジェクションを無効化する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] ドラッグ＆ドロップでインポートした書籍が IndexedDB の `books` オブジェクトストアに正常に永続化されること。
- [ ] 2MB を超える書籍ファイルをインポートしようとした際、インポートが拒否されエラーメッセージが表示されること。
- [ ] ウェルカム画面でインポートした書籍が「マイライブラリ」グリッド内に美しいカードとして描画され、カードをクリックすると `#/reader?library=xxx` で正しく読書が開始できること。
- [ ] カード内の削除ボタン（ホバー時に表示）をクリックして確認承諾すると、データベースから削除され、本棚から即座にカードが消えること。
- [ ] 難読化ビルド（`make`）が警告・エラーなしで完了し、すべての単体テストおよび E2E テストが正常にパスすること。
