---
ID: 032
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] Repositoryパターンの導入による永続化・ストレージ処理の隠蔽化 (ID: 032)

## 1. 概要 / Summary

Yuzora の進捗保存（しおり情報）、表示設定、および読書セッション変数などのデータ永続化処理を `localStorage` やメモリ空間から直接読み書きする密結合な現行実装から、Repository パターンを導入したデータアクセス構造へリファクタリングします。

これにより、ビジネスロジック（UIやパーサーなど）からストレージの具体的な永続化手段（`localStorage`, `IndexedDB`, または将来的なサーバーAPI同期など）を完全に隠蔽し、コードのテスト容易性（Mock化）および将来のデータストレージ差し替え時の柔軟性を向上させます。

本実装は [MNG-00] のクライアントサイドサーバーレス実行原則に完全に準拠します（すべての処理がブラウザ内で完結し、外部サーバーへのデータ送信は行いません）。

> **参考**: [Backlog 025](../backlogs/025-implement-repository.md)

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): クライアントサイドサーバーレス実行原則
- 関連要件 (SRD): データ永続化の疎結合化、テスト容易性の向上

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [x] [NEW] [repository.js](../../src/js/modules/repository.js) — Repository抽象クラス群の新規実装
- [x] [config.js](../../src/js/modules/config.js) — ConfigModel/BookmarkModel の localStorage 参照を Repository 経由に置換
- [x] [viewer.js](../../src/js/modules/viewer.js) — displayBook()/checkLastSession() の localStorage 参照を Repository 経由に置換
- [x] [commands.js](../../src/js/modules/commands.js) — ExitReaderCommand/ClearStorageCommand の localStorage 参照を Repository 経由に置換
- [x] [yuzora.js](../../src/js/modules/yuzora.js) — boot() のセッション復元 localStorage 参照を Repository 経由に置換
- [x] [externs.js](../../src/externs.js) — Repository インターフェース定義追加
- [x] [NEW] [repository.test.js](../../tests/unit/repository.test.js) — ユニットテスト新規作成
- [x] [package.json](../../package.json) — Closure Compiler ビルドチェーンへの repository.js 追加

---

## 4. 実装方針 / Implementation Plan

Target Branch: `feat/032-implement-repository`

### Step 1: `repository.js` の新規作成

`src/js/modules/repository.js` に以下のクラス階層を実装する。

**1-1. `Repository` 抽象基底クラス**
- `get(key)`, `save(key, value)`, `delete(key)`, `keys()`, `clear()` の抽象メソッド定義

**1-2. `LocalStorageRepository` 具象クラス**
- `get(key)`: `localStorage.getItem(key)` でデータ取得、失敗時は `null` を返す
- `save(key, value)`: `localStorage.setItem(key, value)` で保存、失敗時は `console.warn`
- `delete(key)`: `localStorage.removeItem(key)`
- `keys()`: `localStorage.key(i)` ループで全キー取得
- `clear()`: `localStorage.clear()`

**1-3. `InMemoryRepository` 具象クラス**
- `Map` オブジェクトをデータストアとして使用
- テスト・リプレイ時のモック差し替え用

**1-4. `SettingsRepository` ドメインクラス**
- `_KEY = 'yuzora_config'` をカプセル化
- `load()`: JSON.parse して設定オブジェクト取得、失敗時は `{}`
- `save(configObject)`: JSON.stringify して保存
- `clear()`: キーを削除

**1-5. `BookmarkRepository` ドメインクラス**
- `_PREFIX = 'bookmark_'` をカプセル化
- `load(fileName)`: 進捗 (0.0〜1.0) を数値で返却
- `save(fileName, progress)`: 進捗を文字列で保存
- `clearAll()`: `bookmark_` プレフィックスを持つ全キー削除

**1-6. `SessionRepository` ドメインクラス**
- `_KEY_NAME`, `_KEY_CONTENT`, `_KEY_TYPE` の3キーをカプセル化
- `load()`: 3キーをまとめて `{name, content, type}` オブジェクト返却
- `save(name, content, type)`: 3キーに保存
- `clear()`: 3キーを削除

**1-7. Locator 登録**
- `SettingsRepository`, `BookmarkRepository`, `SessionRepository` の各インスタンスを Locator に登録

### Step 2: `config.js` の修正

- `ConfigModel.load()`: `localStorage` → `SettingsRepository.load()`
- `ConfigModel.save()`: `localStorage` → `SettingsRepository.save()`
- `BookmarkModel.save(fileName, progress)`: `localStorage` → `BookmarkRepository.save()`
- `BookmarkModel.load(fileName)`: `localStorage` → `BookmarkRepository.load()`

### Step 3: `viewer.js` の修正

- `displayBook()`: `localStorage.getItem()` → `BookmarkRepository.load()`
- `checkLastSession()`: `localStorage.getItem()` → `BookmarkRepository.load()`

### Step 4: `commands.js` の修正

- `ExitReaderCommand.execute()`: 3行の `localStorage.removeItem()` → `SessionRepository.clear()`
- `ClearStorageCommand.execute()`:
  - `"bookmarks"` ケース: localStorage ループ → `BookmarkRepository.clearAll()`
  - `"config"` ケース: → `SettingsRepository.clear()`
  - `"all"` ケース: → 各リポジトリの `clear()` / `clearAll()`

### Step 5: `yuzora.js` の修正

- `boot()`: 3つの `localStorage.getItem()` → `SessionRepository.load()`

### Step 6: `externs.js` の修正

- `RepositoryInterface`, `SettingsRepositoryInterface`, `BookmarkRepositoryInterface`, `SessionRepositoryInterface` を定義追加

### Step 7: `package.json` / ビルド設定の更新

- `repository.js` を Closure Compiler の `--js` 引数に追加（`locator.js` の直後）

### Step 8: ユニットテストの作成

`tests/unit/repository.test.js` に CRUD テストを実装

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `LocalStorageRepository` がデータの読み書き・削除を正確に行うこと、また `InMemoryRepository` への差し替えが正常に行えることのユニットテストがパスすること。
- [ ] ソースコード全体（`src/js/modules/` 以下）から `localStorage` への直接参照（`getItem`, `setItem`, `removeItem`, `clear`, `key`, `length`）が排除され、すべてリポジトリ経由に置き換わること。
- [ ] 既存のしおり保存機能、設定変更時の自動保存機能が問題なく動作し、E2Eテスト (`npm run test:e2e`) がすべて正常にパスすること。
- [ ] `npm run build` (Closure Compiler ビルド) が警告・エラーなく完了すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装は [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に整合していること（デッドドキュメントなし）。
