---
ID: 026
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] JavaScriptの "use strict" 有効化 (ID: 026)

## 1. 概要 / Summary
全JavaScriptソースファイルに対して `"use strict";` （厳格モード）を有効化し、意図しないグローバル変数の作成の防止、静的解析でのエラー検出能力の向上、およびJavaScriptエンジンによる実行速度最適化の恩恵を受けられるようにします。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ui.js](../../src/js/modules/ui.js) (先頭行への追加および厳格モード違反コードの修正)
- [viewer.js](../../src/js/modules/viewer.js) (先頭行への追加および厳格モード違反コードの修正)
- [commands.js](../../src/js/modules/commands.js) (先頭行への追加および厳格モード違反コードの修正)
- [parser.js](../../src/js/modules/parser.js) (先頭行への追加および厳格モード違反コードの修正)
- [diagnostics.js](../../src/js/modules/diagnostics.js) (先頭行への追加および厳格モード違反コードの修正)
- [config.js](../../src/js/modules/config.js) (先頭行への追加および厳格モード違反コードの修正)
- [locator.js](../../src/js/modules/locator.js) (先頭行への追加および厳格モード違反コードの修正)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **厳格モードの適用**:
   - `src/js/modules/*.js` のすべてのファイル、および今後新設するJSファイルの先頭（または最初の命令文の前）に `"use strict";` ディレクティブを記述します。
2. **静的検証・警告の解消**:
   - 厳格モードを有効にすることで検出される、暗黙のグローバル変数の割り当て（`var`, `let`, `const` の宣言漏れ）、予約語の使用、`delete` 演算子の誤用、オブジェクトプロパティの重複定義などを静的に検出し、適切に修正します。
3. **ビルドおよびテスト実行**:
   - 変更後、`make` コマンドでClosure Compilerによる結合・難読化ビルドを実行し、コンパイラから厳格モードに関する警告が発生しないことを確認します。
   - `npm run test`（ユニットテストおよびE2Eテスト）を実行し、実行時に厳格モード起因の `TypeError` や `ReferenceError` が発生しないことを確認します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] 影響範囲にリストされたすべてのJavaScriptモジュールファイルの先頭に `"use strict";` が配置されていること。
- [ ] `"use strict";` 有効化の状態で `npm run lint` が警告なしでパスすること。
- [ ] Closure Compilerビルドを実行し、警告なしで `main-min.js` が生成されること。
- [ ] すべてのユニットテスト（`npm run test:unit`）およびE2Eテスト（`npm run test:e2e`）が正常にパスすること。
