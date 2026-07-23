---
ID: 095
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] システム要件定義書 (REQ-03) と v1.1.0 実装機能の同期・更新 (ID: 095)

## 1. 概要 / Summary
ITストラテジスト（ST）の観点に基づき、プロダクトのシステム要件定義書 `docs/requirements/REQ-03-system_requirements.md` を最新の機能実装（IndexedDB 本棚機能、Error Boundary、診断レポートエクスポート、チェックサム検証、および PWA オフライン動作）と完全に同期・改訂し、要件・設計・コード・テスト間の一気通貫なトレーサビリティを確立します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [REQ-03-system_requirements.md](../../requirements/REQ-03-system_requirements.md) — IndexedDB 本棚 (SRD 3.9), Error Boundary (SRD 3.10), チェックサム検証 (SRD 3.11), PWA/Service Worker (SRD 3.12) 要件仕様の追記
- [MODIFY] [MNG-01-document_ledger.md](../../processes/MNG-01-document_ledger.md) — ドキュメント台帳における `REQ-03` バージョンマイルストーン同期

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 `REQ-03` 追記項目仕様
- **3.9 IndexedDB 本棚（マイライブラリ）要件**: インポート済み書籍のローカル永続化、一覧取得、およびカード削除・再読込フローの定義。
- **3.10 クライアント Error Boundary 要件**: 予期せぬスクリプト例外捕捉、スタックダンプおよび Markdown レポート出力要件。
- **3.11 操作履歴チェックサム検証要件**: エクスポート時のハッシュチェックサム付与とインポート時改ざん検知要件。
- **3.12 PWA オフライン自律稼働要件**: Web App Manifest および Service Worker によるアセットプレキャッシュとスタンドアロン起動要件。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] `REQ-03-system_requirements.md` に最新実装機能 (IndexedDB, Error Boundary, Checksum, PWA) がすべて網羅されていること。
- [x] トレーサビリティ検証スクリプト (`npm run test:traceability`) にて死ドキュメントや矛盾がないことがパスすること。
