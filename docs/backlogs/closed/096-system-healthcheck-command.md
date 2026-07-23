---
ID: 096
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] 運用ヘルスチェックコマンド (npm run healthcheck) の新設 (ID: 096)

## 1. 概要 / Summary
ITサービスマネージャ（SM）の観点に基づき、開発者や CI パイプラインがリリース前・コミット前にワンコマンドでシステムの総合的な健全性を診断できる `npm run healthcheck` コマンドを新設・標準化します。
本コマンドは、難読化ビルド (`make`)、単体テスト (`npm run test:unit`)、要件・設計トレーサビリティ検証 (`npm run test:traceability`)、TypeScript/JSDoc 静的型チェック (`npm run test:types`)、および ESLint 静的解析 (`npm run lint`) を一律順次実行し、単一の失敗も許容しない厳格な品質ゲートウェイを提供します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [package.json](../../package.json) — `"healthcheck"` npm スクリプトの追加
- [MODIFY] [README.md](../../README.md) — 開発・運用ヘルプセクションへのヘルスチェックコマンド仕様の記載

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 実行ステップとパイプライン設計
`npm run healthcheck` 実行時に以下の処理チェーンを同期的に完了させる。
1. `make`: Closure Compiler による本番バンドル (`main-min.js`) および CSS 統合 (`style.css`)、ビルド ID / キャッシュバスターの埋め込み検証。
2. `npm run test:unit`: ユニットテストスイート全 104 件の正常実行。
3. `npm run test:traceability`: 要求・要件・設計書・ソース・テスト間の全リンク不整合・死ドキュメント検出。
4. `npm run test:types`: `tsc --noEmit` による JSDoc 型不整合の検証。
5. `npm run lint`: ESLint による JavaScript コードスタイルおよび構文規則の自動検出。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] ターミナルで `npm run healthcheck` を実行した際、全 5 つの検証サブタスクが正常終了し、終了ステータス `0` で完了すること。
- [x] いずれかのサブタスク（例：型エラーや単体テスト失敗）が発生した場合、ヘルスチェックが即座に中断し、非ゼロの終了ステータスで失敗すること。
