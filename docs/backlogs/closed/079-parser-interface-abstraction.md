---
ID: 079
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] ドキュメントパーサーインターフェースの抽象化とマルチフォーマット対応 (ID: 079)

## 1. 概要 / Summary
将来的なマークダウン（Markdown）やEPUB等の複数フォーマット対応を見据え、現在の青空文庫形式に特化したパーサー（`AozoraParser`）を抽象化し、汎用的なドキュメントパーサーインターフェース（`DocumentParser`）を定義します。
Service Locator経由で依存関係を抽象型として解決する設計にリファクタリングすることで、UI描画層（`viewer.js`）やドメイン制御層（`yuzora.js`）から特定のファイルフォーマットに対する密結合を排除し、フォーマットプラグイン構成の基礎を構築します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [src/js/types.d.ts](../../src/js/types.d.ts) (型定義に `DocumentParser` および `ParsedDocument` の定義を追加)
- [src/js/modules/core/yuzora.js](../../src/js/modules/core/yuzora.js) (Locator登録キーを `DocumentParser` 抽象インターフェースへ移行し、パース呼び出しを汎用メソッド化)
- [src/js/modules/ui/viewer.js](../../src/js/modules/ui/viewer.js) (パース呼び出し部分を抽象インターフェースに置き換え)
- [src/js/modules/parser/parser.js](../../src/js/modules/parser/parser.js) (`AozoraParser` に新しい `DocumentParser` インターフェースメソッドを実装)
- [tests/unit/parser/parser.test.js](../../tests/unit/parser/parser.test.js) (パーサーのテストコードにおける解決とインターフェース呼び出し方法を更新)

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 インターフェースの設計
*   `src/js/types.d.ts` に以下の抽象インターフェースを定義します：
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

### 3.2 疎結合化と依存関係解決
*   **Service Locator でのキーの抽象化**:
    *   現在 `Yuzora.locator.register(AozoraParser, new AozoraParser())` のように具象クラスをキーとして登録している箇所を、抽象インターフェース型キー、またはLocatorに登録する専用 of 専用の解決トークンクラス `DocumentParser` に置き換えます。
*   **AozoraParser のリファクタリング**:
    *   `AozoraParser` クラスを `implements DocumentParser` とし、`parseAozoraText` などの具象メソッドを包み込む形で、`parseText` / `parseHTML` / `formatMarkup` メソッドを実装します（旧メソッドは後方互換性のために残す、または移行完了時に安全にクリーンアップします）。
*   **UI層・コア層の呼び出し変更**:
    *   `yuzora.js` および `viewer.js` が `AozoraParser` を直接インポートまたはインジェクションで受け取るのをやめ、抽象化された `DocumentParser` キーでインスタンスを解決・呼び出しするようにリファクタリングします。

### 3.3 後方互換性とコンパイル確認
*   Google Closure Compiler（ADVANCED_OPTIMIZATIONS）での圧縮時に、JSDocタイプ定義（`@implements {DocumentParser}`）に基づいてプロパティ名が安全に難読化され、かつ型チェックエラー（`tsc`）が発生しないことを担保します。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] `src/js/types.d.ts` にフォーマット中立な `DocumentParser` および `ParsedDocument` インターフェースが定義されていること。
- [x] `AozoraParser` が `DocumentParser` インターフェースを正しく実装していること。
- [x] `yuzora.js` および `viewer.js` が `DocumentParser` をキーとしてService Locatorからインスタンスを解決し、具象クラス（`AozoraParser`）への名前の直接依存が排除されていること。
- [x] すべてのテストコードが更新され、パーサークラスおよびパース機能のテストが正常にパスすること。
- [x] 難読化ビルド（`make`）が警告やエラーなく正常に完了すること。
