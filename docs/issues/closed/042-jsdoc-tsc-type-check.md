---
ID: 042
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] JSDocとtsc（TypeScript Compiler）による静的型チェックの導入 (ID: 042)

## 1. 概要 / Summary
開発体験（DX）とコードの堅牢性向上のため、JavaScript ソースコードに対して JSDoc アノテーションに基づいた静的型チェック（`tsc --noEmit`）を導入し、CIパイプラインのテスト工程に組み込みます。

## 2. 影響範囲 / Impact Scope
- **ビルド・CI環境 (CI & Build)**:
  - `tsconfig.json` の新設。
  - `package.json` への `typescript` 開発依存追加、および `test:types` スクリプトの追加。
  - GitHub Actions CI ワークフローの更新。
- **ソースコード (Source Code)**:
  - 型エラーを解決するため、`src/js/` 配下の JSDoc アノテーション of 不整合修正。

## 3. 脅威モデルへの影響 / Security & Threat Review
本変更はビルド・テストパイプラインにおける型チェックのみの追加であり、実行時のロジックを変更しないため、新たなセキュリティ脅威（STRIDE）は発生しません。型チェックの厳格化により、実行時のオブジェクト型不整合によるブラウザクラッシュや予期しない挙動（DoSや論理バグ）を未然に防ぐ効果があります。

## 4. 根本原因分析 (RCA) & 対策 / Root Cause Analysis & Fix
* **根本原因 (RCA)**:
  JSDoc による静的型チェック（`tsc`）の導入に伴い、`src/externs.js` の型エラーを回避するため `@ts-nocheck` が追加されました。しかし、これにより `externs.js` に宣言された `YuzoraInterface` などのインターフェース定義が `tsc` から不可視となり、コンパイラエラーを避けるためにソースコード上の JSDoc から `@implements` や `@override` アノテーションが削除されてしまいました。その結果、Google Closure Compiler による ADVANCED_OPTIMIZATIONS 難読化時にインターフェースのメソッド名（`parseAozoraText` など）がリネームされ、単体テスト・E2Eテストでランタイムエラーが発生していました。
* **恒久対策**:
  1. `src/js/types.d.ts`（`tsc` のみが参照し、Closure Compiler は参照しない TypeScript 型定義ファイル）を新設して、`externs.js` 内のインターフェース定義を型チェッカーに解決させます。
  2. `src/js/frameworks/` および `src/js/modules/` 配下の各ソースコード上の JSDoc から、削除された `@implements` および `@override` アノテーションを復元します。これにより、Closure Compiler のプロパティ保護と `tsc` の型チェックが両立します。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `refactor/042-jsdoc-tsc-type-check`

1. [types.d.ts](../../src/js/types.d.ts) に `YuzoraInterface`, `LocatorInterface`, `PublisherInterface`, `RouterInterface`, `SceneInterface`, `SceneDirectorInterface`, `ViewContextInterface`, `CommandInterface`, `CommandManagerInterface`, `RepositoryInterface`, `BookmarkRepositoryInterface`, `SettingsRepositoryInterface`, `SessionRepositoryInterface`, `YuzoraEventInterface`, `YuzoraEventTargetInterface` 等の宣言を追加する。
2. 以下のファイルにおける `@implements` および `@override` アノテーションを完全に復元し、不整合を修正する：
   - `src/js/frameworks/event.js`
   - `src/js/frameworks/locator.js`
   - `src/js/frameworks/publisher.js`
   - `src/js/frameworks/router.js`
   - `src/js/frameworks/scene.js`
   - `src/js/modules/commands.js`
   - `src/js/modules/repository.js`
   - `src/js/modules/yuzora.js`
3. `tsconfig.json` の `include` パスから不要な `src/externs.js` を除外し、新設した `src/js/types.d.ts` のパスを追加する。
4. `npm run test:types` (`tsc --noEmit`) が 0 エラーでパスすることを確認する。
5. `make clean && make` で Closure Compiler ビルドが成功することを確認する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] `tsconfig.json` が適切に設定され、`test:types` スクリプトが追加されていること。
- [x] `npm run test:types` の実行により、コードベースの静的型チェックがエラー 0 件でパスすること。
- [x] CI（GitHub Actions）上で型チェックジョブが統合され、自動的に実行されること。
- [x] 既存のすべてのユニットテスト、E2Eテスト、Closure Compilerビルドが正常にパスすること。
- [x] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（不整合ドキュメントの排除）。
