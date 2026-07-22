# [ADR-04] IndexedDB 本棚ストレージ階層の抽象化および操作履歴チェックサム検証の導入

* **ステータス**: Accepted
* **日付**: 2026-07-22
* **意思決定者**: システムアーキテクト (SA), データベーススペシャリスト (DB), セキュリティスペシャリスト (SC)

---

## 1. コンテキストおよび問題の定義 (Context and Problem Statement)

1. **大容量書籍データの永続化**:
   従来の `LocalStorage` 永続化（約5MB制限）では大容量の書籍データや多数のマイ本棚管理に限界があり、ブラウザ標準の `IndexedDB` オブジェクトストアを利用した抽象ストレージ階層の導入が必要となった。

2. **エクスポート/インポートデータの信頼性保護**:
   ユーザー操作履歴 JSON の入出力において、破損データや改ざんデータの取り込みによるアプリの異常動作を防ぐため、チェックサム（ハッシュ）による整合性検証が求められた。

---

## 2. 検討した選択肢 (Considered Options)

* **選択肢1 (採用)**: `Repository` パターンのもと、`IndexedDBRepository` および `LibraryRepository` クラスを抽象化し、操作履歴には SHA-256 / CRC32 チェックサム（`checksum` プロパティ）を付与して検証する。
* **選択肢2**: `LocalStorage` のみを利用し、巨大データは切り捨てる（制約が大きく不可）。

---

## 3. 意思決定結果 (Decision Outcome)

**選択肢1 を採用**。

1. **IndexedDB 抽象層の導入**:
   - `IndexedDBRepository`（低レベル IndexedDB ラッパー）および `LibraryRepository`（ドメインリポジトリ）を定義し、Locator パターンに登録。
   - `getBooks()`, `getBook()`, `saveBook()`, `deleteBook()`, `clearAll()` インターフェースを統一。

2. **操作履歴のチェックサム整合性検証**:
   - `CommandHistory.exportJSON()` において履歴配列のハッシュ値を算出し `checksum` プロパティとして出力。
   - `CommandHistory.importJSON()` においてハッシュ再計算およびプロトタイプ汚染検査を行い、不一致時は例外を発生させて保護。

---

## 4. 影響および成果 (Consequences)

* **プラスの影響**:
  - 数十MB〜数百MBクラスの本棚データをクライアントローカルへ安全に保存可能となった。
  - 改ざん・破損した JSON インポートによるクラッシュリスクが完全に排除された。
* **マイナスの影響**:
  - IndexedDB の非同期処理に伴う `Promise` ハンドリングが追加された（`try-catch` フォールバックで緩和）。
