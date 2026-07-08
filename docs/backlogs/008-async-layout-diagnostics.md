---
ID: 008
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [ENH] レイアウト診断レポート生成の非同期・タイムスライス化 (ID: 008)

## 1. 概要 / Summary
デバッグコンソールから「現在のページを診断」を呼び出す `runLayoutDiagnosis` は、全段落要素に対して `getBoundingClientRect()` をループ内で同期的に呼び出すため、大規模な書籍では十数秒間画面が完全にハングアップします。
これを防ぐため、診断全体の実行フローを非同期（Promise）に変更し、段落ごとのスキャン（境界線交差判定等）処理を一定のバッチ単位で `requestAnimationFrame` または `setTimeout` を介してタイムスライス（時間分割）実行させます。処理中には進行状況（進捗率など）を診断エリアにリアルタイムで表示し、メインスレッドの拘束とハングアップを解消します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[diagnostics.js](src/js/modules/diagnostics.js)** (MODIFY):
  - `runLayoutDiagnosis`, `diagnoseParagraphCoordinateInfo`, `diagnoseBoundaryOverlap` を `async` 化し、タイムスライス（時間分割）処理を導入します。
- **[ui.js](src/js/modules/ui.js)** (MODIFY):
  - 診断ボタンのクリックイベント内での `runLayoutDiagnosis()` 呼び出しを `await` し、診断中はローディング進捗を表示させます。
- **[yuzora.js](src/js/modules/yuzora.js)** (MODIFY):
  - `runLayoutDiagnosis` インターフェース定義を `Promise` を返すように非同期化します。
- **[types.d.ts](src/js/types.d.ts) / [externs.js](src/externs.js)** (MODIFY):
  - `runLayoutDiagnosis` メソッドの型シグネチャを `Promise<string>` へ更新します。

---

## 3. 実装方針 / Implementation Plan
Target Branch: `enhancement/008-async-layout-diagnostics`

1. **タイムスライス汎用ヘルパーの定義**:
   * 指定したバッチサイズごとに `requestAnimationFrame` + `setTimeout` で制御をブラウザに返却するループ処理（`timeSliceEach` 等）を `diagnostics.js` に実装します。
2. **診断メソッドの非同期化**:
   * `diagnoseParagraphCoordinateInfo` および `diagnoseBoundaryOverlap` の段落ループ処理をバッチ化（例: 20段落ごと）し、進捗進捗をレポート用テキストエリアに表示させながら非同期に実行します。
3. **UI 連携の改善**:
   * 診断実行時に「診断中... (XX%)」といった進捗メッセージを出力テキストエリアに更新出力し、完了後に最終レポートを書き込みます。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] 大規模な書籍で「レイアウト診断」を実行した際、画面が数秒間ハングアップせず、ブラウザへの応答性（フリーズの防止）が維持されていること。
- [ ] 診断中に出力欄にリアルタイムで進捗メッセージ（「診断中... XX%」等）が表示されること。
- [ ] 静的解析（`npm run lint`）、型チェック、および既存のユニット・E2Eテストがすべて正常にパスすること。
