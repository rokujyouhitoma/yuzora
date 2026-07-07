---
ID: 043
種別: Feature
優先度: High
ステータス: Open (In Progress)
---

# [FEAT/ENH] コマンド履歴デシリアライズ入力検証とコンテンツセキュリティポリシー（CSP）の導入 (ID: 043)

## 1. 概要 / Summary
開発管理討議（ID: 043）で合意されたセキュリティ要件に基づき、外部ファイルからの操作履歴インポート時における XSS 攻撃およびプロトタイプ汚染（Prototype Pollution）を防止するための入力値検証処理、およびブラウザ側でのスクリプトインジェクション防御を強化する Content Security Policy (CSP) メタタグ定義の検証と整備を行います。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (快適・セキュアな読書)
- 関連要件 (SRD): SRD-05 (セキュリティ要件)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [commands.js](../../src/js/modules/commands.js) (デシリアライズ・履歴インポート処理のバリデーション実装)
- [index.html](../../index.html) (CSP メタタグの定義検証)
- [compiled.html](../../compiled.html) (CSP メタタグの定義検証)
- [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (詳細設計書における検証ポリシーの追記)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/043-command-history-validation-and-csp`

1. **コマンドパラメータのバリデーション定義**:
   - `src/js/modules/commands.js` の `importJSON` において、`JSON.parse` の実行結果（配列）の各コマンド要素について、以下のホワイトリストベースの厳格なスキーマ検証を実装する。
   - `__proto__`, `constructor`, `prototype` キーを含むパラメータのインポートを完全に遮断し、プロトタイプ汚染を防ぐ。
   - 各コマンド種別ごとの許容パラメータ仕様：
     - `"LoadBook"`: `fileName` (string), `fileContent` (string)
     - `"NavigatePage"`: `targetPage` (number/integer >= 1)
     - `"UpdateConfig"`: 
       - `configKey` は `"theme"`, `"font"`, `"direction"`, `"size"`, `"lh"`, `"spacing"` のいずれか。
       - `configValue` は、各 `configKey` に対応するあらかじめ定義された有効値リスト（例: theme の場合は `sepia`/`light`/`dark`/`black`）のいずれかに完全に合致すること。
     - `"SyncBookmark"`: `progress` (number 且つ 0.0 以上 1.0 以下)
     - `"ToggleControls"`: `visible` (boolean)
     - `"ToggleDrawer"`: `drawerId` (`"settings"` または `"toc"`), `open` (boolean)
     - `"ExitReader"`: 追加パラメータなし
     - `"ClearStorage"`: `clearType` (`"bookmarks"`, `"config"`, `"all"`)
     - `"ToggleDebugModal"`: `open` (boolean)
   - バリデーションに失敗したコマンド要素は破棄（スキップ）し、正常な要素のみをフィルタリングして読み込む。

2. **CSP (Content Security Policy) メタタグの検証と強制**:
   - `index.html` および `compiled.html` に、`unsafe-inline` や `unsafe-eval` を含まない以下の強固な CSP が設定されていることを確認し、ビルドスクリプトや差分適用時に意図せず上書き・除去されないことを保証する。
   - `default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:;`

3. **設計ドキュメントの更新**:
   - [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) に、コマンド履歴インポート時におけるバリデーション要件およびプロトタイプ汚染対策の仕様を追記する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `importJSON` において、`__proto__` などのプロトタイプ汚染プロパティを含む不正な JSON が拒否される、または無害化されること。
- [ ] `importJSON` において、型や値（例えば theme に対する不正値 `"red"`, targetPage に対する文字表現等）が規定外のコマンドが拒否されること。
- [ ] 不正なコマンドデータインポートを検証する自動テスト（`tests/unit/app.test.js` へのテストケース追加等）が実装され、パスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-01](../DSN-01-high_level_design.md) および [DSN-02](../DSN-02-low_level_design.md) の設計仕様と完全に一致していること（不整合ドキュメントの排除）。
