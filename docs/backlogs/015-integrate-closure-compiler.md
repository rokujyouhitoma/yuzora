---
ID: 015
種別: Feature
優先度: Medium
ステータス: Approved
---

# [FEAT] Closure Compiler の導入とビルド自動化 (ID: 015)

## 1. 概要 / Summary
Google Closure Compiler を用いた JavaScript ファイルのビルド・難読化・軽量化を導入します。
ワークスペースルートに `Makefile` を新設し、開発効率と配布時のパフォーマンス（ロード時間の削減）を高めるビルドパイプラインを構築します。
ビルドの出力ファイル名は `main-min.js` とします。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [Makefile](file:///workspace/yuzora/yuzora/Makefile) (ビルドコマンド定義)
- [NEW] [tools/closure-compiler/LICENSE](file:///workspace/yuzora/yuzora/tools/closure-compiler/LICENSE) (ライセンス情報)
- [NEW] [tools/closure-compiler/compiler.jar](file:///workspace/yuzora/yuzora/tools/closure-compiler/compiler.jar) (コンパイラ本体)
- [MODIFY] [index.html](file:///workspace/yuzora/yuzora/index.html) (ビルド済みスクリプト読み込み切替、またはリリースビルド対応)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

1. **コンパイラの配置**:
   - `/tools/closure-compiler/` ディレクトリ配下に、Closure Compiler の実行 jar ファイルを `compiler.jar` の名称で配置します（動作環境には Java JDK 11 以上が必要ですが、本環境には Java 21 が導入済みのため動作可能です）。
   - 同ディレクトリに Closure Compiler の公式 `LICENSE` ファイルを配置します。

2. **最適化レベル（Compilation Levels）の選定**:
   - **`SIMPLE_OPTIMIZATIONS` (推奨・デフォルト)**:
     変数名や引数名のリネーム、デッドコードの簡単な削除を行い、安全にコードサイズを圧縮します。JSON シリアライズや内部データ構造へのドット記法アクセスが破損するリスクがなく、最も堅牢に動作します。
   - **`ADVANCED_OPTIMIZATIONS` (オプション)**:
     さらにアグレッシブな難読化、関数のインライン化、不要コードの完全削除を行います。ただし、localStorage のキーや JSON 解析されたオブジェクトプロパティ名がリネームされて機能不全を起こす可能性があるため、安全なマッピング対策（文字列リテラルアクセスへの変換等）が完了した後にのみ適用可能です。

3. **Makefile の設計**:
   - プロジェクトルートに以下のターゲットを持つ `Makefile` を定義します：
     *   `make build`: `src/js/app.js` を Closure Compiler でコンパイルし、`main-min.js` を出力します。デフォルトのコンパイルレベルは `SIMPLE_OPTIMIZATIONS` とします。
     *   `make clean`: 生成されたビルドファイルを削除します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] `/tools/closure-compiler/` 配下に実行可能な `compiler.jar` および `LICENSE` ファイルが正しく配置されていること。
- [ ] ルートディレクトリの `Makefile` を用いて、`make build` コマンドで `src/js/app.js` から `main-min.js` が警告・エラーなくコンパイル出力されること。
- [ ] ビルドされた `main-min.js` を `index.html` に読み込ませて動作させた際、書籍のロード、ページめくり、テーマ設定の切り替え、デバッグ機能、リプレイ機能が全く同一に正常動作すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
