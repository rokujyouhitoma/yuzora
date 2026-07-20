---
ID: 067
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [Refactor] パーサーおよびレンダラーのセキュリティ強化と堅牢性向上（エスケープ強化・サニタイズ共通化・メモリ最適化） (ID: 067)

## 1. 概要 / Summary
SAによるモジュール調査（modules/parser）にて検出された、セキュリティおよびシステム堅牢性に関する以下の潜在的リスク・設計不整合を解消し、モジュール全体の安全性とパフォーマンスを向上させます。

### 1.1. 解決すべき問題と対応案
1. **`AozoraEvaluator.escapeHTML` のエスケープ不完全性の解消 (Security Hardening)**
   - **問題**: 現在のHTMLエスケープが `&`, `<`, `>` のみに留まり、ダブルクォーテーション `"` やシングルクォーテーション `'` がエスケープされていません。
   - **対応**: 属性値コンテキストへの挿入が発生した場合のXSS（CWE-79）を防ぐため、`"` を `&quot;`、`'` を `&#x27;` にエスケープするよう修正します。
2. **`sanitizeDOM` の共通化 (Architecture & DRY Principle)**
   - **問題**: `AozoraEvaluator.sanitizeDOM` と `VerticalRenderer.sanitizeDOM` が全く同じロジックで重複実装されています。
   - **対応**: サニタイズの実装を `AozoraEvaluator`（またはヘルパークラス）に集約し、`VerticalRenderer` からは共通関数を呼ぶようにリファクタリングして、修正漏れリスクを排除します。
3. **パース結果 `title` のエスケープ不整合の解消 (Function Normalization)**
   - **問題**: `parseAozoraText` の戻り値 `title` がエスケープ済みであるのに対し、`parseAozoraHTML` の戻り値 `title` が未エスケープであり、ビューアーの `textContent` への代入時に表示上の実体参照崩れが発生する不整合があります。
   - **対応**: パーサー側からは生テキストの `title` を返却し、画面側（`viewer.js`）で一貫して安全に出力する形にデータフローを再設計します。
4. **`DOMParser` インスタンスの再利用によるメモリ最適化 (Performance & Robustness)**
   - **問題**: HTMLロードや画面描画（`VerticalRenderer.render`）の都度 `new DOMParser()` がローカルでインスタンス化されており、GCのオーバーヘッドやメモリリークのリスクがあります。
   - **対応**: 各クラスのコンストラクタで1回のみ `DOMParser` を生成し、インスタンス変数として使い回す構造に変更します。
