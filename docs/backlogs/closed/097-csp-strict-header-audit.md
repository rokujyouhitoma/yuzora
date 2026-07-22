---
ID: 097
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] Content Security Policy (CSP) 厳格化と通信境界監査 (ID: 097)

## 1. 概要 / Summary
ネットワークスペシャリスト（NW）の観点から、`index.html` に定義された Content Security Policy (CSP) ディレクティブを点検し、`connect-src 'self'` による非許可コネクション遮断および完全ローカル動作境界を維持・監査します。
