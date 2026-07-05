---
ID: 037
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] JavaScriptモジュールの汎用化・フレームワーク抽出とディレクトリ分離 (ID: 037)

## 1. 概要 / Summary

現在、`src/js/modules/` 配下の各JavaScriptファイルには、アプリケーション「Yuzora」のドメインロジック（書籍データのロード、特定UIのDOM操作など）と、アプリケーションに依存しない再利用可能な汎用コアロジック（Locator、EventEmitter、PubSub、Scene遷移の基底定義など）が混在しています。

本課題では、バックログ [032-generalize-and-extract-frameworks.md](../backlogs/032-generalize-and-extract-frameworks.md) で定義された要件に基づき、これらの汎用ロジックを「フレームワーク」として抽出し、`src/js/frameworks/` 配下の独立したディレクトリへ移送・整理することで、アプリケーション固有 of ドメインコードと汎用的な構造コードを分離し、保守性と疎結合性を向上させます。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): 
- 関連要件 (SRD): [REQ-03-system_requirements.md](../REQ-03-system_requirements.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [locator.js](file:///workspace/yuzora/yuzora/src/js/frameworks/locator.js)
- [ ] [event.js](file:///workspace/yuzora/yuzora/src/js/frameworks/event.js)
- [ ] [publisher.js](file:///workspace/yuzora/yuzora/src/js/frameworks/publisher.js)
- [ ] [router.js](file:///workspace/yuzora/yuzora/src/js/frameworks/router.js)
- [ ] [scene.js](file:///workspace/yuzora/yuzora/src/js/frameworks/scene.js)
- [ ] [locator.js](file:///workspace/yuzora/yuzora/src/js/modules/locator.js)
- [ ] [event.js](file:///workspace/yuzora/yuzora/src/js/modules/event.js)
- [ ] [publisher.js](file:///workspace/yuzora/yuzora/src/js/modules/publisher.js)
- [ ] [scene.js](file:///workspace/yuzora/yuzora/src/js/modules/scene.js)
- [ ] [yuzora.js](file:///workspace/yuzora/yuzora/src/js/modules/yuzora.js)
- [ ] [index.html](file:///workspace/yuzora/yuzora/index.html)
- [ ] [Makefile](file:///workspace/yuzora/yuzora/Makefile)
- [ ] [externs.js](file:///workspace/yuzora/yuzora/src/externs.js)
- [ ] [scene.test.js](file:///workspace/yuzora/yuzora/tests/unit/scene.test.js)
- [ ] [router.test.js](file:///workspace/yuzora/yuzora/tests/unit/router.test.js)
- [ ] [DSN-01-high_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-01-high_level_design.md)
- [ ] [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/037-generalize-and-extract-frameworks`

### 4.1 設計ドキュメントの先行更新
- [DSN-01-high_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-01-high_level_design.md) および [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) のディレクトリ構成図や説明記述を更新し、`src/js/frameworks/` と `src/js/modules/` の関係性および汎用化されたクラスインターフェース定義を反映します。

### 4.2 共通フレームワークコア (`src/js/frameworks/`) の新規実装
- `src/js/frameworks/` ディレクトリを作成し、以下の汎用ロジックファイルを抽入・配置します（各ファイル先頭に `"use strict";` を明記）。
  - **[locator.js](file:///workspace/yuzora/yuzora/src/js/frameworks/locator.js)**:
    - 汎用 `Locator` クラスを定義。特定のアプリケーションコンテキストに依存しない。
  - **[event.js](file:///workspace/yuzora/yuzora/src/js/frameworks/event.js)**:
    - 汎用 `AppEvent` および `AppEventTarget` クラスを定義。
  - **[publisher.js](file:///workspace/yuzora/yuzora/src/js/frameworks/publisher.js)**:
    - `AppEventTarget` インスタンスを受け取る汎用 Pub/Sub クラス `Publisher` を定義。
  - **[router.js](file:///workspace/yuzora/yuzora/src/js/frameworks/router.js)**:
    - 汎用 `Router` クラスを定義。コンストラクタ引数で `defaultRoute` (デフォルトは `"welcome"`) を受け取り、空のハッシュ値の解決先として利用する。
  - **[scene.js](file:///workspace/yuzora/yuzora/src/js/frameworks/scene.js)**:
    - `enter(data)` / `exit()` メソッドを規定した基底 `Scene` クラスを定義。
    - 汎用 `SceneDirector` クラスを定義。コンストラクタで具象シーンをハードコーディングせず、`register(name, scene)` メソッドで動的登録する仕組みを提供する。

### 4.3 アプリケーションモジュール (`src/js/modules/`) の修正と具象バインド
- 共通フレームワークを参照し、ドメインロジックを構成します。
  - **[locator.js](file:///workspace/yuzora/yuzora/src/js/modules/locator.js)**:
    - `Locator` クラス定義を削除し、フレームワークの `Locator` インスタンスを作成して `window['locator']` へ設定。
  - **[event.js](file:///workspace/yuzora/yuzora/src/js/modules/event.js)**:
    - `YuzoraEvent` / `YuzoraEventTarget` クラス定義を削除し、フレームワークの `AppEvent` / `AppEventTarget` へのエイリアス（エイリアス定義、または継承・windowプロキシ）に置き換え、Yuzora固有の `YuzoraEventType` とイベントターゲット登録のみを残す。
  - **[publisher.js](file:///workspace/yuzora/yuzora/src/js/modules/publisher.js)**:
    - `Publisher` クラス定義を削除し、フレームワークの `Publisher` をエイリアス・windowプロキシ化。Yuzora特有の `Publisher` インスタンス登録処理を行う。
  - **[scene.js](file:///workspace/yuzora/yuzora/src/js/modules/scene.js)**:
    - `Scene` / `SceneDirector` クラス定義を削除し、具象シーン（`InitializeScene`, `WelcomeScene`, `ReaderScene`）がフレームワークの基底 `Scene` を継承するようにする。
  - **[yuzora.js](file:///workspace/yuzora/yuzora/src/js/modules/yuzora.js)**:
    - `boot()` メソッド内で `SceneDirector` のインスタンスを生成後、`sceneDirector.register("initialize", new InitializeScene())` 等でシーンを動的登録するよう修正。
    - `Router` インスタンス生成時にデフォルトのハッシュフォールバックとして `"welcome"` を設定。

### 4.4 ビルド設定・HTML・テストコードの更新
- **[index.html](file:///workspace/yuzora/yuzora/index.html)**:
  - `<script>` の読み込み先および順序を変更し、`src/js/frameworks/` 配下のスクリプトを `modules/` スクリプトよりも先にロードするようにします。
- **[Makefile](file:///workspace/yuzora/yuzora/Makefile)**:
  - `JS_SRCS` に新規フレームワークファイルを追加し、依存順（ベース -> モジュール -> アプリ）を維持して Closure Compiler に渡るよう順序調整します。
- **[externs.js](file:///workspace/yuzora/yuzora/src/externs.js)**:
  - クラス名の変更やエイリアスによる最適化時のプロパティ名破損を防ぐため、新規のエイリアス定義やグローバルバインド名を externs で適切に保護します。
- **[scene.test.js](file:///workspace/yuzora/yuzora/tests/unit/scene.test.js)**:
  - 単体テストの `before` でフレームワークとモジュール両方の `scene.js` をロードし、`SceneDirector` に具象シーンを明示的に登録してテストが実行されるように更新します。
- **[router.test.js](file:///workspace/yuzora/yuzora/tests/unit/router.test.js)**:
  - 単体テスト時に読み込む `router.js` のパスを `src/js/frameworks/router.js` に変更します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 設計ドキュメント（`DSN-01`, `DSN-02`）が実装内容と完全に整合していること。
- [ ] 共通フレームワークコードが `src/js/frameworks/` に正しく抽出・分離され、Yuzoraドメインと疎結合になっていること。
- [ ] `npm run lint` が警告なしで正常終了すること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) が正常にパスすること。
- [ ] `make clean && make` でのエラーなしビルド完了、および `compiled.html` / `index.html` 上での正常な書籍ロード・表示・設定適用・しおり復元が完了すること。
