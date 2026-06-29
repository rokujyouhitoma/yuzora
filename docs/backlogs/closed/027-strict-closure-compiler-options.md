---
ID: 027
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENHANCEMENT] Closure Compilerのコンパイルオプション厳格化 (ID: 027)

## 1. 概要 / Summary
`Makefile` で実行している Closure Compiler のコンパイルオプションをより厳格に設定（`--warning_level VERBOSE` の追加、特定の静的チェック警告のエラー化など）し、ビルド時の静的解析によるコードバグの早期検出力およびコード最適化を向上させます。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [Makefile](../../Makefile) (Closure Compiler 呼び出しオプションの変更)
- [src/js/modules/*.js](../../src/js/modules/) (厳格なコンパイルチェック適用に伴い、修正が必要になる可能性があるソースコード群)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **コンパイラ警告レベルの引き上げ**:
   - `Makefile` の `$(JS_OUT)` ビルドルールにおける `java -jar $(COMPILER)` コマンドラインに、警告レベルを詳細にするオプションを追加します。
     - 例: `--warning_level VERBOSE`
2. **静的チェック例外のエラー化**:
   - 潜在的バグとなりうる一般的な警告カテゴリ（変数の重複定義、型チェック、到達不能コードなど）について、コンパイルエラーとしてビルドを即座に中断させるフラグを追加し、安全なコード品質を強制します。
     - 例: `--jscomp_error=checkVars`, `--jscomp_error=missingProperties`, `--jscomp_error=undefinedNames` など、プロジェクトに適したチェックレベルを適用。
3. **ソース修正とビルド成功検証**:
   - オプション厳格化に伴いコンパイラが警告・エラーを出力した場合、その指摘箇所を調査し適切にソースコードをリファクタリング・修正します。
   - `make clean && make` で警告・エラーなしでクリーンにビルドが成功することを確認します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `Makefile` 内の Closure Compiler コンパイルオプションに、詳細警告レベル（`--warning_level VERBOSE` 等）および必要な静的チェック強化フラグが設定されていること。
- [ ] 厳格化されたオプションの状態で、`make` ビルドがエラーおよび警告なしで正常に完了し `main-min.js` が正しく出力されること。
- [ ] ビルドされた難読化JSを用いて、`npm run test`（E2Eおよびユニットテスト）がすべてパスすること。
