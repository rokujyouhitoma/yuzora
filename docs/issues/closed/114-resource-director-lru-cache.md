---
ID: 114
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ResourceDirector における LRU メモリキャッシュ自動解放の実装 (ID: 114)

## 1. 概要 / Summary
`ResourceDirector` での書籍読み込み時に、キャッシュ保持数が上限（5件）に達した場合、最古の `BookAsset` を自動退去・`dispose()` メモリ解放する LRU キャッシュ機構を実装しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 4.1 メモリ管理・省リソース要件
- 関連バックログ: [093-resource-director-lru-cache.md](../backlogs/closed/093-resource-director-lru-cache.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/storage/resource-director.js](../../src/js/modules/storage/resource-director.js)

---

## 4. 実装内容 / Implementation Details
1. `ResourceDirector.MAX_CACHE_COUNT = 5` 定数を導入。
2. `loadBook()` 内で上限超過時に最古のアセットを `unload()` してメモリ解放を自動化。

---

## 5. 完了条件 (DoD) & 検証結果 / Success Criteria & Verification
- [x] ユニットテスト `tests/unit/storage/resource.test.js` および `npm run test:unit` が全件通過すること。
