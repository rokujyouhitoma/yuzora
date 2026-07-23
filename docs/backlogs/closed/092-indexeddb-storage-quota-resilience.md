---
ID: 092
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] IndexedDB ストレージクォータ例外ハンドリングと強固性の向上 (ID: 092)

## 1. 概要 / Summary
「ゆうぞら」はブラウザの `IndexedDB` を利用して、ユーザーがインポートしたオリジナル書籍を「マイライブラリ（本棚）」としてローカル保存します。
データベーススペシャリスト（DB）の観点に基づき、ブラウザのストレージ容量超過 (`QuotaExceededError`) やデータベース接続切断・破損などの例外発生時にもアプリケーションがクラッシュせず、安定して操作を継続できるよう `LibraryRepository` および `IndexedDBRepository` の全アクセス処理に対する多層防御的例外ハンドリング（try-catch / Promise reject catch）を徹底・強化します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [repository.js](../../src/js/modules/storage/repository.js) — `IndexedDBRepository` および `LibraryRepository` の非同期データ操作 (`saveBook`, `getBook`, `getBooks`, `deleteBook`, `clearAll`) に対する例外捕捉の適用
- [MODIFY] [repository.test.js](../../tests/unit/storage/repository.test.js) — IndexedDB トランザクション失敗・容量超過時のフォールバックおよびモック検証テストの追加

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 `IndexedDBRepository` / `LibraryRepository` の例外捕捉
- `IndexedDB` 操作 (`open`, `getAll`, `get`, `put`, `delete`, `clear`) の各低レイヤープロミスにおいて、`onerror` イベントハンドラでエラーオブジェクトを安全にアボート・リジェクトする。
- `LibraryRepository` の高レイヤーメソッド (`saveBook`, `getBooks`, `getBook`, `deleteBook`, `clearAll`) において、`try-catch` ブロックで例外（`QuotaExceededError`, `UnknownError` 等）を捕捉し、警告ログを出力しつつ安全な初期値（空配列 `[]` や `null`）を返却して上位の UI 処理の崩壊を防ぐ。

### 3.2 UI 連携とユーザーフィードバック
- 容量超過による保存失敗時にはブラウザが沈黙して破綻しないよう、上位のインポートフローに安全に失敗結果を返却し、ユーザーにメッセージを提示可能な設計とする。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] IndexedDB のストレージ容量制限超過 (`QuotaExceededError`) 発生時にも、UI やメインスレッドが例外で停止（クラッシュ）しないこと。
- [x] `LibraryRepository` の全メソッド (`saveBook`, `getBooks`, `getBook`, `deleteBook`, `clearAll`) が例外発生時にエラーをログ出力し、適切なデフォルト値にフォールバックすること。
- [x] 単体テスト `npm run test:unit` において `LibraryRepository` の例外ハンドリングテストケースが正常にパスすること。
