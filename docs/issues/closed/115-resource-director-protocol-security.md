---
ID: 115
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] ResourceDirector における不審プロトコル制限と Spoofing 防御の強化 (ID: 115)

## 1. 概要 / Summary
`ResourceDirector._isAllowedOrigin` 内で `javascript:`, `data:`, `blob:` などの危険なスキームを遮断し、外部リソース挿入・Spoofing 攻撃（T-S2）に対する通信境界制限を実装しました。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): [REQ-03 セキュリティ要件](../requirements/REQ-03-system_requirements.md)
- 関連脅威モデリング: [T-S2/comprehensive-threat-modeling.md](../threat-modeling/comprehensive-threat-modeling.md)
- 関連バックログ: [094-resource-director-protocol-security.md](../backlogs/closed/094-resource-director-protocol-security.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [resource-director.js](../../src/js/modules/storage/resource-director.js)
- [x] [repository.test.js](../../tests/unit/storage/repository.test.js)

---

## 4. 実装方針 / Implementation Details
Target Branch: `enh/115-resource-director-protocol-security`

1. `_isAllowedOrigin` 内で危険なスキーム (`javascript:`, `data:`, `blob:`) のブラックリストチェックを実装。
2. 絶対 URL に対し `new URL(url, window.location.href)` による Same-Origin 検証を強制。

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] `javascript:` や `data:` スキームのロード要求がセキュリティエラーでブロックされること。
- [x] クロスオリジンからのアセット読み込みが正しくアボートされること。
- [x] ユニットテスト `npm run test:unit` が正常に通過すること。
