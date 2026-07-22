---
ID: 107
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] フレームワークのライフサイクルにおける明示的なインスタンス破棄（dispose）の徹底 (ID: 107)

## 1. 概要 / Summary
書籍切り替えやリソース破棄時のメモリリーク防止のため、`Asset` および `ResourceDirector` における標準的な `dispose` インスタンス破棄パターンを適用・強化します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.9 メモリ管理・ライフサイクル dispose
- 関連バックログ: [086-lifecycle-dispose-garbage-collection.md](../backlogs/086-lifecycle-dispose-garbage-collection.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [asset.js](../../src/js/modules/storage/asset.js)
- [ ] [resource-director.js](../../src/js/modules/storage/resource-director.js)
- [ ] [resource.test.js](../../tests/unit/storage/resource.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `ref/107-lifecycle-dispose-garbage-collection`

1. **Asset リソース破棄 `dispose()` の強化 (`asset.js`)**:
   - `Asset` クラスに `dispose()` を実装し、破棄ステータス (`DISPOSED`) への遷移と参照クリアを完了。
2. **ユニットテストの検証 (`resource.test.js`)**:
   - `Asset.dispose()` 呼び出し後の状態と安全性をユニットテストで確認。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `Asset.dispose()` メソッドによるリソース解放がテストで検証されること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
