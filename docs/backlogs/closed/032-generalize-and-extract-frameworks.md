---
ID: 032
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] JavaScriptモジュールの汎用化・フレームワーク抽出とディレクトリ分離 (ID: 032)

## 1. 概要 / Summary

現在、`src/js/modules/` 配下の各JavaScriptファイルには、アプリケーション「Yuzora」のドメインロジック（書籍データのロード、特定UI of DOM操作など）と、アプリケーションに依存しない再利用可能な汎用コアロジック（Locator、EventEmitter、PubSub、Scene遷移の基底定義など）が混在しています。

例えば、`scene.js` には汎用的な基底クラス `Scene` や `SceneDirector` とともに、Yuzora固有の画面定義である `InitializeScene`、`WelcomeScene`、`ReaderScene` が同一ファイル内に記述されています。

本バックログでは、これらの汎用ロジックを「フレームワーク」として抽出し、`src/js/frameworks/` などの独立したディレクトリ配下へ移送・整理することで、アプリケーション固有のドメインコードと汎用的な構造コードを分離し、保守性と疎結合性を向上させます。

## 2. 影響範囲と関連ファイル / Scope of Impact & Affected Files

本リファクタリングによる影響範囲および追加・変更対象ファイルは以下の通りです。

### 2.1 新規追加ファイル (フレームワークコア)
- `[NEW]` [locator.js](file:///workspace/yuzora/yuzora/src/js/frameworks/locator.js)
  - 汎用サービスロケータークラス `Locator` を定義します。
- `[NEW]` [event.js](file:///workspace/yuzora/yuzora/src/js/frameworks/event.js)
  - 特定ドメインに依存しない汎用イベントクラス `AppEvent` およびイベントターゲットクラス `AppEventTarget` を定義します。
- `[NEW]` [publisher.js](file:///workspace/yuzora/yuzora/src/js/frameworks/publisher.js)
  - `AppEventTarget` を用いた汎用 Pub/Sub クラス `Publisher` を定義します。
- `[NEW]` [router.js](file:///workspace/yuzora/yuzora/src/js/frameworks/router.js)
  - デフォルトルートのコンストラクタ指定に対応した汎用ハッシュルータークラス `Router` を定義します。
- `[NEW]` [scene.js](file:///workspace/yuzora/yuzora/src/js/frameworks/scene.js)
  - 画面遷移用のライフサイクルインターフェースを持つ基底 `Scene` クラスおよび、具象シーンを動的登録可能な `SceneDirector` クラスを定義します。

### 2.2 変更対象ファイル (アプリケーションモジュール・設定)
- `[MODIFY]` [locator.js](file:///workspace/yuzora/yuzora/src/js/modules/locator.js)
  - フレームワークの `Locator` クラスをベースに、window 上へのシングルトンインスタンス登録を行います。
- `[MODIFY]` [event.js](file:///workspace/yuzora/yuzora/src/js/modules/event.js)
  - `AppEventTarget` をベースにした `YuzoraEventTarget` の登録、および Yuzora 固有のイベント名定義（`YuzoraEventType`）のみに絞り込みます。
- `[MODIFY]` [publisher.js](file:///workspace/yuzora/yuzora/src/js/modules/publisher.js)
  - フレームワークの `Publisher` を Yuzora 向けにバインド・登録します。
- `[MODIFY]` [scene.js](file:///workspace/yuzora/yuzora/src/js/modules/scene.js)
  - フレームワークの `Scene` クラスを継承した、Yuzora 固有のシーン定義（`InitializeScene`, `WelcomeScene`, `ReaderScene`）のみに絞り込みます。
- `[MODIFY]` [yuzora.js](file:///workspace/yuzora/yuzora/src/js/modules/yuzora.js)
  - `boot()` メソッド内で `SceneDirector` に Yuzora 固有のシーンを動的登録する処理を追加します。また `Router` 初期化時にデフォルトルートを `"welcome"` として指定します。
- `[MODIFY]` [index.html](file:///workspace/yuzora/yuzora/index.html)
  - `<script>` タグの参照先を更新し、新規追加する `src/js/frameworks/` 配下のスクリプトを `modules/` よりも先にロードするように順序調整します。
- `[MODIFY]` [Makefile](file:///workspace/yuzora/yuzora/Makefile)
  - `JS_SRCS` に新規フレームワークファイルを追加し、正しい依存関係順で Closure Compiler に入力されるようビルドパイプラインを更新します。
- `[MODIFY]` [externs.js](file:///workspace/yuzora/yuzora/src/externs.js)
  - Closure Compiler の `ADVANCED_OPTIMIZATIONS` に対応するため、新規定義したクラスやエイリアスのプロパティ保護記述を追加・更新します。
- `[MODIFY]` [scene.test.js](file:///workspace/yuzora/yuzora/tests/unit/scene.test.js)
  - シーンが動的に `SceneDirector` へ登録されるようになった変更に追従させ、テスト前にモックシーンを登録する形に修正します。
- `[MODIFY]` [router.test.js](file:///workspace/yuzora/yuzora/tests/unit/router.test.js)
  - テスト対象となるルーターのロードパスを新規フレームワークのものに調整します。

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 抽象と具象の分離（疎結合化設計）
- **SceneDirector の汎用化**:
  - `SceneDirector` 内部で `InitializeScene`, `WelcomeScene`, `ReaderScene` をハードコーディングすることを禁止します。
  - `register(name, scene)` メソッドを公開し、アプリケーションの起動時（`yuzora.js`）に各シーンを外部から注入する設計とします。
- **Router の汎用化**:
  - ルート解決時にマッチしない場合のフォールバック値 `"welcome"` をクラス内で直接ハードコーディングせず、コンストラクタの引数 `defaultRoute` 等で設定可能とします。

### 3.2 セキュリティ要件（Security by Design / Default）
- **ローカル完結＆堅牢なスコープ**:
  - 共通フレームワークおよびモジュールのコードにおいて、ブラウザ外部への通信や動的なスクリプト挿入（`eval`, `innerHTML` を用いた不適切な挿入）を絶対に行わない設計を維持し、XSS 脆弱性の混入を防ぎます。
- **カプセル化と Strict Mode**:
  - すべての新規ファイルで `"use strict";` を明記し、不用意なグローバル汚染を防ぐとともに、Closure Compiler の最適化安全性を確保します。

### 3.3 パフォーマンス・ビルド要件
- **ADVANCED_OPTIMIZATIONS への完全追従**:
  - フレームワークコードが Closure Compiler の変数名・プロパティ名置換により破損しないよう、`src/externs.js` で適切に保護されるインターフェース（例: `LocatorInterface`, `SceneDirectorInterface` 等）を使用します。
  - テストおよび本番用 `compiled.html` での動作が完全に同一になるよう、ビルド対象となる `JS_SRCS` の並び順を依存順（ベース -> モジュール -> アプリ）に厳密に統制します。

## 4. 受入基準 (DoD) / Acceptance Criteria

本バックログが完了したとみなすための検証基準は以下の通りです：

1. **静的解析・検証テストのクリア**:
   - `npm run lint` を実行し、新規追加・修正ファイルに一切の Lint エラーや警告がないこと。
   - `npm run test:unit` を実行し、すべてのユニットテスト（57テスト以上）が正常にパスすること。
2. **ビルド成果物の正常性**:
   - `make clean && make` がエラーなく完了し、結合・難読化された `main-min.js` および `src/css/style.css` が正しく生成されること。
3. **ブラウザ動作確認**:
   - 開発用 `index.html` および本番ビルド用 `compiled.html` の両環境にて、書籍のドラッグ＆ドロップ、表示の縦書きレンダリング、表示設定（フォント・テーマ）のリアルタイム変更、しおり（進捗）の保存および自動復元が完全に機能すること。
