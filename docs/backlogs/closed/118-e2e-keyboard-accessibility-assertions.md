---
ID: 118
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] WAI-ARIA 属性およびキーボードフォーカス制御の E2E 自動検証 (ID: 118)

## 1. 概要 / Summary
読書画面およびドロワー UI において、`Tab`, `Escape`, 矢印キー操作時のフォーカス移動制御、および `aria-expanded` / `aria-hidden` / `aria-label` 属性の状態変化を Playwright E2E テストで自動アサーションし、アクセシビリティの回帰を防止します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tests/e2e/viewer.spec.js](../../tests/e2e/viewer.spec.js) — キーボード & ARIA 属性 E2E アサーションの追加
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. Playwright の `page.keyboard.press('Tab')` や `page.keyboard.press('Escape')` を用いてキー操作を送信。
2. アクティブフォーカス要素 (`document.activeElement`) が適切なボタンやテキスト領域にあることを検証。
3. 設定ドロワー開閉時に `aria-expanded` が `true`/`false` にトグルし、非表示エリアに `aria-hidden="true"` が設定されることをアサート。

---

## 4. 要件と技術詳細 / Technical Requirements
- 読書画面 (`#reader-viewport`) および設定パネル (`#settings-drawer`) を対象とする。
- キーボード操作のみで読書画面の各種コントロールへアクセス可能であることを自動テストで保証。

---

## 5. 完了条件 (DoD) / Acceptance Criteria

### 5.1 要件・設計承認条件 (Approved条件)
- [x] キーボードアクセシビリティおよび ARIA 属性のアサーション要件が定義されていること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に更新されていること。

### 5.2 実装・検証完了条件 (Closed条件 / 今後のIssue実装時)
- [x] `tests/e2e/viewer.spec.js` にキーボードフォーカスおよび ARIA アサーションが実装されていること。
- [x] すべてのキーボードナビゲーション E2E テストが 100% パスすること。
- [x] `npm run healthcheck` が正常に通過すること。
