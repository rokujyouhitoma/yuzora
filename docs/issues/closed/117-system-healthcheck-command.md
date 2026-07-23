---
ID: 117
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] 運用ヘルスチェックコマンド (npm run healthcheck) の新設 (ID: 117)

## 1. 概要 / Summary
ビルド (`make`)、単体テスト (`test:unit`)、トレーサビリティ (`test:traceability`)、型チェック (`test:types`)、リンター (`lint`) を一括実行してシステムの健全性を診断する `npm run healthcheck` コマンドを `package.json` に新設しました。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [096-system-healthcheck-command.md](../backlogs/closed/096-system-healthcheck-command.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [package.json](../../package.json)
- [x] [README.md](../../README.md)

---

## 4. 実装方針 / Implementation Details
Target Branch: `enh/117-system-healthcheck-command`

1. `package.json` に `"healthcheck": "make && npm run test:unit && npm run test:traceability && npm run test:types && npm run lint"` を定義。
2. `README.md` の開発者ヘルプコマンド項目に `npm run healthcheck` を追記。

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] ターミナルで `npm run healthcheck` 実行時に全 5 サブプロセスが正常終了すること。
- [x] サブタスクエラー発生時に非ゼロステータスで即座にアボートすること。
