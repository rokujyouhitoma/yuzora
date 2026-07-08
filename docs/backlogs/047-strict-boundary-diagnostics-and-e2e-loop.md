---
ID: 047
種別: Enhancement
優先度: High
ステータス: Approved
---

# [ENH] 厳密な文字レベル境界診断の導入と自動テスト検証ループの構築 (ID: 047)

## 1. 概要 / Summary
現在の `runLayoutDiagnosis` は、段落要素全体のバウンディングボックスの境界線重なりを判定の起点とし、かつ文字が見つからない場合も境界に最も近い文字（`closestMatch`）を返す設計となっています。このため、正常に行間で改段された長い段落において偽陽性の見切れ警告が多発します。

本対応では：
1. `findCharAtBoundary` を改善し、文字自体が物理的に境界線をまたいで半分にスライスされている（交差している）場合のみ文字情報を返し、フォールバックの `closestMatch` 処理を廃止します。
2. Playwright E2E テストにおいて、ロードされた書籍に対しブラウザ側で `Yuzora.runLayoutDiagnosis()` を実行し、レポート内の「左境界またぎ 0件」「右境界またぎ 0件」をアサートする自動検証ゲートウェイを構築します。これにより、人間の目（視覚）による確認を行わずに、レイアウト崩れや文字見切れがないことを検証する自動化フィードバックループを実現します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [diagnostics.js](../../src/js/modules/diagnostics.js) (`findCharAtBoundary` および `runLayoutDiagnosis` の判定ロジック改善)
- [ ] [diagnose.spec.js](../../tests/e2e/diagnose.spec.js) (Playwright 自動検証ステップの追加)

---

## 3. 実装方針 / Implementation Plan
1. **`findCharAtBoundary` の改善**:
   - テキストノード内の文字を走査する際、文字全体の矩形 `rect` が $rect.left < boundaryX - 0.5$ かつ $rect.right > boundaryX + 0.5$ の関係を満たす（＝物理的に境界線上をまたいでスライスされている）場合のみ文字データを返却します。
   - 交差する文字が検出されない場合は `null` を返し、`closestMatch` による最接近文字のフォールバック判定を削除します。
2. **`runLayoutDiagnosis` 内の判定方法修正**:
   - `intersectsLeft` / `intersectsRight` の判定基準として、要素のバウンディングボックスによる判定を廃止し、`findCharAtBoundary` が実データを返したかどうかに基づく判定へ変更します。
3. **Playwright E2E自動アサーションの追加**:
   - `tests/e2e/diagnose.spec.js` にて、`displayBook()` 完了からレイアウトが落ち着くのを待った後、ブラウザ環境で `window.Yuzora.runLayoutDiagnosis()` を実行して結果レポートを取得します。
   - レポート文字列を検証し、「左境界またぎ 0件」「右境界またぎ 0件」のメッセージが含まれていることを `expect` で検証するアサーションを組み込みます。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] `findCharAtBoundary` が `closestMatch` のフォールバックを行わず、境界線上をまたぐ文字が存在しない場合は `null` を返すこと。
- [ ] 正常に改段された箇所で偽陽性の見切れ警告が 0件 になり、診断レポートの正確性が向上すること。
- [ ] ヘッドレスE2Eテストを実行した際、レイアウト診断でアサーションが正しく機能し、文字見切れが発生している場合はテストが失敗し、発生していない場合は正常にパスすること。
