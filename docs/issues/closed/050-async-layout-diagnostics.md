---
ID: 050
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] レイアウト診断レポート生成の非同期・タイムスライス化 (ID: 050)

## 1. 概要 / Summary
デバッグコンソールから「現在のページを診断」を呼び出す `runLayoutDiagnosis` は、全段落要素に対して `getBoundingClientRect()` をループ内で同期的に呼び出すため、大規模な書籍では十数秒間画面が完全にハングアップします。
これを防ぐため、診断全体の実行フローを非同期（Promise）に変更し、段落ごとのスキャン（境界線交差判定等）処理を一定のバッチ単位で `requestAnimationFrame` または `setTimeout` を介してタイムスライス（時間分割）実行させます。処理中には進行状況（進捗率など）を診断エリアにリアルタイムで表示し、メインスレッドの拘束とハングアップを解消します。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-01 (機能要件)
* 関連要件 (SRD): SRD-05 (UI・パフォーマンス設計)
* 関連バックログ: [008-async-layout-diagnostics.md](../backlogs/closed/008-async-layout-diagnostics.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [diagnostics.js](src/js/modules/diagnostics.js) (MODIFY)
* [ ] [ui.js](src/js/modules/ui.js) (MODIFY)
* [ ] [yuzora.js](src/js/modules/yuzora.js) (MODIFY)
* [ ] [types.d.ts](src/js/types.d.ts) (MODIFY)
* [ ] [externs.js](src/externs.js) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enhancement/050-async-layout-diagnostics`

* `runLayoutDiagnosis` を `async` 関数に変更します。
* 段落スキャン処理である `diagnoseParagraphCoordinateInfo` および `diagnoseBoundaryOverlap` も `async` 関数へと変更し、指定したバッチサイズ（例: 20段落）ごとに `requestAnimationFrame` + `setTimeout` で制御をブラウザに返却するタイムスライスヘルパー `timeSliceEach` を導入します。
* レポート出力欄 (`diagnoseReportOutput`) へ「診断中... XX%」という途中経過を動的に更新表示します。
* 静的型定義（`types.d.ts`）および Closure Compiler externs（`externs.js`）に定義されている `runLayoutDiagnosis` のシグネチャを `!Promise<string>` へ更新します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 大規模な書籍で「レイアウト診断」を実行した際、画面が数秒間ハングアップせず、ブラウザへの応答性（フリーズの防止）が維持されていること。
- [ ] 診断中に出力欄にリアルタイムで進捗メッセージ（「診断中... XX%」等）が表示されること。
- [ ] 静的解析（`npm run lint`）、型チェック、および既存のユニット・E2Eテストがすべて正常にパスすること。
