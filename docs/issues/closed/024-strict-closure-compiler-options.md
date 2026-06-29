---
ID: 024
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENHANCEMENT] Closure Compilerのコンパイルオプション厳格化 (ID: 024)

## 1. 概要 / Summary
`Makefile` で実行している Closure Compiler のコンパイルオプションをより厳格に設定（`--warning_level VERBOSE` の追加、特定の静的チェック警告のエラー化など）し、ビルド時の静的解析によるコードバグの早期検出力およびコード最適化を向上させます。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [027-strict-closure-compiler-options.md](../backlogs/027-strict-closure-compiler-options.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [Makefile](../../Makefile)
- [x] [src/js/modules/](../../src/js/modules/) (ビルド警告/エラー修正が発生する可能性のある全JavaScriptモジュールファイル)

---

## 4. 根本原因分析 (RCA) / Root Cause Analysis
- 現在、`Makefile` のビルドルールでは Closure Compiler が `--compilation_level SIMPLE_OPTIMIZATIONS` のみで動作しており、警告レベルがデフォルトのままとなっています。これにより、変数の重複宣言、到達不能コード、未定義変数の参照などの潜在的なバグがコンパイル時に検出されず、ランタイムエラーとして発現するリスクがあります。

---

## 5. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし。
* **恒久対策 (Permanent Fix)**:
  - `Makefile` 内の Closure Compiler 呼び出しオプションに `--warning_level VERBOSE` を追加し、警告情報を詳細に出力します。
  - さらに、深刻な静的バグ（変数の重複定義や未定義名など）を検出した場合にビルドを即座に中断させるため、`--jscomp_error=checkVars` および `--jscomp_error=undefinedNames` オプションを付与し、検出された警告やエラーを解決するようにソースコードを修正します。

---

## 6. 実装方針 / Implementation Plan
Target Branch: `feat/024-strict-closure-compiler-options`

1. `Makefile` 内の JS コンパイルコマンドに以下を追加：
   - `--warning_level VERBOSE`
   - `--jscomp_error=checkVars`
   - `--jscomp_error=undefinedNames`
2. `make clean && make` を実行し、コンパイラが出力する警告・エラーメッセージを確認。
3. 検出されたすべての指摘箇所（重複宣言や不要なグローバル記述、厳格モードに違反する構文など）について、`src/js/modules/*.js` の該当ファイルを修正。
4. クリーンビルドが警告およびエラーゼロで成功することを確認。
5. E2Eテストおよびユニットテストを実行し、コンパイル後の難読化コード（`main-min.js`）が完全に機能することを検証。

---

## 7. 完了条件 / Success Criteria (DoD)
- [ ] `Makefile` に `--warning_level VERBOSE`, `--jscomp_error=checkVars`, `--jscomp_error=undefinedNames` が組み込まれていること。
- [ ] 厳格化されたオプションの状態で `make clean && make` がエラーおよび警告なしで正常完了すること。
- [ ] 生成された `main-min.js` を用いたユニットテストおよびE2Eテストがすべて正常にパスすること。
