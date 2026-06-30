---
ID: 027
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] クラス設計の統合とすべての状態・プロパティのカプセル化 (ID: 027)

## 1. 概要 / Summary
現在、Yuzoraは `Locator` パターンと `ViewContext` クラスを利用して状態管理を行っていますが、一部にレガシーなプロキシプロパティ（`window.currentFileName` 等）や、DOM要素へのアドホックな参照、およびグローバルスコープに近い位置で保持されている変数・参照が存在しています。

本リファクタリングでは、クラス設計（オブジェクトの設計およびその関係性）を徹底的に見直し、「すべてのプロパティおよび状態は、明確な役割を持つ何らかのオブジェクト/クラスに属する」 設計を完成させます。

これにより、グローバルなフットプリント（状態の隠れた依存関係）を完全に排除し、各モジュール（UI、Viewer、Parser、Diagnostics）がどのオブジェクトを所有または参照しているかの関係性をクリアにし、Closure Compilerの `ADVANCED_OPTIMIZATIONS` 環境下における型安全と難読化の整合性を極限まで高めます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [029-consolidate-class-design-belonging-properties.md](../backlogs/029-consolidate-class-design-belonging-properties.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [config.js](../../src/js/modules/config.js) (ViewContextクラスの再設計、およびドメインモデルクラス群の新設)
- [MODIFY] [locator.js](../../src/js/modules/locator.js) (Locatorへの新規モデルクラス登録)
- [MODIFY] [ui.js](../../src/js/modules/ui.js) (レガシープロキシへのアクセスをクラスプロパティアクセスへ完全移行)
- [MODIFY] [viewer.js](../../src/js/modules/viewer.js) (同上)
- [MODIFY] [commands.js](../../src/js/modules/commands.js) (同上)
- [MODIFY] [parser.js](../../src/js/modules/parser.js) (同上)
- [MODIFY] [diagnostics.js](../../src/js/modules/diagnostics.js) (同上)
- [MODIFY] [tools/externs.js](../../tools/externs.js) (新規クラス用のextern定義の追加・プロキシ定義の削除)
- [MODIFY] [docs/DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (詳細設計書の更新)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/027-consolidate-class-design-belonging-properties`

1. **クラス定義の新設と再設計 (`config.js`)**:
   - `AppState` クラスを `ViewContext` にリネーム。DOM要素の参照、および一時的な表示・レイアウト状態（`headerTimeout`, `isReflowing`, `activeHeadingId`, `tocObserver`, `settingsDrawerOpen`, `tocDrawerOpen`）のみを保持する。
   - `BookModel` クラスを新設。書籍のデータとメタデータ（`title`, `content`, `type`, `totalPages`, `currentPage`, `toc`）をカプセル化する。`isEmpty()` および `clear()` メソッドを実装。
   - `ConfigModel` クラスを新設。テーマ、フォント、サイズ、行間、文字間、書字方向などの設定値（`theme`, `font`, `size`, `lh`, `spacing`, `direction`）を保持。`load()`, `save()`, `apply()` メソッドを実装。
   - `BookmarkModel` クラスを新設。進行割合座標（`bookmarkProgress`）を保持し、LocalStorageとの同期メソッド `save(fileName, progress)`, `load(fileName)`, `clear()` を提供。
   - 新設したクラス群を初期段階で `Locator` へ登録。

2. **コマンド履歴管理クラスの名称変更 (`commands.js`)**:
   - `CommandManagerClass` を `CommandHistory` クラスにリネーム。`commandHistory`, `isReplaying`, `commandIndex` を状態として保持。
   - `CommandManager` グローバル変数を `CommandHistory` の resolved インスタンスへの参照として維持。

3. **アプリケーションエントリーポイントの定義 (`ui.js`)**:
   - `Yuzora` クラスを定義。`locator` プロパティを持ち、`boot()` メソッドで起動時の全初期化処理（DOM設定、設定ロード、イベント登録、履歴復元など）を実行する。
   - 外部・テスト用公開API（`parseAozoraText`, `parseAozoraHTML`, `formatAozoraMarkup`, `runLayoutDiagnosis` 等）を `Yuzora` のメソッドとして提供し、`window['Yuzora']` へインスタンスを公開する。

4. **参照箇所の書き換え**:
   - `ui.js`, `viewer.js`, `commands.js`, `diagnostics.js`, `parser.js` 内の `window.currentFileName`, `state.config`, `state.bookmarkProgress` 等のプロキシ・レガシーアクセスを、`locator.resolve(BookModel)`, `locator.resolve(ConfigModel)`, `locator.resolve(BookmarkModel)`, `locator.resolve(ViewContext)` 経由の直接アクセスへすべて書き換える。

5. **互換プロキシの完全削除 (`config.js`)**:
   - 末尾の `Object.defineProperty` ループによるプロキシ定義を完全に削除。

6. **型定義とビルド対応 (`tools/externs.js`, `Makefile`)**:
   - `tools/externs.js` の不要なプロキシプロパティ定義を削除し、新規モデルクラス・プロパティのリネーム抑制を追加。
   - `make clean && make` による警告なしビルド完了を確認。

7. **設計書の更新**:
   - [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) を新クラス設計とプロキシ廃止の仕様に更新する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] すべてのグローバル変数・プロキシプロパティ（`window.currentFileName` 等）が完全に削除され、読み込み・書き込みともにLocator解決モデルに移行していること。
- [ ] リファクタリング適用後、`make clean && make` が警告無しでビルド完了し、アドバンスドコンパイルによる名前衝突やリネーム不具合が一切発生しないこと。
- [ ] すべてのユニットテスト (`npm run test:unit`) および E2E テスト (`npm run test:e2e`) が正常にパスし、書籍ロード・しおり保存復元・表示設定変更がデグレードなく機能すること。
- [ ] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および更新された [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
