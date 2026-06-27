---
ID: 002
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] Review Skills and Docs based on MNG-00 (ID: 002)

## 1. 概要 / Summary
開発哲学・マニフェストである [MNG-00] (docs/MNG-00-development_philosophy.md) の制定に伴い、既存の各種管理・プロセスドキュメント（MNG-01〜MNG-04）および開発を補助する各種AIエージェントスキル（.agents/skills/ 配下）を見直し、MNG-00で定義された「三位一体連携モデル」、「ドキュメント駆動プロセス」、「直感的なUI/UX設計思想」、および「抽象と具象の分離」と完全に整合させ、ガバナンスと開発効率を両立する形に最適化・更新します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし（管理・プロセス改善）
- 関連要件 (SRD): なし（開発・運用ガバナンスの強化）

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [MNG-01-document_ledger.md](file:///workspace/yuzora/yuzora/docs/MNG-01-document_ledger.md)
- [ ] [MNG-02-development_process.md](file:///workspace/yuzora/yuzora/docs/MNG-02-development_process.md)
- [ ] [MNG-03-problem_management.md](file:///workspace/yuzora/yuzora/docs/MNG-03-problem_management.md)
- [ ] [MNG-04-change_management.md](file:///workspace/yuzora/yuzora/docs/MNG-04-change_management.md)
- [ ] [create-issue/SKILL.md](file:///workspace/yuzora/yuzora/.agents/skills/create-issue/SKILL.md)
- [ ] [polish-issue/SKILL.md](file:///workspace/yuzora/yuzora/.agents/skills/polish-issue/SKILL.md)
- [ ] [git-workflow/SKILL.md](file:///workspace/yuzora/yuzora/.agents/skills/git-workflow/SKILL.md)
- [ ] [changelog-workflow/SKILL.md](file:///workspace/yuzora/yuzora/.agents/skills/changelog-workflow/SKILL.md)
- [ ] [review-diff-code/SKILL.md](file:///workspace/yuzora/yuzora/.agents/skills/review-diff-code/SKILL.md)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/002-review-skills-and-docs-based-on-mng-00`

1. **ドキュメントの修復と更新**:
   - `MNG-02-development_process.md` 内の不正なマルチバイト文字（デコード崩れの文字）を削除・修復し、`view_file` 等で正常に読み取れるようにします。
   - 各管理ドキュメント（MNG-01〜MNG-04）に、MNG-00の「三位一体連携モデル」や「ドキュメント駆動」の理念、および具体的な連携スキルの役割を明記し、文章上の整合性を確保します。
2. **スキルの更新**:
   - `create-issue`, `polish-issue`, `git-workflow`, `changelog-workflow`, `review-diff-code` の各スキル手順に、MNG-00が定めるガバナンス（ドキュメント先行更新、コミットメッセージ/ChangelogでのIssue ID紐づけ等）やUI/UX設計原則を意識・チェックする指示を組み込みます。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] すべての管理・プロセスドキュメント（MNG-01〜MNG-04）の更新が完了し、デッドリンクや整合性エラーがないこと。
- [ ] すべてのAIエージェントスキルの `SKILL.md` の更新が完了し、MNG-00の理念を反映した手順になっていること。
- [ ] CHANGES.md に本変更が記録されていること。
