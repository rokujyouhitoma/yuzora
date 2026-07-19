---
ID: 082
種別: Feature
優先度: Medium
ステータス: Open (In Progress)
---

# [FEAT/ENH] 見出し自動改ページ設定のユーザーカスタマイズ機能の追加 (ID: 082)

## 1. 概要 / Summary
見出し（大・中・小見出し）の直前で自動改ページを行うかどうか、またどの見出しレベルまでを改ページの対象とするかを、ユーザーが設定画面（表示設定ドロワー）から選択できるようにします。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [REQ-01](../docs/REQ-01-user_requirements.md) (REQ-01-PB-02: 見出し開始時の自動改ページおよび重複防止)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [config.js](../../src/js/modules/config.js)
- [x] [ui.js](../../src/js/modules/ui.js)
- [x] [parser.js](../../src/js/modules/parser.js)
- [x] [index.html](../../index.html)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/081-082-083-page-break-improvements`

1.  **設定項目（ConfigModel）の追加**:
    `config.js` に `headingPageBreakMode` を追加。値は `'none'`、`'large'`、`'large-medium'` (デフォルト)、`'all'` とします。
2.  **設定画面（表示設定ドロワー）の変更**:
    `index.html` に「見出しの改ページ設定」のセレクトボックスを追加し、`ui.js` にてイベントバインドと `ConfigModel` への動的適用を行います。
3.  **パース時判定の動的化**:
    `AozoraParser.parseAozoraText` の見出し自動改ページロジックで、`this.configModel.get('headingPageBreakMode')` に基づいて動的に改ページ要素の挿入可否を判断するようにします。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 設定を「なし」にした場合、すべての見出しの前で自動改ページがされず、本文と同様にインラインで配置されること。
- [ ] 設定を「大のみ」にした場合、大見出しの直前でのみ改ページが発生し、中見出しはインラインで配置されること。
- [ ] 設定を変更し、ページをリロードした際、変更後の設定値が維持されてレイアウトが構築されること。
- [ ] すべてのE2Eテストおよびユニットテストが正常にパスすること。
