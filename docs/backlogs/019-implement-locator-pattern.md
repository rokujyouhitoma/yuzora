---
ID: 019
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] Locatorパターンによるグローバル変数の削減と依存関係の明確化 (ID: 019)

## 1. 概要 / Summary
複数の開発用モジュールファイルに分割された JavaScript コードにおいて、状態管理や設定情報をグローバル変数（`config.js` の `config`, `activeHeadingId`, `currentTOC` 等）に依存して共有する方式から、Locator（Service Locator）パターンを導入してグローバル変数を極力排除するリファクタリングを行います。

これにより、グローバル汚染を防ぎ、モジュール間の依存関係を明示的かつ堅牢に制御します。また、テストコードにおけるモック差し替えの容易性やコードの再利用性を高めます。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/locator.js
