---
ID: 011
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] Closure Compiler の導入とビルド自動化 (ID: 011)

## 1. 概要 / Summary
Google Closure Compiler を用いた JavaScript ファイル of ビルド・難読化・軽量化を導入します。
ワークスペースルートに `Makefile` を新設し、開発効率と配布時のパフォーマンス（ロード時間の削減）を高めるビルドパイプラインを構築します。
ビルドの出力ファイル名は `main-min.js` とします。

**開発哲学 (MNG-00) とのアラインメント**:
本機能は、完全クライアントサイド実行 (Serverless) を維持しつつ、リリース成果物のロード時間削減と動作軽量化を実現し、伝統的かつ美しい日本語読書体験の継承（UXの向上）を技術面から支えるものです。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): REQ-01 (機能要求全般)
- 関連要件 (SRD): REQ-03 (システム要件・非機能要件)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [Makefile](file:///workspace/yuzora/yuzora/Makefile) (ビルドコマンド定義)
- [NEW] [compiled.html](file:///workspace/yuzora/yuzora/compiled.html) (main-min.jsを読み込むリリース検証用HTML)
- [NEW] [tools/closure-compiler/LICENSE](file:///workspace/yuzora/yuzora/tools/closure-compiler/LICENSE) (ライセンス情報)
- [NEW] [tools/closure-compiler/compiler.jar](file:///workspace/yuzora/yuzora/tools/closure-compiler/compiler.jar) (コンパイラ本体)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/011-integrate-closure-compiler`

1. **コンパイラのダウンロードと配置**
   - `tools/closure-compiler/` ディレクトリを作成する。
   - `closure-compiler-v20240317.jar` を Maven Central (https://repo1.maven.org/maven2/com/google/javascript/closure-compiler/v20240317/closure-compiler-v20240317.jar) からダウンロードし、元の配布名のまま配置する。
   - `LICENSE` ファイル (https://raw.githubusercontent.com/google/closure-compiler/master/LICENSE) を取得し、同ディレクトリに配置する。
2. **Makefile の新規作成**
   - ルートディレクトリに `Makefile` を新規作成する。
   - `main-min.js` ターゲットを追加し、 `java -jar tools/closure-compiler/closure-compiler-v20240317.jar --compilation_level SIMPLE_OPTIMIZATIONS --js src/js/app.js --js_output_file main-min.js` を定義する。
   - `clean` ターゲットを追加し、 `rm -f main-min.js` を定義する。
3. **compiled.html の作成**
   - `index.html` をベースにして `compiled.html` を作成する。
   - 288行目の `<script src="src/js/app.js"></script>` を `<script src="main-min.js"></script>` に変更する。
4. **E2Eテストの拡張可能性の担保**
   - `tests/e2e/viewer.spec.js` および `tests/e2e/diagnose.spec.js` の `page.goto` 部分を `process.env.TEST_PATH || '/'` に変更し、環境変数経由で `compiled.html` に対してもテストを実行可能にする。
5. **設計書 [DSN-01](../docs/DSN-01-high_level_design.md) の更新**
   - コンポーネント役割表に `compiled.html` および `main-min.js` の記述を追記する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `/tools/closure-compiler/` 配下に、元の配布名のままで実行可能な Closure Compiler の jar ファイルおよび `LICENSE` ファイルが正しく配置されていること。
- [ ] ルートディレクトリの `Makefile` を用いて、`make main-min.js` コマンドで `main-min.js` が警告・エラーなくコンパイル出力されること。
- [ ] `make clean` コマンドを実行した際、生成された `main-min.js` が正しく削除されること。
- [ ] `index.html` をベースに `compiled.html` が新設され、読み込むスクリプトが `main-min.js` に切り替わっていること（`index.html` 自体は開発用として残されていること）。
- [ ] `compiled.html` をブラウザで開いた際、書籍のロード、ページめくり、テーマ設定の切り替え、デバッグ機能、リプレイ機能が `index.html` と全く同一に正常動作すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] `TEST_PATH="/compiled.html" npx playwright test` を実行した際、すべてのE2Eテストがパスすること。
- [ ] 設計仕様の整合：実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) に反映されており、ドキュメントの形骸化がないこと。
