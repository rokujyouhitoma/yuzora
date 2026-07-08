---
ID: 037
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] 永続化層（Repository）の完全非同期対応と抽象化 (ID: 037)

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

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[repository.js](src/js/modules/repository.js)** (MODIFY): `Repository` および `LocalStorageRepository` などの各メソッドの Promise 返却化。
- **[config.js](src/js/modules/config.js)** (MODIFY): `ConfigModel`, `BookmarkModel`, `SessionRepository` などのモデル・リポジトリ呼出を `async / await` で非同期化。
- **[commands.js](src/js/modules/commands.js)** (MODIFY): 各コマンドクラスの `execute` メソッドの非同期化（非同期I/Oの待機）。
- **[yuzora.js](src/js/modules/yuzora.js)** (MODIFY): アプリ初期化処理（`boot`）時の設定読み込み非同期処理の待機。
- **[types.d.ts](src/js/types.d.ts)** (MODIFY): `RepositoryInterface` の型定義変更（Promise返却化）。
- **[externs.js](src/externs.js)** (MODIFY): Closure Compiler 用の externs 宣言を Promise 返却型に更新。
- **[repository.test.js](tests/unit/repository.test.js)** (MODIFY): 永続化層の非同期化に伴うユニットテスト（アサーションでの Promise 待機など）の修正。

---

## 3. 要件と技術的詳細 / Technical Details
### 3.1. インターフェースの非同期設計
* `RepositoryInterface` のシグネチャを以下のように定義変更します：
  ```typescript
  interface RepositoryInterface {
      get(key: string): Promise<string | null>;
      save(key: string, value: string): Promise<void>;
      delete(key: string): Promise<void>;
      keys(): Promise<string[]>;
      clear(): Promise<void>;
  }
  ```

### 3.2. モデル・コマンド・シーン遷移への波及
* `ConfigModel.prototype.load` および `save` は `async` 関数として再定義し、内部で `await repository.get(...)` などを実行します。
* シーン遷移（`Scene.prototype.enter` 等）のライフサイクルにおいて、設定読み込みの完了を非同期で待機できるようにします。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] `Repository` インターフェースおよびすべての具象クラス（`LocalStorageRepository`, `InMemoryRepository`）のメソッドが非同期Promiseを返すこと。
- [ ] 設定情報やしおり、セッション情報が非同期I/Oを介して正常に読み書きされること。
- [ ] 静的コード解析（`npm run lint`）、型チェック（`npm run test:types`）、ビルド（`make`）がエラーなく動作すること。
- [ ] 全ユニットテスト（`npm run test:unit`）および E2E テスト（`npm run test:e2e`）が正常にパスすること。

