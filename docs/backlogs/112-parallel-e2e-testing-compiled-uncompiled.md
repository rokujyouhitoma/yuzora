---
ID: 112
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [Enhancement] CIにおけるE2Eテストの両系並列実行基盤の拡充 (ID: 112)

## 1. 概要 / Summary
開発ソースコード直読み版 (`test:e2e`) と Closure Compiler 難読化ビルド版 (`test:e2e:compiled`) の両系E2EテストをCIおよびローカル環境で確実に実行・統合制御し、ビルド最適化起因のプロパティ名マングルや難読化回帰不具合を自動検出します。

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [package.json](../../package.json) — `npm run test` コマンドにおける両系E2Eテスト連携
- [x] [README.md](README.md) — バックログ台帳の更新

## 3. 要件と技術詳細 / Requirements and Technical Details
- `npm run test` 実行時に、単体テスト・型チェック・静的解析に加え、未コンパイル版E2Eおよびコンパイル版E2Eの両方が全件実行されるよう統合する。

## 4. 完了条件 (DoD) / Acceptance Criteria
- [x] `npm run test` コマンドで全両系テストが順番通りエラーなく完走すること。
