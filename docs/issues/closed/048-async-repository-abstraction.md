---
ID: 048
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] 永続化層（Repository）の完全非同期対応と抽象化 (ID: 048)

## 1. 概要 / Summary
現在、ユーザー設定やしおり情報の管理を行う `ConfigModel` や `BookmarkModel` は `localStorage` を前提とした同期処理（`load` / `save`）で動作しています。しかし、大容量のデータやローカルファイルを扱うために将来的に `IndexedDB` などの非同期ストレージに移行する場合や、サーバー側のAPIとデータを同期する場合、同期設計になっているモデル層のコード変更が広範囲に発生してしまいます。

また、システム設計討論（ID: 043）において、データベーススペシャリスト（DB）より以下の問題提起がなされています。
1. **5MBの容量制限**: ユーザーのローカル書籍追加や目次キャッシュ等の大容量データを格納する際に容量の上限に達する。
2. **I/O同期ブロッキング**: 同期的な `localStorage` 操作が高頻度で行われると、UIメインスレッドをブロッキングしモバイル機器等でカクつき（遅延）の原因となる。

この技術的制約を緩和するため、以下のリファクタリングを計画します。
- `Repository` インターフェースのすべてのメソッド（`get`, `save`, `delete` 等）を `Promise` による非同期処理として再定義。
- ストレージのバックエンドが将来的に IndexedDB 等の非同期かつ大容量のものへ容易に移行できるように抽象化。
- モデル層およびビジネスロジックはストレージの実態（同期か非同期か）を完全に意識しない非同期呼び出し構造へ変更。
- ストレージの抽象化レベルを上げることで、永続化層のユニットテストやモックの容易性をさらに向上。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01 (機能要件)
* 関連要件 (SRD): SRD-04 (永続化設計)
* 関連バックログ: [037-async-repository-abstraction.md](../backlogs/closed/037-async-repository-abstraction.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [repository.js](src/js/modules/repository.js) (MODIFY)
* [ ] [config.js](src/js/modules/config.js) (MODIFY)
* [ ] [commands.js](src/js/modules/commands.js) (MODIFY)
* [ ] [yuzora.js](src/js/modules/yuzora.js) (MODIFY)
* [ ] [types.d.ts](src/js/types.d.ts) (MODIFY)
* [ ] [externs.js](src/externs.js) (MODIFY)
* [ ] [repository.test.js](tests/unit/repository.test.js) (MODIFY)
* [ ] [app.test.js](tests/unit/app.test.js) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `refactor/048-async-repository-abstraction`

### 4.1. リポジトリメソッドの Promise 化
* `repository.js` 内の `Repository`, `LocalStorageRepository` などの各メソッドの戻り値を `Promise` とするよう修正します。
  - `get(key)` ➔ `Promise.resolve(localStorage.getItem(key))` のようにラップします。

### 4.2. モデル層と永続化呼出の非同期化
* `config.js` の `ConfigModel` / `BookmarkModel` の `load` / `save` メソッドに `async` を付与し、内部のリポジトリ呼出を `await` するよう修正します。
* 各モデルに対応するリポジトリ `SettingsRepository`, `BookmarkRepository`, `SessionRepository` の呼び出し部分もすべて非同期 Promise を扱うようにします。

### 4.3. コマンド・初期化シーケンスの非同期対応
* 各コマンド（`UpdateConfigCommand`, `ClearBookmarksCommand` 等）の `execute` メソッドを非同期化し、設定保存の完了を待機できるようにします。
* `yuzora.js` の `boot` メソッドや各 `Scene` の `enter` ライフサイクルで、設定などのロード処理を `await` するよう修正します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] すべてのリポジトリメソッドの戻り値が `Promise` となっており、非同期に処理が行われること。
- [ ] 永続化データの読み書き、およびアプリ初期設定ロードが正しく非同期に完了すること。
- [ ] 静的型チェック (`tsc`) およびユニットテスト (`tests/unit/repository.test.js` 等) がすべて成功すること。
- [ ] すべてのE2Eテストがエラーなく動作し、テーマやブックマークの動作が正常であること。
