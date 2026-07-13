---
ID: 057
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] Parser からの HTML 組み立て処理の完全排除と Evaluator への責務集約 (ID: 057)

## 1. 概要 / Summary
`AozoraParser` (構文解析) と `AozoraEvaluator` (コード生成/HTML出力) の責務分担を厳格化します。
現状、`AozoraParser` 内で一部 HTML タグ文字列の直接組み立て（例：空行 `empty-line` の `<div class="empty-line"></div>` や改ページ `page-break` などの直接HTML文字列生成）が含まれてしまっている場合、これを完全に排除し、パーサーは純粋な抽象構文木 (AST) の構築のみに専念させます。
HTML への具体的な出力処理（タグの追加やCSSクラス付与など）は、全て `AozoraEvaluator` の責務として一元化します。これにより、パース処理と描画言語出力の結合を解消し、モジュール性とセキュリティを向上させます。
