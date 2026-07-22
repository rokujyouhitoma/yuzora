---
ID: 104
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] 最初期フェーズにおけるインポートファイルサイズ制限によるDoS対策 (ID: 104)

## 1. 概要 / Summary
ドラッグ＆ドロップおよびファイル選択インポートのエントリポイントで、対象ファイルのサイズチェック（2MB上限）を事前検証し、過大ファイルによる DoS 攻撃やメモリ枯渇を遮断します。

---

## 2. トレーサビリティ / Traceability
- 関連要件 (SRD): SRD 3.6 事前検証ファイルサイズ DoS 防御
- 関連バックログ: [083-early-file-size-check.md](../backlogs/083-early-file-size-check.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [ui.js](../../src/js/modules/ui/ui.js)
- [ ] [resource-director.js](../../src/js/modules/storage/resource-director.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enh/104-early-file-size-check`

1. **エントリポイントでの早期ファイルサイズ検証 (`ui.js`)**:
   - `file.size > 2 * 1024 * 1024` の場合に FileReader を起動せず事前拒否。
2. **ResourceDirector の DoS 境界防衛検証 (`resource-director.js`)**:
   - 2MB 超過時の安全なエラー返却ロジックを再確認。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 2MB 超過ファイルがインポート直後に事前拒否されること。
- [ ] すべてのテスト・型チェック・リンターが通過すること。
