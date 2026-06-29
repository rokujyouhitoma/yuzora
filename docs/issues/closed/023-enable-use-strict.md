---
ID: 023
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] JavaScriptの "use strict" 有効化 (ID: 023)

## 1. 概要 / Summary
全JavaScriptソースファイルに対して `"use strict";` （厳格モード）を有効化し、意図しないグローバル変数の作成の防止、静的解析でのエラー検出能力の向上、およびJavaScriptエンジンによる実行速度最適化の恩恵を受けられるようにします。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [026-enable-use-strict.md](../backlogs/026-enable-use-strict.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [locator.js](../../src/js/modules/locator.js)
- [x] [config.js](../../src/js/modules/config.js)
- [x] [commands.js](../../src/js/modules/commands.js)
- [x] [parser.js](../../src/js/modules/parser.js)
- [x] [diagnostics.js](../../src/js/modules/diagnostics.js)
- [x] [viewer.js](../../src/js/modules/viewer.js)
- [x] [ui.js](../../src/js/modules/ui.js)

---

## 4. 根本原因分析 (RCA) / Root Cause Analysis
- 現状、すべての JavaScript 機能モジュールにおいて `"use strict";` ディレクティブが指定されていません。これにより、宣言のない変数への代入が自動的にグローバル変数として初期化されてしまうなどの安全でない挙動をブラウザが許容し、サイレントなバグ温床となるリスクがあります。

---

## 5. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし。
* **恒久対策 (Permanent Fix)**:
  - 対象ファイルすべてに `"use strict";` を明示し、実行環境を厳格モードに強制します。これに伴い発生する厳格モード違反コードをすべて特定・修正します。

---

## 6. 実装方針 / Implementation Plan
Target Branch: `refactor/023-enable-use-strict`

1. 対象モジュールファイル（`src/js/modules/*.js`）の先頭行に `"use strict";` ディレクティブを挿入。
2. 厳格モード（`"use strict"`）起因で発生しうる一般的な違反箇所を修正：
   - 宣言されていない変数への値の割り当て（`let`, `const`, `var` の不足がないかの確認）。
   - クラスや関数のスコープ、引数・プロパティ重複の確認。
3. `make` による Closure Compiler ビルド、`npm run lint`、および `npm run test` を実行し、静的・動的チェックの両面からエラーが解消されていることを検証。

---

## 7. 完了条件 / Success Criteria (DoD)
- [ ] 影響範囲に示すすべての JavaScript ファイルの先頭行に `"use strict";` が記述されていること。
- [ ] `"use strict";` 有効化の状態で `npm run lint` および `npm run test` が警告・エラーなしで正常にパスすること。
- [ ] 本実装に伴う変更内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
