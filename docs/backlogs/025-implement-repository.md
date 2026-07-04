---
ID: 025
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] Repositoryパターンの導入による永続化・ストレージ処理の隠蔽化 (ID: 025)

## 1. 概要 / Summary
Yuzora の進捗保存（しおり情報）、表示設定、および読書セッション変数などのデータ永続化処理を `localStorage` やメモリ空間から直接読み書きする密結合な現行実装から、Repository パターンを導入したデータアクセス構造へリファクタリングします。

これにより、ビジネスロジック（UIやパーサーなど）からストレージの具体的な永続化手段（`localStorage`, `IndexedDB`, または将来的なサーバーAPI同期など）を完全に隠蔽し、コードのテスト容易性（Mock化）および将来のデータストレージ差し替え時の柔軟性を向上させます。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/lib/repository.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [repository.js](../../src/js/modules/repository.js) (Repository抽象クラスとLocalStorageRepositoryの実装追加)
- [config.js](../../src/js/modules/config.js) (直接のLocalStorage読み書き呼び出しの整理)
- [ui.js](../../src/js/modules/ui.js) (ブックマーク・設定クリアコマンドなどの移行)
- [viewer.js](../../src/js/modules/viewer.js) (しおりロード・進捗更新時のストレージアクセスの移行)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **Repositoryインターフェースの統一**:
   - 基底 `Repository` クラスを定義し、一般的な CRUD 処理（`get`, `save`, `delete`等）のシグネチャを定めます。
   - `LocalStorageRepository` 具象クラスを実装し、内部での `JSON.stringify` / `JSON.parse` シリアライズ・デシリアライズ、および例外発生時の安全な代替ハンドリングをカプセル化します。
   - テストや一時的なメモリ保存用として、シンプルな JavaScript オブジェクト（`{}`）をデータストアとするインメモリ実装（`InMemoryRepository`）も標準構成に含めます。
2. **ドメインリポジトリの分離**:
   - `BookmarkRepository`, `SettingsRepository` のようなドメインごとの具象リポジトリを用意し、ストレージのキー名称（マジックストリング）を各クラス内に隠蔽・一元管理します。
3. **テストにおけるモックストレージ差し替え化**:
   - Locator から `Repository` を解決するように設計することで、テスト実行時にはインメモリのダミーリポジトリ（`InMemoryRepository`）に差し替え、ブラウザ API の存在しない純粋な Node.js 環境でもテストができるようにします。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `LocalStorageRepository` がデータの読み書き・削除を正確に行うこと、また `InMemoryRepository` への差し替えが正常に行えることのユニットテストがパスすること。
- [ ] ソースコード全体から `window.localStorage` への直接参照（`getItem`, `setItem`, `clear` 等）が排除され、すべてリポジトリ経由に置き換わること。
- [ ] 既存のしおり保存機能、設定変更時の自動保存機能が問題なく動作し、E2Eテストがすべて正常にパスすること。
