---
ID: 101
種別: Refactor
優先度: High
ステータス: Closed
---

# [REFACTOR] 包括的脅威モデリング監査と緩和策ステータスの全件整合性同期 (ID: 101)

## 1. 概要 / Summary
システム監査技術者（UA）の観点に基づき、[comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) に規定されている STRIDE 脅威モデリングの全項目（T-S1〜T-T3）を包括監査します。
各脅威シナリオにおけるセキュリティ実装コード、検証自動テスト、および対応完了 Issue（[Issue 005](../../issues/closed/005-fix-xss-vulnerability-t-e1.md), [Issue 006](../../issues/closed/006-fix-xss-vulnerability-t-e2.md), [Issue 007](../../issues/closed/007-enforce-csp-mitigation-t-i1.md), [Issue 104](../../issues/closed/104-early-file-size-check.md), [Issue 111](../../issues/closed/111-fix-brace-expansion-vulnerability.md), [Issue 114](../../issues/closed/114-resource-director-lru-cache.md), [Issue 115](../../issues/closed/115-resource-director-protocol-security.md) 等）との相互参照リンクの整合性を 100% 同期します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) — 脅威モデリング結果シートの対応 Issue リンクおよび緩和ステータス (`Mitigated` / `Resolved`) の全件整合同期
- [MODIFY] [README.md](../../threat-modeling/README.md) — 監査完了ログの記録

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 監査項目一覧
- **T-S1 (Spoofing)**: `PREDEFINED_BOOKS` 固定パス保持と静的ローカルリソース限定検証。
- **T-T1, T-T2 (Tampering)**: `LocalStorage` パース try-catch および設定値ホワイトリスト検証。
- **T-I1 (Information Disclosure)**: Content Security Policy `connect-src 'self'` による外部送信防止検証。
- **T-D1 (DoS)**: 初期フェーズでの 2MB サイズプリフライト制限の検証。
- **T-E1, T-E2 (XSS / Elevation of Privilege)**: 青空文庫テキストエスケープおよび DOM サニタイズ（二重防壁）の検証。
- **T-S2, T-D2 (Spoofing / Memory DoS)**: `ResourceDirector` スキーム制限および LRU メモリキャッシュ自動解放の検証。
- **T-D3 (Dependency DoS)**: `brace-expansion` 脆弱性パッチ適用と CI スキャンの検証。
- **T-T3 (Prototype Pollution)**: `__proto__` 再帰的除外およびスキーマバリデーションの検証。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] `comprehensive-threat-modeling.md` の全 12 脅威項目 (T-S1 〜 T-T3) のステータスが `Mitigated` または `Resolved` に同期されていること。
- [x] 対応 Issue への相対パスリンクにリンク切れが存在しないこと。
