---
ID: 097
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] Content Security Policy (CSP) 厳格化と通信境界監査 (ID: 097)

## 1. 概要 / Summary
ネットワークスペシャリスト（NW）の観点に基づき、開発環境 `index.html` およびリリース bundle `compiled.html` に組み込まれている Content Security Policy (CSP) メタタグを監査し、`connect-src 'self'`、`script-src 'self' blob:`、`worker-src 'self' blob:` ディレクティブの厳格な適用を維持・検証します。これにより、インラインスクリプトインジェクションや不審な外部ドメインへのデータ送信（T-I1: 情報漏洩）、外部悪意スクリプトのロード（T-S2: Spoofing）を多層防御レベルで確実に遮断します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [index.html](../../index.html) — CSP メタタグ設定の監査・厳格化
- [MODIFY] [compiled.html](../../compiled.html) — リリース用ビルドターゲットの CSP メタタグ設定の同期
- [MODIFY] [comprehensive-threat-modeling.md](../../threat-modeling/comprehensive-threat-modeling.md) — STRIDE T-I1 脅威緩和策ステータスの更新・整合性維持

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 CSP ディレクティブ仕様
- `default-src 'self'`: 未指定リソースの同一オリジン限定。
- `script-src 'self' blob:`: 同一オリジンおよび Blob（Web Worker用）からのスクリプト実行のみを許可し、`unsafe-inline` や外部サードパーティドメインを遮断。
- `worker-src 'self' blob:`: Service Worker および Web Worker の起動を同一オリジンおよび Blob スコープに限定。
- `style-src 'self' https://fonts.googleapis.com`: Google Fonts のスタイルシート取得のみを明示的に許可。
- `font-src 'self' https://fonts.gstatic.com`: Google Fonts のフォントバイナリ取得のみを明示的に許可。
- `connect-src 'self'`: `fetch` や `XMLHttpRequest` による外部送信を同一オリジンのみに厳格に制限し、ユーザーデータ（読書進捗やファイル本文）の外部漏洩を原理的に阻止。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] `index.html` および `compiled.html` の CSP メタタグが同一の厳格なディレクティブで配置されていること。
- [x] 外部ドメイン（Google Fonts 等の許可されたフォントリソースを除く）への不審な XHR / fetch がブラウザの CSP によりブロックされること。
- [x] E2E テストおよび単体テストが CSP 制約化でエラーなくパスすること。
