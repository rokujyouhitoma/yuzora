---
ID: 015
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT] Closure Compiler の導入とビルド自動化 (ID: 015)

## 1. 概要 / Summary
Google Closure Compiler を用いた JavaScript ファイルのビルド・難読化・軽量化を導入します。
ワークスペースルートに `Makefile` を新設し、開発効率と配布時のパフォーマンス（ロード時間の削減）を高めるビルドパイプラインを構築します。
ビルドの出力ファイル名は `main-min.js` とします。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [Makefile](../../../Makefile) (ビルドコマンド定義)
- [NEW] [compiled.html](../../../compiled.html) (main-min.jsを読み込むリリース検証用HTML)
- [NEW] [tools/closure-compiler/LICENSE](../../../tools/closure-compiler/LICENSE) (ライセンス情報)
- [NEW] [tools/closure-compiler/compiler.jar](../../../tools/closure-compiler/compiler.jar) (コンパイラ本体)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

1. **コンパイラの配置**:
   - `/tools/closure-compiler/` 配下に、配布されている Closure Compiler の実行 jar ファイルを、名前を変更せずに元の配布ファイル名（例: `closure-compiler-*.jar`）のままで配置します（動作環境には Java JDK 11 以上が必要ですが、本環境には Java 21 が導入済みのため動作可能です）。
   - 同ディレクトリに Closure Compiler の公式 `LICENSE` ファイルを配置します。

2. **最適化レベル（Compilation Levels）の選定**:
   - **`SIMPLE_OPTIMIZATIONS` (推奨・デフォルト)**:
     変数名や引数名のリネーム、デッドコードの簡単な削除を行い、安全にコードサイズを圧縮します。JSON シリアライズや内部データ構造へのドット記法アクセスが破損するリスクがなく、最も堅牢に動作します。
   - **`ADVANCED_OPTIMIZATIONS` (オプション)**:
     さらにアグレッシブな難読化、関数のインライン化、不要コードの完全削除を行います。ただし、localStorage のキーや JSON 解析されたオブジェクトプロパティ名がリネームされて機能不全を起こす可能性があるため、安全なマッピング対策（文字列リテラルアクセスへの変換等）が完了した後にのみ適用可能です。

3. **Makefile の設計**:
   - プロジェクトルートに以下のターゲットを持つ `Makefile` を定義します：
     *   `main-min.js`: `src/js/app.js` を Closure Compiler でコンパイルし、出力ファイル `main-min.js` を生成します。デフォルトのコンパイルレベルは `SIMPLE_OPTIMIZATIONS` とします。
     *   `clean`: 生成されたビルドファイル（`main-min.js`）を削除します。

4. **compiled.html の作成**:
   - `index.html` をベースにして `compiled.html` を作成します（`index.html` は開発用としてそのまま残します）。
   - `compiled.html` の中にあるスクリプト読み込みタグを `<script src="main-min.js"></script>` に変更します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `/tools/closure-compiler/` 配下に、元の配布名のままで実行可能な Closure Compiler の jar ファイルおよび `LICENSE` ファイルが正しく配置されていること。
- [ ] ルートディレクトリの `Makefile` を用いて、`make main-min.js` コマンドで `src/js/app.js` から `main-min.js` が警告・エラーなくコンパイル出力されること。
- [ ] `make clean` コマンドを実行した際、生成された `main-min.js` が正しく削除されること。
- [ ] `index.html` をベースに `compiled.html` が新設され、読み込むスクリプトが `main-min.js` に切り替わっていること（`index.html` 自体は開発用として残されていること）。
- [ ] `compiled.html` をブラウザで開いた際、書籍のロード、ページめくり、テーマ設定の切り替え、デバッグ機能、リプレイ機能が `index.html` と全く同一に正常動作すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
