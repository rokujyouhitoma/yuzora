---
ID: 114
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ResourceDirector における LRU メモリキャッシュ自動解放の実装 (ID: 114)

## 1. 概要 / Summary
`ResourceDirector` に LRU (Least Recently Used) メモリキャッシュ退去ロジック (`MAX_CACHE_COUNT = 5`) および `dispose()` 連動を実装し、省メモリ環境での自動ガベージコレクションを促進する改修を実施しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): [REQ-03 3.4 リソース管理要件](../requirements/REQ-03-system_requirements.md)
- 関連バックログ: [093-resource-director-lru-cache.md](../backlogs/closed/093-resource-director-lru-cache.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [resource-director.js](../../src/js/modules/storage/resource-director.js)
- [x] [asset.js](../../src/js/modules/storage/asset.js)
- [x] [repository.test.js](../../tests/unit/storage/repository.test.js)

---

## 4. 実装方針 / Implementation Details
Target Branch: `enh/114-resource-director-lru-cache`

1. `ResourceDirector.MAX_CACHE_COUNT = 5` を定義。
2. `loadBook()` にて `this.assets.size >= MAX_CACHE_COUNT` を検知した際、最古アセットの `unload()` を実行して参照を解放。

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] 6 冊以上の書籍ロード時に `ResourceDirector` 内のキャッシュ数が上限 5 を超えないこと。
- [x] 退去された最古のアセットに対し `dispose()` が正常実行されメモリが解放されること。
- [x] ユニットテスト `npm run test:unit` が全件通過すること。
