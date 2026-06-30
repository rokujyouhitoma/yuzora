---
ID: 025
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENHANCEMENT] Closure CompilerのADVANCED_OPTIMIZATIONS適用と警告の全面エラー化 (ID: 025)

## 1. 概要 / Summary
`Makefile` 内の Closure Compiler オプションを最高強度の厳格モードに更新します。これには、最大コンパイルレベルである `ADVANCED_OPTIMIZATIONS` の適用、全警告のビルドエラー化 (`--jscomp_error=*`)、および最新の JavaScript 仕様 (`ECMASCRIPT_NEXT`) への準拠を含みます。これにより、徹底的なデッドコード排除とプロパティ名短縮によるファイルサイズの極小化、およびコンパイル時の完全な安全性チェックを実現します。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [028-advanced-closure-compiler-options.md](../backlogs/028-advanced-closure-compiler-options.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [Makefile](../../Makefile) (オプション設定の変更)
- [x] [tools/externs.js](../../tools/externs.js) (ADVANCED 適用に伴うプロパティ名リネーム防止定義の追加)
- [x] [src/js/modules/](../../src/js/modules/) (静的型アノテーションや最適化エラー修正が発生するソースファイル群)

---

## 4. 根本原因分析 (RCA) / Root Cause Analysis
- 現状の `SIMPLE_OPTIMIZATIONS` では、デッドコードの排除やプロパティ名の短縮といった高度な最適化が行われておらず、ファイルサイズ削減の余地が残っています。また、一部の警告カテゴリしかエラーとして扱っていないため、潜在的な記述ミスの発見漏れが発生する可能性があります。

---

## 5. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし。
* **恒久対策 (Permanent Fix)**:
  - `Makefile` 内のオプションを最高レベルの最適化・警告厳格化フラグ群へ差し替えます。
  - プロパティ名短縮による不具合（DOMプロパティや動的キーアクセスなど）を保護するため、リネームから守るべき全プロパティ名を `tools/externs.js` に明示的に定義します。
  - 静的エラー化によって検出されたコード上の不整合（型ミスやアノテーション不足など）を適切に修正し、コンパイルを通します。

---

## 6. 実装方針 / Implementation Plan
Target Branch: `feat/025-advanced-closure-compiler-options`

1. `Makefile` 内の Closure Compiler オプションを以下のように更新：
   - `--compilation_level ADVANCED_OPTIMIZATIONS`
   - `--warning_level VERBOSE`
   - `--jscomp_error=*`
   - `--language_in ECMASCRIPT_NEXT`
   - `--language_out ECMASCRIPT_NEXT`
   - `--strict_mode_input=true`
2. `make clean && make` を実行し、すべてのコンパイル警告・エラーを抽出。
3. リネームによるランタイム不具合を防ぐため、保護すべきプロパティ名・グローバルオブジェクトを `tools/externs.js` に追加（または `Object['prop']` 記法などの文字リテラルアクセスを適用）。
4. 各ソースコードの型不整合や静的エラーを JSDoc の補強やコードリファクタリングにより修正。
5. `0 errors, 0 warnings` でのクリーンビルドの成功を確認。
6. `npm run test` によるユニットおよびE2Eテストがすべてパスし、機能が維持されていることを確認。

---

## 7. 完了条件 / Success Criteria (DoD)
- [ ] `Makefile` に最大最適化レベル (`ADVANCED_OPTIMIZATIONS`)、全警告のエラー化 (`--jscomp_error=*`)、`ECMASCRIPT_NEXT` 等の厳格な設定が含まれていること。
- [ ] 厳格化されたオプションの状態で `make clean && make` がエラーおよび警告なし（0 errors, 0 warnings）で正常完了し `main-min.js` が正しく出力されること。
- [ ] 生成された `main-min.js` を用いたユニットテストおよびE2Eテストがすべて正常にパスすること。
