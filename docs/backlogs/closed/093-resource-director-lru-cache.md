---
ID: 093
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ResourceDirector における LRU メモリキャッシュ自動解放の実装 (ID: 093)

## 1. 概要 / Summary
「ゆうぞら」は完全なクライアントサイド静的SPAであり、ユーザーが多数の書籍を次々と読書・インポートする際に、パース済み本文データがメモリに無制限に保持されるとメモリフットプリントが圧迫される懸念があります。
エンベデッドシステムスペシャリスト（ES）の観点に基づき、`ResourceDirector` におけるアセットキャッシュ管理構造へ LRU (Least Recently Used) アルゴリズムを導入し、キャッシュ面数上限 (`MAX_CACHE_COUNT = 5`) 超過時に最古のアセットに対して自動的に `dispose()` メモリ解放処理を呼び出してガベージコレクションを強制促進します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [resource-director.js](../../src/js/modules/storage/resource-director.js) — `ResourceDirector.MAX_CACHE_COUNT` の定義および `loadBook()` での LRU 自動アセット退去・`dispose()` 連動
- [MODIFY] [asset.js](../../src/js/modules/storage/asset.js) — `Asset.prototype.dispose()` および `BookAsset.prototype.dispose()` によるガベージコレクション対応の明示的データ消去
- [MODIFY] [repository.test.js](../../tests/unit/storage/repository.test.js) — `ResourceDirector` の LRU キャッシュ退去およびメモリ自動解放ユニットテスト

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 LRU キャッシュ管理アルゴリズム
- キャッシュ上限定数 `ResourceDirector.MAX_CACHE_COUNT = 5` を設定。
- 新規書籍アセットをロードする際、現在の内部マップ `this.assets.size >= MAX_CACHE_COUNT` であり、かつ指定キー未保持の場合、`Map` のイテレータから最古のエントリキー (`this.assets.keys().next().value`) を自動取得。
- 最古アセットに対して `unload(oldestKey)` を呼び出し、内部の `asset.dispose()`（プロパティ初期化・参照解除）を実行後に `Map` から削除する。

### 3.2 ガベージコレクション連動
- `BookAsset.prototype.dispose()` により、大容量の本文文字列 `content` および目次配列 `toc` 参照を即座に破棄し、V8 / ブラウザエンジンにおけるガベージコレクションを最速化する。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] 6冊以上の書籍を連続して `ResourceDirector.loadBook()` で読み込んだ際、キャッシュ面数が上限 `MAX_CACHE_COUNT = 5` を保持すること。
- [x] キャッシュから溢れた最古の書籍アセットに対し、`dispose()` が自動呼び出しされメモリ参照が正常に解放されること。
- [x] ユニットテスト `npm run test:unit` の `ResourceDirector` テスト群がすべてパスすること。
