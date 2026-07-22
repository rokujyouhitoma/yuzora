---
ID: 094
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] ResourceDirector における不審プロトコル制限と Spoofing 防御の強化 (ID: 094)

## 1. 概要 / Summary
セキュリティスペシャリスト（SC）の観点から、`ResourceDirector._isAllowedOrigin` 内で `javascript:`, `data:`, `blob:` などの危険なスキームを遮断し、外部リソース挿入・Spoofing 攻撃に対するセキュリティ検証を強化します。
