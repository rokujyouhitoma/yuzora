---
ID: 111
種別: Enhancement
優先度: High
ステータス: Closed
---

# [Enhancement] 全事前検証の統合ヘルスチェックコマンド (healthcheck) の最適化 (ID: 111)

## 1. 概要 / Summary
開発者のローカル環境およびCIでの型チェック・単体テスト・静的解析・トレーサビリティ検証の漏れを完全防止するため、`npm run healthcheck` コマンドに全事前検証ステップ（型チェック、静的解析、単体テスト、トレーサビリティ検証、コンパイル確認）を最新順序で集約・最適化します。[MNG-00](../../MNG-00-development_philosophy.md) に規定された品質標準を自動強制します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [package.json](../../package.json) — `npm run healthcheck` スクリプトの順序最適化
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. **検証ステップの一元集約**:
   単一コマンド `npm run healthcheck` を呼び出すだけで、リポジトリの全事前検証（ビルド、単体テスト、トレーサビリティ、型チェック、静的解析）が確実に順序実行されるよう構成します。
2. **早期失敗 (Fail-Fast) 原則**:
   いずれかの検証ステップで異常が検知された場合、後続処理を即座に停止して非ゼロ終了コードを返却し、不正なコミットやCIパイプラインの進行をブロックします。

---

## 4. 要件と技術詳細 / Technical Requirements
- `npm run healthcheck` にて `make` ➔ `npm run test:unit` ➔ `npm run test:traceability` ➔ `npm run test:types` ➔ `npm run lint` の順に全ステップを連続実行する。
- ローカル開発時および CI パイプラインにおける品質チェックの標準エントリポイントとして統一運用する。

---

## 5. 完了条件 (DoD) / Acceptance Criteria
- [x] `npm run healthcheck` が全検証項目をエラーなく実行完了すること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に同期していること。
