---
ID: 065
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 青空文庫ヘッダーフォーマットの解析と作品名・著者名の表示サポート (ID: 065)

## 1. 概要 / Summary
青空文庫テキストの冒頭に配置されている書籍メタデータ（作品名、著者名）および「【テキスト中に現れる記号について】」の記号説明ブロックを正しく処理する機能を追加します。
- 作品名と著者名を `BookModel` で別々に保持。
- 記号解説ブロックを本文のレンダリング対象から除外（スキップ）。
- 本文の先頭（第1ページ目）に「作品名」と「著者名」を表紙（タイトル）ページとして上品に表示させ、改ページを挟んで本文を読めるようにします。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (縦書き・ルビ・青空文庫仕様準拠)
- 関連要件 (SRD): REQ-03-SRD-03 (パーサーモジュール)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/types.d.ts](../../src/js/types.d.ts) — `BookModelInterface` に `author` を追加。
- [x] [src/js/modules/config.js](../../src/js/modules/config.js) — `BookModel` クラスの更新。
- [x] [src/js/modules/parser.js](../../src/js/modules/parser.js) — 青空文庫テキストのヘッダー解析・ブロック除外と表紙HTML生成の実装。
- [x] [src/js/modules/viewer.js](../../src/js/modules/viewer.js) — 画面表示の制御調整。
- [x] [src/css/modules/reader.css](../../src/css/modules/reader.css) — 表紙ページのスタイル定義。
- [x] [tests/unit/parser.test.js](../../tests/unit/parser.test.js) — 関連テストの追加。

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/065-aozora-header-parsing-support`

1. **データモデルの拡張**:
   - `types.d.ts` の `BookModelInterface` に `author: string;` プロパティを追加。
   - `config.js` の `BookModel` クラスに `this.author = '';` プロパティをコンストラクタで初期化。`clear()` メソッド内で `this.author = '';` を行うよう変更。
2. **パーサー（`parser.js`）の拡張**:
   - `parseAozoraText` 関数内：
     - `lines` から `title` と `author` を抽出する（ルビ記法 `《...》` や `｜` があれば除去する）。
     - `BookModel.title = title;`, `BookModel.author = author;` にそれぞれエスケープされたメタデータ値を設定。
     - 行ループでの `inHeader` フラグと `detectHeaderEnd` 周辺のスキップロジックの再実装：
       - `inHeader` が真の間、`-------------------------------------------------------`（水平セパレータ）を検知するまでスキャン。
       - セパレータを検知した時点で、そのセパレータから次の `-------------------------------------------------------` が出現する行までのすべての行（記号説明テキスト）を読み飛ばす。
       - セパレータがない作品の場合は、最初の3〜5行程度の空行およびメタデータ以外の空行スキャンが終わった時点で `inHeader = false` とする（従来互換）。
     - 本文 HTML の先頭（`parsedLines` の最初）に、表紙ページ要素を動的に挿入：
       - `<div class="book-cover-page"><h1 class="book-cover-title">${title}</h1><p class="book-cover-author">${author}</p></div>\nPAGE_BREAK` を挿入する。
       - **セキュリティ考慮 (T-E1/T-E2)**: 作品名・著者名は必ず `escapeHTML()` でサニタイズされた値を使用する。
3. **ビューアー（`viewer.js`）の連携**:
   - `displayBook()` において、ヘッダーに表示する `#book-title` へのタイトル代入時、`parsed.title` ではなく `BookModel.title`（著者名を含まないプレーンな作品名）のみを代入する。
4. **CSS スタイル実装**:
   - `reader.css` に `.book-cover-page`、`.book-cover-title`、および `.book-cover-author` のスタイルを追加。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] 記号解説ブロックを持つ青空文庫テキスト（例: 「武装せる市街」）を読み込んだ際、記号説明テキストがビューアー本文に描画されず除外されていること。
- [x] 読書ビューアーの最初のページが表紙（作品名と著者名が中央/上部付近に配置された縦書き画面）として表示され、次のページから本文「一」章が開始されること。
- [x] 画面上部のヘッダー領域に表示される書籍タイトルに「作品名」のみ（著者名なし）が表示されていること。
- [x] 記号解説ブロックを持たないテキスト（例: 「砂書きの老人」）を読み込んだ際も、作品名・著者名が正しくパースされ、表紙ページが生成されること。
- [x] 悪意ある HTML タグ（例: `<script>alert('xss')</script>`）を含んだ作品名・著者名を持つテキストを入力した際、表紙ページ上でタグが安全にエスケープされ、スクリプトが実行されないこと（T-E1対策のテスト）。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に整合していること。

