---
ID: 095
種別: Refactor
優先度: Medium
ステータス: Open (In Progress)
---

# [FEAT/ENH] ドキュメントパーサーインターフェースの抽象化とマルチフォーマット対応 (ID: 095)

## 1. 概要 / Summary
将来的なマルチフォーマット対応（Markdown、EPUB等）に備え、現在青空文庫形式に特化して密結合しているパーサークラス（`AozoraParser`）を抽象化し、汎用的な `DocumentParser` インターフェースを導入します。
本機能の追加は、クライアントサイド・サーバーレス実行モデルである `MNG-00` 開発理念に準拠し、余分な外部ライブラリを入れずVanilla JSで完結する安全かつ拡張可能なオブジェクト設計に基づき、将来的な「本棚機能」および多様な書籍インポート機能の盤石な土台を確立することを目的とします。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [079-parser-interface-abstraction.md](../backlogs/079-parser-interface-abstraction.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [types.d.ts](../../src/js/types.d.ts)
- [x] [yuzora.js](../../src/js/modules/core/yuzora.js)
- [x] [viewer.js](../../src/js/modules/ui/viewer.js)
- [x] [parser.js](../../src/js/modules/parser/parser.js)
- [x] [parser.test.js](../../tests/unit/parser/parser.test.js)
- [x] [DSN-02-low_level_design.md](../designs/DSN-02-low_level_design.md) (詳細設計書の更新)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/095-parser-interface-abstraction`

### 4.1 設計書の更新 (LLD)
*   [DSN-02-low_level_design.md](../designs/DSN-02-low_level_design.md) の「6. 抽象構文木（AST）への変換および評価 (`formatAozoraMarkup`)」セクション、および「1.1 サービスロケーター」の文脈に、抽象インターフェース `DocumentParser` および戻り値モデル `ParsedDocument` の定義と、`AozoraParser` がそれを実装する旨を追記する。

### 4.2 インターフェース定義 (`types.d.ts` & `parser.js`)
1.  `src/js/types.d.ts` に以下のインターフェース定義を追加：
    ```typescript
    interface ParsedDocument {
        title: string;
        body: string;
        metadata?: {
            author?: string;
            [key: string]: any;
        };
    }

    interface DocumentParser {
        parseText(text: string): ParsedDocument;
        parseHTML(htmlString: string): ParsedDocument;
        formatMarkup(markupLine: string): string;
    }
    ```
2.  `src/js/modules/parser/parser.js` の先頭に、Closure Compiler（JSDoc）での型アノテーション用に `DocumentParser` クラス型インターフェースを定義：
    ```javascript
    /**
     * @interface
     */
    class DocumentParser {
        /**
         * @param {string} text
         * @return {!ParsedDocument}
         */
        parseText(text) {}

        /**
         * @param {string} htmlString
         * @return {!ParsedDocument}
         */
        parseHTML(htmlString) {}

        /**
         * @param {string} markupLine
         * @return {string}
         */
        formatMarkup(markupLine) {}
    }
    window['DocumentParser'] = DocumentParser;
    ```
3.  `AozoraParser` に `@implements {DocumentParser}` アノテーションを付与し、上記3メソッドを追加（内部処理は既存の `parseAozoraText`, `parseAozoraHTML`, `formatAozoraMarkup` をそのまま呼び出す）。

### 4.3 サービスロケーターへの登録と解決
1.  `src/js/modules/core/yuzora.js` での登録を具象クラスからインターフェースへ変更：
    ```javascript
    // 変更前
    Yuzora.locator.register(AozoraParser, new AozoraParser());
    // 変更後
    Yuzora.locator.register(DocumentParser, new AozoraParser());
    ```
2.  `yuzora.js` の `parseAozoraText` 等の解決キーを `DocumentParser` に変更。
3.  `src/js/modules/ui/viewer.js` での解決キーも `DocumentParser` に変更：
    ```javascript
    const parser = /** @type {!DocumentParser} */ (Yuzora.locator.resolve(DocumentParser));
    ```

### 4.4 テストコードの更新
*   `tests/unit/parser/parser.test.js` における `AozoraParser` インスタンス化・解決およびパース検証コードを、新規定義された `DocumentParser` 経由の呼び出しに変更または追加してテストを通過させる。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `src/js/types.d.ts` に `DocumentParser` / `ParsedDocument` が定義され、`npm run test:types` にパスすること。
- [ ] `AozoraParser` が `DocumentParser` インターフェースを実装し、具象メソッドをラップしていること。
- [ ] `yuzora.js` および `viewer.js` が具象パーサークラスへの直接依存を排除し、`DocumentParser` キー経由で依存解決を行っていること。
- [ ] `npm run test:unit` が全テスト正常にパスすること。
- [ ] 難読化コンパイル（`make`）を実行し、コンパイラエラーや警告がないこと、および `compiled.html` 経由の E2E テスト（`npm run test:e2e:compiled`）がすべてパスすること。
- [ ] 変更内容が詳細設計書 [DSN-02-low_level_design.md](../designs/DSN-02-low_level_design.md) に正しく反映され、ドキュメントの死文化がないこと。
