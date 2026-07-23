---
ID: 118
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] Content Security Policy (CSP) 厳格化と通信境界監査 (ID: 118)

## 1. 概要 / Summary
`index.html` および `compiled.html` の Content Security Policy (CSP) ディレクティブ (`connect-src 'self'`, `script-src 'self' blob:`, `worker-src 'self' blob:`) を監査・同期し、情報漏洩 (T-I1) や Spoofing (T-S2) に対する多層防御境界を維持・強化しました。

---

## 2. トレーサビリティ / Traceability
- 関連脅威モデリング: [T-I1/comprehensive-threat-modeling.md](../threat-modeling/comprehensive-threat-modeling.md)
- 関連バックログ: [097-csp-strict-header-audit.md](../backlogs/closed/097-csp-strict-header-audit.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [index.html](../../index.html)
- [x] [compiled.html](../../compiled.html)
- [x] [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md)

---

## 4. 実装方針 / Implementation Details
Target Branch: `enh/118-csp-strict-header-audit`

1. CSP メタタグディレクティブを点検し `connect-src 'self'`, `worker-src 'self' blob:` が正しく配置されていることを自動検証。
2. 脅威モデリング T-I1 緩和状況を監査しドキュメントを同期。

---

## 5. 完了条件 (DoD) / Success Criteria
- [x] CSP ヘッダー制約下でアプリおよび Service Worker が正常に機能すること。
- [x] 不審な外部ドメインへの非許可データ送信がブロックされること。
