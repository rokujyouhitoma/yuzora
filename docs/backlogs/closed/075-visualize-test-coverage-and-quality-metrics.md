---
ID: 075
種別: Enhancement
優先度: Low
ステータス: Closed
---

# [Enhancement] Visualize Test Coverage & Quality Metrics (ID: 075)

## 1. 概要 / Summary
単体テストのコードカバレッジ、E2Eテストのユースケース網羅率、ESLint 警告数、循環的複雑度（Cyclomatic Complexity）などの品質評価指標をビルド時や CI 上で自動収集・可視化し、リリース判断における品質基準の客観性を高める。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [package.json](../../package.json) (品質測定用のスクリプト)
- [Makefile](../../Makefile) (ビルド時の静的解析レポート生成ステップ)
- [.github/workflows/static.yml](../../.github/workflows/static.yml) (CI 上でのレポート生成および出力)

## 3. 要件と技術的詳細 / Requirements & Technical Details
### 3.1 コードカバレッジツールの統合
- 既存のユニットテスト実行環境にカバレッジツール（Istanbul / nyc など）を導入し、テストのカバレッジレポート（HTML 形式等）を出力する。
### 3.2 循環的複雑度と警告の可視化
- `complexity` 閾値を満たしているかチェックするスクリプトを CI の品質ゲートとして完全に機能させ、結果をログに可視化する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] テストコマンド（例：`npm run test:coverage`）でカバレッジ測定が行われ、レポートが出力されること。
- [ ] CI 実行のサマリーにおいて、カバレッジパーセンテージや静的解析の品質結果が可視化されること。
