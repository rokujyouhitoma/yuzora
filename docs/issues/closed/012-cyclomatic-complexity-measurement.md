---
ID: 012
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] サイクロマティック複雑度の計測とリファクタリング基準の導入 (ID: 012)

## 1. 概要 / Summary
コードの保守性と可読性を維持するため、サイクロマティック複雑度（循環的複雑度）を自動的に計測し、定義された閾値を超える関数やモジュールを検出してリファクタリングを促す仕組みを導入します。
本機能により、コードの細分化・モジュール化を促し、将来的な保守性とテスト容易性を向上させます。
手法および閾値（10）の設定については、論理的検討に基づき策定された [ADR-02](../adr/ADR-02-cyclomatic-complexity-threshold.md) に準拠します。

**開発哲学 (MNG-00) とのアラインメント**:
保守性が高く、不具合の入り込みにくい高品質なコードを維持することで、伝統的かつ美しい日本語読書体験の安定した提供（UXの継続的保証）を支えます。また、三位一体モデルに従い、自動検証プロセスの統合を図ります。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (品質要求)
- 関連要件 (SRD): REQ-03 (保守性要件)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [package.json](file:///workspace/yuzora/yuzora/package.json) (eslint 依存関係および lint スクリプトの追加)
- [NEW] [eslint.config.js](file:///workspace/yuzora/yuzora/eslint.config.js) (ESLint 設定および complexity ルールの設定)
- [MODIFY] [src/js/app.js](file:///workspace/yuzora/yuzora/src/js/app.js) (既存コードの複雑度検証とリファクタリング)
- [MODIFY] [DSN-02 (詳細設計書)](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) (関数分割等の設計反映)
- [MODIFY] [ADR-02](file:///workspace/yuzora/yuzora/docs/adr/ADR-02-cyclomatic-complexity-threshold.md) (ステータスを Accepted に更新)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/012-cyclomatic-complexity-measurement`

1. **ESLint の導入と構成**
   - `npm install --save-dev eslint` を実行して ESLint を開発依存関係にインストールする。
   - プロジェクトルートに `eslint.config.js` を Flat Config 形式で作成し、 `"complexity": ["error", 10]` をルールに設定する。
   - `package.json` の scripts に `"lint": "eslint src/js/"` を追加し、 `"test"` に `"npm run lint"` を統合する。
2. **既存コードの解析**
   - `npm run lint` を実行し、複雑度が 10 を超えている関数を検出する。
3. **既存コードのリファクタリング**
   - 閾値（10）を超えている関数（例えば `parseAozoraText` や `app.js` 内のイベント制御ロジックなど）について、制御フローを整理・細分化（ヘルパー関数の抽出、データ構造の工夫など）し、すべての関数で複雑度を10以下に抑える。
4. **設計書 [DSN-02](../docs/DSN-02-low_level_design.md) および ADR-02 の更新**
   - リファクタリングによって追加・分割された関数の仕様を [DSN-02](../docs/DSN-02-low_level_design.md) に反映する。
   - [ADR-02](../docs/adr/ADR-02-cyclomatic-complexity-threshold.md) のステータスを `Accepted (承認済)` に更新する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] ESLint が開発依存関係に正しく追加され、 `eslint.config.js` が定義されていること。
- [ ] `npm run lint` が正常に実行可能であり、循環的複雑度が 10 を超える関数に対してエラーを出すこと。
- [ ] `npm run test` の一部として `npm run lint` が自動実行されること。
- [ ] `src/js/app.js` 内のすべての関数について、循環的複雑度が 10 以下であること（意図的かつ最小限の例外コメント `/* eslint-disable-next-line complexity */` がある箇所を除く）。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容（リファクタリング後の関数仕様）が [DSN-02](../docs/DSN-02-low_level_design.md) と完全に整合していること。
- [ ] [ADR-02](../docs/adr/ADR-02-cyclomatic-complexity-threshold.md) のステータスが `Accepted (承認済)` になっていること。
