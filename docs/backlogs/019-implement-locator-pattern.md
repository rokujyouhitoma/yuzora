---
ID: 019
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] Locatorパターンによるグローバル変数の削減と依存関係の明確化 (ID: 019)

## 1. 概要 / Summary
複数の開発用モジュールファイルに分割された JavaScript コードにおいて、状態管理や設定情報をグローバル変数（`config.js` の `config`, `activeHeadingId`, `currentTOC` 等）に依存して共有する方式から、Locator（Service Locator）パターンを導入してグローバル変数を極力排除するリファクタリングを行います。

これにより、グローバル汚染を防ぎ、モジュール間の依存関係を明示的かつ堅牢に制御します。また、テストコードにおけるモック差し替えの容易性やコードの再利用性を高めます。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/locator.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [locator.js](../../src/js/modules/locator.js) (Locator基盤の新規追加)
- [config.js](../../src/js/modules/config.js) (グローバル変数の移譲・整理)
- [ui.js](../../src/js/modules/ui.js) (Locatorルックアップへの書き換え)
- [viewer.js](../../src/js/modules/viewer.js) (Locatorルックアップへの書き換え)
- [commands.js](../../src/js/modules/commands.js) (Locatorルックアップへの書き換え)
- [parser.js](../../src/js/modules/parser.js) (Locatorルックアップへの書き換え)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **クラス解決型 Locator の設計**:
   - 解決対象のクラス（`Class`）を指定してインスタンスを取得できるようにします。
   - `Locator.register(Class, instance)` でインスタンスを登録し、`Locator.resolve(Class)` でそのインスタンスを返却します。
   - 未登録のクラスが指定された場合は、明確な例外/エラーを出力するようにして、バグの早期発見を可能にします。
2. **グローバル変数のオブジェクトフィールド化**:
   - `activeHeadingId`, `currentTOC`, `bookmarkProgress`, `config` などの散らばったグローバル変数を適切なクラス（例: `BookReaderState` または `Viewer`, `Config`）のフィールドへ移行します。
   - 各モジュールは、Locator を通じて状態管理クラスのオブジェクトを取得し、必要なメンバにアクセスする構造とします。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] クラス解決型の Locator クラスが実装され、登録・解決が正常に行えるユニットテストが追加・パスすること。
- [ ] アプリケーション起動時に主要モジュール（Viewer, UI, Parser 等）のインスタンスが Locator に登録され、グローバル変数の大部分がクラスインスタンスにカプセル化されること。
- [ ] 既存のE2Eテストが一切壊れず、画面ロード・ページ遷移・しおり保存などの全機能が同一の挙動を示すこと。
