---
ID: 110
種別: Refactor
優先度: High
ステータス: Closed
---

# [Refactor] tsconfig.json の型チェック厳格化 (ID: 110)

## 1. 概要 / Summary
Yuzoraの全JavaScriptソースコード (`src/js/`) に対して、`tsconfig.json` の型チェック設定 (`checkJs: true`, `strict: true`) を厳格運用し、開発時およびCIビルド時に `npm run test:types` (`tsc --noEmit`) による静的解析を常時適用します。これにより、Null/Undefinedアクセスや未定義プロパティへの参照などの潜在的エラーを、**ゼロ追加ライブラリ・ゼロランタイムコスト**（[MNG-00](../../MNG-00-development_philosophy.md) の完全クライアントサイド原則を完全遵守）で未然に防止します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [tsconfig.json](../../tsconfig.json) — TypeScriptコンパイラ型検証設定
- [x] [package.json](../../package.json) — `npm run test:types` コマンド定義
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. **型コンパイル検証の独立実行**:
   アプリ本体は純粋な Vanilla ES2022 JavaScript として構築し、Closure Compiler (`ADVANCED_OPTIMIZATIONS`) で難読化・最小化を実施します。`tsconfig.json` はコード生成（`noEmit: true`）を行わず、静的型インスペクション専用のガードとして機能させます。
2. **JSDoc アノテーションと Closure Compiler / tsc の二重相乗効果**:
   JSDoc (`@type`, `@param`, `@return`) による型情報を `tsc --noEmit` と Closure Compiler に共通インプットとして提供し、難読化時のプロパティ消滅（マングル障害）と型不整合の両方を同時防御します。

---

## 4. 要件と技術詳細 / Technical Requirements
- `tsconfig.json` の `compilerOptions` において、`checkJs: true` および `strict: true` を適用し、`src/js/**/*` 配下の全JavaScriptモジュールを型チェック対象とします。
- `package.json` の `scripts.test:types` (`tsc --noEmit`) が、警告・エラーなく即座に完了することを保証します。
- セキュリティ・パフォーマンストラッシュホールド: ランタイムサイズ（`main-min.js`）および外部依存パッケージ追加は一切行わないこと。

---

## 5. 完了条件 (DoD) / Acceptance Criteria
- [x] `tsconfig.json` に `checkJs: true` および `strict: true` が正しく設定されていること。
- [x] `npm run test:types` (`tsc --noEmit`) を実行した際、型エラーが 0 件で通過すること。
- [x] `npm run healthcheck` パイプライン内で `test:types` が自動実行され、全検証がグリーンであること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に同期していること。
