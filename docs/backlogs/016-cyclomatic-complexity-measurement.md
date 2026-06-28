---
ID: 016
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [Refactor] サイクロマティック複雑度の計測とリファクタリング基準の導入 (ID: 016)

## 1. 概要 / Summary
コードの保守性と可読性を維持するため、サイクロマティック複雑度（循環的複雑度）を自動的に計測し、定義された閾値を超える関数やモジュールを検出してリファクタリングを促す、あるいはビルド/CIプロセス等で警告・エラーにする仕組みと手法を検討・導入する。
閾値の設定および自動検証手法については、論理的検討のもと [ADR-02](../adr/ADR-02-cyclomatic-complexity-threshold.md) として決定された内容に従う。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [package.json](file:///workspace/yuzora/yuzora/package.json) (静的解析関連ライブラリやスクリプト定義の確認)
- Linter設定ファイル（`.eslintrc.json` または `eslint.config.js`）
- `src/js/` 配下の既存の全JSファイル（ルール導入による既存コードのエラー有無の検証とリファクタリング）

## 3. 要件と技術的詳細 / Requirements & Technical Details
1. **ESLint への `complexity` ルールの追加**
   - 閾値を `10` とし、超えた場合は `error` と判定する。
2. **既存コードの解析とリファクタリング**
   - ルール適用後、既存コードで閾値を超えた関数をリストアップし、モジュール分割や条件分岐の整理を行い、複雑度を閾値以下に下げる。
3. **CI/CD またはコミットフックでの自動実行**
   - コミット時（Husky + lint-staged 等）または GitHub Actions 等の CI パイプラインに `npm run lint` を統合し、複雑度チェックを自動化する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] ESLint に `complexity` ルールが正しく追加されていること。
- [ ] `npm run lint` を実行した際、複雑度が 10 を超える関数に対してエラーが発生すること。
- [ ] 既存コード内の複雑度 10 超の関数について、必要に応じてリファクタリングが施され、あるいは意図的な例外（`/* eslint-disable-next-line complexity */`）が適切にコメントされていること。
- [ ] 自動チェック（CI / コミットフック）が動作し、複雑度エラーがある場合にコミットやビルドが失敗すること。
