---
ID: 115
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] ResourceDirector における不審プロトコル制限と Spoofing 防御の強化 (ID: 115)

## 1. 概要 / Summary
`ResourceDirector._isAllowedOrigin()` で不審な URL スキーム (`javascript:`, `data:`, `blob:`) を明示的に拒否・ブロックし、Spoofing 脆弱性 (T-S2) に対するセキュリティ防壁を強化しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 4.2 セキュリティ・Spoofing防止
- 関連バックログ: [094-resource-director-protocol-security.md](../backlogs/closed/094-resource-director-protocol-security.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [src/js/modules/storage/resource-director.js](../../src/js/modules/storage/resource-director.js)

---

## 4. 実装内容 / Implementation Details
1. `_isAllowedOrigin` 内で入力 URL の小文字スキーム判定を追加。
2. 不審なプロトコル URL のフェッチ要求に対して即座に拒否例外を発行。

---

## 5. 完了条件 (DoD) & 検証結果 / Success Criteria & Verification
- [x] ユニットテスト `tests/unit/storage/resource.test.js` および `npm run test:unit` が全件通過すること。
