---
ID: 028
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENHANCEMENT] Closure CompilerのADVANCED_OPTIMIZATIONS適用と警告の全面エラー化 (ID: 028)

## 1. 概要 / Summary
`Makefile` 内の Closure Compiler オプションを最高強度の厳格モードに更新します。これには、最大コンパイルレベルである `ADVANCED_OPTIMIZATIONS` の適用、全警告のビルドエラー化 (`--jscomp_error=*`)、および最新の JavaScript 仕様 (`ECMASCRIPT_NEXT`) への準拠を含みます。これにより、徹底的なデッドコード排除とプロパティ名短縮によるファイルサイズの極小化、およびコンパイル時の完全な安全性チェックを実現します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [Makefile](../../Makefile) (コンパイラフラグの更新)
- [tools/externs.js](../../tools/externs.js) (ADVANCED_OPTIMIZATIONS 適用に伴うプロパティ名保持のための外部定義の追加)
- [src/js/modules/*.js](../../src/js/modules/) (厳格な型チェックおよび最適化に伴い、修正・アノテーションが必要となる全JSソースファイル)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **Makefile のコンパイルオプション変更**:
   - `--compilation_level ADVANCED_OPTIMIZATIONS` を適用。
   - `--warning_level VERBOSE` および `--jscomp_error=*` を追加してすべての警告をエラー扱いにする。
   - `--language_in ECMASCRIPT_NEXT`、`--language_out ECMASCRIPT_NEXT`、および `--strict_mode_input=true` を指定する。
2. **Externs（外部宣言ファイル）の整備**:
   - `ADVANCED_OPTIMIZATIONS` では、externs で定義されていないオブジェクトプロパティ名がすべて短縮（リネーム）されます。
   - DOM 要素のプロパティ参照や `localStorage`、Locator パターンに紐づく動的な属性アクセスなどが正しく動作し続けるよう、リネームから保護すべきプロパティ群を `tools/externs.js` に漏れなく宣言します。
3. **静的型チェック（JSDoc）とコードの修正**:
   - 全警告のエラー化により、型不一致や引数の不整合、未定義プロパティへのアクセス等がすべてビルドエラーとなります。
   - すべての指摘箇所について、JSDoc による厳密な型アノテーションを記述するか、コードの構造を修正してエラーを解消します。
4. **ビルドおよびテスト成功の確認**:
   - `make clean && make` が警告・エラーなしでクリーンに成功することを確認。
   - ビルドされた `main-min.js` をロードして、E2Eテストおよびユニットテストを実行し、意図しない名前の衝突やプロパティリネームによるバグがないことを検証。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `Makefile` 内で `ADVANCED_OPTIMIZATIONS`, `ECMASCRIPT_NEXT`, `--jscomp_error=*` などの指定オプションが有効になっていること。
- [ ] `make clean && make` がエラーおよび警告なし（0 errors, 0 warnings）で正常に完了し、ビルドアセットが出力されること。
- [ ] 出力された難読化JSを用いて、ユニットテストおよびE2Eテストがすべて正常にパスすること。
