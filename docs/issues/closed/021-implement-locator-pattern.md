---
ID: 021
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] Locatorパターンによるグローバル変数の削減と依存関係の明確化 (ID: 021)

## 1. 概要 / Summary
複数の開発用モジュールファイルに分割された JavaScript コードにおいて、状態管理や設定情報をグローバル変数（`config.js` の `config`, `activeHeadingId`, `currentTOC` 等）に依存して共有する方式から、Locator（Service Locator）パターンを導入してグローバル変数を極力排除するリファクタリングを行います。

これにより、グローバル汚染を防ぎ、モジュール間の依存関係を明示的かつ堅牢に制御します。また、テストコードにおけるモック差し替えの容易性やコードの再利用性を高めます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [019-implement-locator-pattern.md](../backlogs/019-implement-locator-pattern.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [locator.js](../../src/js/modules/locator.js) (Locator基盤 of the project)
- [x] [config.js](../../src/js/modules/config.js)
- [x] [ui.js](../../src/js/modules/ui.js)
- [x] [viewer.js](../../src/js/modules/viewer.js)
- [x] [commands.js](../../src/js/modules/commands.js)
- [x] [parser.js](../../src/js/modules/parser.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/021-implement-locator-pattern`

1. `locator.js` に `Locator` クラスを実装し、インスタンスの登録・解決をサポート。
2. `config.js` に `AppState` クラスを定義し、状態変数をメンバプロパティとしてカプセル化。
3. `Object.defineProperty` で `window` 上にプロキシプロパティをマッピングしてレガシーコードへの互換性を維持。
4. 各モジュールで `window.locator.resolve(AppState)` を介して状態を引き当てるようリファクタリング。
5. ユニットテストを追加して `Locator` の動作を単体検証。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] Locator パターンの実装が完了し、グローバル変数の実態が AppState クラスにカプセル化されていること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
