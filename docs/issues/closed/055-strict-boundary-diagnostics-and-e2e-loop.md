---
ID: 055
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT/ENH] 厳密な文字レベル境界診断の導入と自動テスト検証ループの構築 (ID: 055)

## 1. 概要 / Summary
現在の `runLayoutDiagnosis` は、段落要素全体のバウンディングボックスの境界線重なりを判定の起点とし、かつ文字が見つからない場合も境界に最も近い文字（`closestMatch`）を返す設計となっています。このため、正常に行間で改段された長い段落において偽陽性の見切れ警告が多発します。

本対応では：
1. `findCharAtBoundary` を改善し、文字自体が物理的に境界線をまたいで半分にスライスされている（交差している）場合のみ文字情報を返し、フォールバックの `closestMatch` 処理を廃止します。
2. Playwright E2E テストにおいて、ロードされた書籍に対しブラウザ側で `Yuzora.runLayoutDiagnosis()` を実行し、レポート内の「左境界またぎ 0件」「右境界またぎ 0件」をアサートする自動検証ゲートウェイを構築します。これにより、人間の目（視覚）による確認を行わずに、レイアウト崩れや文字見切れがないことを検証する自動化フィードバックループを実現します。

本Issueは、バックログ [047-strict-boundary-diagnostics-and-e2e-loop.md](../backlogs/047-strict-boundary-diagnostics-and-e2e-loop.md) をプロモートしたものです。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- 関連バックログ: [047-strict-boundary-diagnostics-and-e2e-loop.md](../backlogs/047-strict-boundary-diagnostics-and-e2e-loop.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [diagnostics.js](../../src/js/modules/diagnostics.js) (MODIFY: `findCharAtBoundary` および `runLayoutDiagnosis` の判定ロジック改善)
- [ ] [diagnose.spec.js](../../tests/e2e/diagnose.spec.js) (MODIFY: Playwright 自動検証ステップの追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/055-strict-boundary-diagnostics-and-e2e-loop`

1. `src/js/modules/diagnostics.js` の `findCharAtBoundary` の `closestMatch` 最接近フォールバックを完全に廃止し、境界線（$X_{boundary}$）を文字自体がまたいでいる場合のみを検出するように判定式（`rect.left < boundaryX - 0.5 && rect.right > boundaryX + 0.5`）に改修する。
2. `runLayoutDiagnosis` を改修し、要素の bounding box 重なりだけで判定するのを廃止し、`findCharAtBoundary` から実際に交差文字情報が取得できた要素のみを交差判定とする。
3. `tests/e2e/diagnose.spec.js` にて、`page.evaluate(async () => window.Yuzora.runLayoutDiagnosis())` を実行してレポート内容を取得し、文字見切れ件数が 0件 であることを `expect` で検証するアサーションを追加する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `findCharAtBoundary` が最接近文字のフォールバックを行わず、実際に境界をスライスする文字がない場合は `null` を返すこと。
- [ ] 正常に改段された段落で偽陽性の見切れが発生しなくなること。
- [ ] E2Eテスト `npm run test:e2e` を実行した際、`diagnose.spec.js` がアサーションステップを含む形で動作し、正しく合否判定が行われること。
- [ ] 本実装の内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（デッドドキュメントがないこと）。
