---
ID: 093
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] ResourceDirector における LRU メモリキャッシュ自動解放の実装 (ID: 093)

## 1. 概要 / Summary
エンベデッドシステムスペシャリスト（ES）の観点から、`ResourceDirector` に LRU (Least Recently Used) メモリキャッシュ上限 (`MAX_CACHE_COUNT = 5`) および自動 `dispose()` 退去ロジックを実装し、省リソース環境におけるメモリフットプリントを最小化します。
