# Changelog / 変更履歴

All notable changes to this project will be documented in this file.
## [Unreleased]

- Reorganized the mixed unit test suite in `tests/unit/app.test.js` into separate modular test files (`yuzora.test.js`, `parser.test.js`, `locator.test.js`, `commands.test.js`, `diagnostics.test.js`, `renderer.test.js`) mapping 1-to-1 with JS source modules under `src/js/modules/` (ID: 053).
- Expanded inline tokenizer (`tokenizeInline`) in `parser.js` to automatically detect and parse Aozora Bunko rubies for kanji repeat/special symbols (`々`, `仝`, `〆`, `〇`, `ヶ`), external character note `※［＃二の字点、面区点番号1-2-22］`, and single alphabetic words without needing explicit `｜` boundaries (ID: 058).
- Verified spaces retention for alphabet group rubies (e.g. `｜Au revoir《さらば》`) and mixed character classes boundaries, and added extensive parser unit test coverage (ID: 058).
- Fixed: `nestedKanjiMatch` regex in `tokenizeInline()` was structurally broken — it searched for `《` inside `textChunk` which is always cut before `《`, so the match could never succeed. Changed to a trailing-match pattern (`/([一-龠々仝〆〇ヶ]+|[A-Za-z]+)$/`) guarded by `text[nextSpecial] === '《'`, enabling auto-ruby for kanji (e.g. `最中《さなか》`) preceded by hiragana or other non-kanji text (ID: 059).
- Updated the `test:unit` command in `package.json` to execute the new test files automatically and verified compatibility across the entire test suite (ID: 053).
- Added CSS Reset stylesheet `reset.css` to normalize default margins, paddings, box-sizing, and font defaults across browsers (ID: 054).
- Removed redundant universal reset styling from `base.css` and updated `Makefile` to prepend `reset.css` to the compiled stylesheet bundle (ID: 054).
- Improved layout boundary check logic (`findCharAtBoundary` and `runLayoutDiagnosis`) in `diagnostics.js` to strictly verify character slicing and eliminate false positive warnings on correct column breaks (ID: 055).
- Integrated layout diagnostics assertions into Playwright E2E tests (`diagnose.spec.js`) to verify layout completeness automatically without human visual inspection (ID: 055).
- Implemented `adjustPageBreaksForOverrun` self-repairing layout engine in `renderer.js` to automatically insert dynamic page breaks before paragraphs that overrun viewport/column boundaries (ID: 056).
- Hooked layout self-correction into book display (`displayBook`) and resize/settings change (`handleResize`) lifecycles, ensuring a stable, overrun-free reading view (ID: 056).
- Implemented telemetry collection and domain event (`LAYOUT_REPAIRED`) publishing on self-repair convergence in `renderer.js` (ID: 057).
- Extended the layout diagnostics report in `diagnostics.js` to include the execution passes, page breaks inserted, and duration metrics under a new section (ID: 057).
- Added visual debugging styles in `reader.css` (toggled by a `debug-active` class on document body when the debug modal is open) to display dashed boundaries and floating labels for auto-inserted page breaks (ID: 057).


- Migrated the Aozora Bunko text parser (`parser.js`) from regex-based direct string replacement to a compiler-type pipeline containing a tokenizer (`tokenizeInline`), AST parser (`parseTokensToAST`), and DFS generator (`evaluateAST`) (ID: 052).
- Resolved tag nesting issues (e.g. ruby inside bold tags) by building structural node trees and enhanced XSS mitigation by performing HTML escaping strictly inside the text leaf nodes of the evaluator, while keeping TypeScript typings and Closure Compiler checks robustly typed (ID: 052).

- Supported Aozora Bunko layout alignment rules ("chitsuki", "chiyose", and "chitage-n" alignments) in the parsing layer (`parser.js`) and implemented physical CSS styles for vertical scroll writing modes (ID: 051).
- Implemented text decorations (bold and italic inline tags) with robust XSS mitigation order (escaping before parsing tags), updated `DSN-02` design documentation, and expanded test suites for Aozora manual spec verification (ID: 051).

- Asynchronized and time-sliced the layout diagnosis process (`runLayoutDiagnosis`) using requestAnimationFrame to prevent browser tab freeze during bulk DOM dimension scans on large documents (ID: 050).
- Implemented time-sliced batch loop iteration helper (`timeSliceEach`), added intermediate progress rendering in the diagnostics textarea, and synchronized TypeScript typings and JSDoc extern annotations to Promise targets (ID: 050).

- Asynchronized and deferred the welcome screen's recommended book grid rendering using requestAnimationFrame and setTimeout to prevent initial page-load thread blocking (ID: 049).
- Enhanced safety guards during lazy rendering to check if the current active scene is still "welcome" before mutating DOM elements, and updated tests to align with async initialization (ID: 049).

- Asynchronized the persistence layer by converting all methods in `Repository`, `LocalStorageRepository`, `InMemoryRepository` and domain repositories to return Promises (ID: 048).
- Updated `ConfigModel`, `BookmarkModel`, operation command classes, application startup sequence (`yuzora.boot`), and scene transitions to handle async I/O using `async-await` (ID: 048).
- Synchronized type configurations in `types.d.ts`, Closure Compiler externs in `externs.js`, and adjusted test assertions to handle Promises in unit tests (ID: 048).

- Added `ScopedEventTarget` and `AppEventTarget.prototype.scoped` to support scoped namespace isolation of event transmission (ID: 047).
- Added Domain namespace prefixes (`document:`, `ui:`, `system:`) to `YuzoraEventType` to categorize event architecture logically (ID: 047).
- Added Event Audit Logging support in `dispatchEvent` when `window.__DEBUG_EVENT__` flag is active (ID: 047).
- Updated JSDoc type configurations, Closure Compiler externs, and unit tests to verify Scoped Event Target routing and logger output (ID: 047).

- Added CSS Variables based "CSS Theme Engine" utilizing `data-theme` attribute instead of dynamic body class names toggling to improve render reflow performance (ID: 046).
- Changed `ConfigModel.prototype.apply()` to set `data-theme` attribute on body element instead of toggling class names (ID: 046).
- Changed CSS modular stylesheets (`base.css`, `reader.css`, `debug.css`) to select color variables using attribute selectors (`body[data-theme="..."]`) (ID: 046).
- Changed E2E tests in `tests/e2e/viewer.spec.js` to assert `data-theme` attribute on theme change tests (ID: 046).

- Added `VerticalRenderer.render` secure DOM sanitization logic [NEW] utilizing `DOMParser` and whitelist-based tag/attribute stripping (Double Defense / Defense in Depth against XSS) (ID: 045).
- Changed `VerticalRenderer.render` to securely migrate DOM elements via `appendChild` loop instead of `innerHTML` assignment to prevent script execution on browser re-evaluation (ID: 045).
- Changed `src/js/modules/yuzora.js`, `src/js/types.d.ts`, and `src/externs.js` to expose `VerticalRenderer` constructor safely for testing and Closure Compiler ADVANCED_OPTIMIZATIONS compatibility (ID: 045).
- Changed `Makefile` to include `src/js/modules/renderer.js` in `JS_SRCS` compiler bundle list (ID: 045).
- Added unit tests in `tests/unit/app.test.js` to verify XSS payload sanitization of VerticalRenderer (ID: 045).
- Updated `docs/DSN-02-low_level_design.md` and `docs/threat-modeling/comprehensive-threat-modeling.md` to reflect secure DOM renderer architecture and threat mitigation updates (ID: 045).
- Added `RendererInterface` [NEW] defining common viewport rendering and layout operation methods, and updated DSN-02 (ID: 044).
- Added `VerticalRenderer` class [NEW] in `src/js/modules/renderer.js` to encapsulate vertical multi-column layout, page scroll, page navigation, and window resizing calculations (ID: 044).
- Changed `src/js/modules/viewer.js` to delegate HTML rendering, scroll position restoration, page scrolling, and resize handling to `VerticalRenderer` (ID: 044).
- Changed `src/js/modules/yuzora.js` to register `VerticalRenderer` in Locator during app initialization boot (ID: 044).
- Changed `index.html` to load `renderer.js` before `viewer.js` (ID: 044).
- Added whitelist-based parameter validation for operation command history JSON imports to prevent script injection (XSS) and Prototype Pollution (T-T3) (ID: 043).
- Added Object.prototype protection rules in `src/externs.js` for `params`, `drawerId`, and `clearType` properties to prevent advanced optimization renaming issues (ID: 043).
- Added unit tests in `tests/unit/app.test.js` to verify prototype pollution prevention and invalid parameter filtering of imported histories (ID: 043).
- Updated `docs/DSN-02-low_level_design.md` to specify detailed validation policies for command history imports (ID: 043).
- Updated `docs/threat-modeling/comprehensive-threat-modeling.md` to document threat scenario T-T3 and its mitigations (ID: 043).

- Added static type checking using TypeScript Compiler (`tsc --noEmit`) via `npm run test:types` to enforce JSDoc type correctness and integrate it into the CI pipeline (ID: 042).
- Added `src/js/types.d.ts` [NEW] declaring Yuzora system interfaces and global window variables for type resolution (ID: 042).
- Changed JSDoc annotations in frameworks and modules (`src/js/frameworks/` and `src/js/modules/`) to restore `@implements` and `@override` comments while suppressing tsc native method override error TS4121 using `// @ts-expect-error` comments (ID: 042).
- Changed `tsconfig.json` to include `src/js/types.d.ts` and exclude `src/externs.js` (ID: 042).
- Changed `src/externs.js` to declare missing model constructors and align with nullable config property of YuzoraInterface (ID: 042).

- Added Loading Placeholder / Skeleton Screen to predefined recommended books grid in the welcome screen to prevent layout shifts before JavaScript initialization (ID: 034).
- Changed `src/js/modules/ui.js` to render skeleton cards initially and asynchronously replace them with predefined cards via smooth fade-in transitions (ID: 034).
- Added a unit test suite to `tests/unit/placeholder.test.js` [NEW] to verify placeholder structure rendering and asynchronous replacement logic, and updated `package.json` to execute it (ID: 034).
- Updated HLD document `docs/DSN-01-high_level_design.md` to document the skeleton card placeholders component details (ID: 034).

- Added `src/js/modules/asset.js` [NEW] defining `Asset` and `BookAsset` structures to encapsulate resource status and immutable data (ID: 040).
- Added `src/js/modules/resource-director.js` [NEW] to manage the loading, caching, and unloading lifecycle of assets, incorporating Same-Origin validation (T-S2) and 2MB safety limit validation (T-D2) (ID: 040).
- Changed `src/js/modules/viewer.js` and session restore routing in `src/js/modules/yuzora.js` to route all book data loading operations through `ResourceDirector` (ID: 040).
- Changed `src/js/modules/commands.js` to modify `LoadBookCommand` execution to load books via `ResourceDirector` while maintaining serializability for command history (ID: 040).
- Added a unit test suite to `tests/unit/resource.test.js` [NEW] to verify caching mechanism and security validations (Spoofing & DoS limits), and updated `package.json` to execute it (ID: 040).
- Updated compile configuration in `Makefile`, script imports in `index.html`, and symbols preservation rules in `src/externs.js` for new asset modules (ID: 040).
- Updated architecture diagrams and class specifications in `docs/DSN-01-high_level_design.md` and `docs/DSN-02-low_level_design.md` (ID: 040).

- Changed `src/js/frameworks/router.js` to automatically redirect the URL path to the default route (e.g. `#/welcome`) when the application is loaded with an empty hash URI (ID: 039).
- Added a unit test to `tests/unit/router.test.js` and an assertion to `tests/e2e/viewer.spec.js` to verify URL redirection to the default welcome route (ID: 039).
- Updated low-level design document `docs/DSN-02-low_level_design.md` to document the automatic URL redirection behavior of Router (ID: 039).

- Changed `src/js/modules/ui.js` to bind the click event of the reader viewport to `toggleControls` to support tapping/clicking to show/hide control bars on mobile (ID: 038).
- Added an E2E test to `tests/e2e/viewer.spec.js` to verify tap-to-toggle header/footer controls on the reader viewport (ID: 038).
- Updated low-level design document `docs/DSN-02-low_level_design.md` to reflect viewport tap controls toggle logic (ID: 038).

- Added Generic Framework Core files (`src/js/frameworks/locator.js`, `event.js`, `publisher.js`, `scene.js`, `router.js`) to extract non-domain reusable architecture classes, and updated high-level design DSN-01 and low-level design DSN-02 (ID: 037).
- Changed Application Module files (`src/js/modules/locator.js`, `event.js`, `publisher.js`, `scene.js`, `yuzora.js`) to inherit or delegate to the frameworks classes, register concrete domain scenes, and configure default routes dynamically (ID: 037).
- Deleted duplicate/dead file `src/js/modules/router.js` from the codebase (ID: 037).
- Changed `index.html` and `Makefile` to load/compile frameworks files in dependencies order before modules files (ID: 037).
- Changed `tests/unit/scene.test.js` and `router.test.js` to align with frameworks loading and dynamic registration (ID: 037).
- Changed `src/externs.js` to declare and protect new class aliases and interfaces from Closure Compiler advanced optimizations (ID: 037).

- Added `src/js/modules/router.js` を新規作成し、URLハッシュ（ハッシュルーティング）を用いて状態管理を行う `Router` クラスを実装。パラメータ（`:book` / `:local`）やクエリパラメータの抽出に対応 (ID: 036)。
- Changed `yuzora.js` の `boot()` にて `Router` インスタンスを Locator に登録。`#/welcome` および `#/reader` ルートを登録し、`router.listen()` によるハッシュ監視を開始。リロード時の自動復元セッション検出時は `#/reader?local={name}` へリダイレクトするように変更 (ID: 036)。
- Changed `ui.js` の推奨書籍カードのクリック動作を直接の書籍ロードから `window.location.hash` の書き換えに移行 (ID: 036)。
- Changed `viewer.js` の `displayBook()` 完了時に、読み込んだ書籍の種類（推奨書籍 or ローカルファイル）に合わせて URL ハッシュを自動同期（循環防止のため `router.currentHash` を事前に設定）する処理を追加 (ID: 036)。
- Changed `commands.js` の `ExitReaderCommand` の実行ロジックを直接の SceneDirector 呼び出しから `router.navigate('/welcome')` に移行 (ID: 036)。
- Added `tests/unit/router.test.js` を新規作成し、ルート登録、パラメータ抽出（クエリパラメータ）、重複遷移防止ガード、`hashchange` イベント検知を検証する単体テストを追加し、`package.json` に登録 (ID: 036)。
- Changed `src/externs.js` に `RouterInterface` 定義を追加し、Closure Compiler ADVANCED_OPTIMIZATIONS による名前解決破壊を防止 (ID: 036)。
- Changed `Makefile` のビルドソース `JS_SRCS` および `index.html` に `router.js` を追加 (ID: 036)。

- Refactored `ui.js` の `setupEventListeners` を解体し、ウェルカム画面用の `setupWelcomeEvents` / `cleanupWelcomeEvents` と読書画面用の `setupReaderEvents` / `cleanupReaderEvents` に分割。バインドしたイベントリスナー参照を管理用配列で保持し、デタッチ時に漏れなく解除できる仕組みを導入 (ID: 035)。
- Changed `scene.js` の `WelcomeScene` および `ReaderScene` の `enter` / `exit` ライフサイクルで、画面表示切り替えに連動してそれぞれのイベントバインド・解除関数を呼び出すように変更。これにより、非アクティブ画面のイベントリスナーが完全に解除されるようになり、イベント多重登録の防止とメモリクリーンアップを標準化 (ID: 035)。
- Changed `yuzora.js` の `boot()` から起動時のオススメ書籍表示の直接DOM構築および静的な `setupEventListeners` などの呼び出しを削除し、シーンライフサイクル側に委譲 (ID: 035)。
- Changed `tests/unit/scene.test.js` に `WelcomeScene` / `ReaderScene` のライフサイクル移行時にイベントバインド・解除が正常に実行されるかを検証するユニットテストのアサーションを追加 (ID: 035)。

- Added `src/js/modules/scene.js` を新規作成し、画面状態遷移をカプセル化する Scene 遷移フレームワーク（`Scene` 基底クラス、`InitializeScene`、`WelcomeScene`、`ReaderScene`、`SceneDirector`）を実装。遷移時の二重割り込み防止のため `isTransitioning` ガードフラグを導入 (ID: 034)。
- Refactored `WelcomeScene` および `ReaderScene` が自分以外のDOM要素を操作しないよう責務を分離。起動時に画面全体のDOM要素表示状態を一括リセットする `InitializeScene` を導入 (ID: 034)。
- Changed `yuzora.js` の `boot()` で `SceneDirector` インスタンスを Locator に登録し、初期化時 `initialize` に遷移後、`welcome` に遷移するよう変更 (ID: 034)。
- Changed `viewer.js` の `displayBook()` において直接 `classList` を操作していた画面遷移ロジックを `SceneDirector.transitionTo('reader')` に移行 (ID: 034)。
- Changed `commands.js` の `ExitReaderCommand` において直接 `classList` を操作していた画面遷移ロジックを `SceneDirector.transitionTo('welcome')` に移行 (ID: 034)。
- Added `tests/unit/scene.test.js` を新規作成し、`SceneDirector` の `initialize` -> `welcome` -> `reader` 遷移ライフサイクル順序、および多重遷移防止ガードの動作を検証するユニットテストを追加 (ID: 034)。
- Changed `src/externs.js` に `SceneInterface` および `SceneDirectorInterface` 定義を追加し、Closure Compiler ADVANCED_OPTIMIZATIONS による名前解決 of 破壊を防止 (ID: 034)。
- Changed `Makefile` のビルドソース `JS_SRCS` および `index.html` に `scene.js` を追加 (ID: 034)。
- Changed `package.json` の `test:unit` スクリプトの実行対象ファイルに `scene.test.js` を追加 (ID: 034)。
- Documentation `docs/DSN-02-low_level_design.md` を更新し、`Scene`、`InitializeScene` および `SceneDirector` クラスの設計仕様と、画面遷移ライフサイクルシーケンスを追加 (ID: 034)。

- Fixed E2Eテスト `should navigate forward and backward using touch swipe gestures in RTL mode` が `page.dispatchEvent()` による Touch イベントシミュレーションの限界でページ遷移を検出できなかった問題を修正。`hasTouch: true` ブラウザコンテキストと CDP `Input.dispatchTouchEvent` を使用することで、正確なタッチイベントをシミュレートし、テストを安定化した (ID: 002)。
- Fixed `index.html` の開発用スクリプト読み込みに `repository.js` が欠落していた問題を修正 (ID: 002)。
- Added ページナビゲーション動作（`scrollLeft`、`reading-index`、`overflowX`）を診断するためのデバッグ用E2Eテスト `tests/e2e/db6.spec.js` を追加 (ID: 002)。
- Fixed GitHub Actions `Deploy static content to Pages` ワークフロー (`static.yml`) で `make` 実行時に `eslint: not found` エラーが発生する問題を修正。`run: make` を `run: make main-min.js src/css/style.css` に変更し、lint は `ci.yml` に委譲することで `npm install` なしで動作するようにした (ID: 033)。

- Added `src/js/modules/repository.js` を新規作成し、ストレージ抽象化のための Repository パターンを導入。`Repository` 抽象基底クラス、`LocalStorageRepository`（`localStorage` バックエンド）、`InMemoryRepository`（テスト・モック用 `Map` バックエンド）を実装 (ID: 032)。
- Added ドメインリポジトリとして `SettingsRepository`（`yuzora_config` キーを管理）、`BookmarkRepository`（`bookmark_` プレフィックスキーを管理）、`SessionRepository`（`last_read_file_*` キーを管理）を実装し、ストレージキーのマジックストリングをカプセル化 (ID: 032)。
- Changed `config.js` の `ConfigModel.load()`, `ConfigModel.save()`, `BookmarkModel.load()`, `BookmarkModel.save()` を `SettingsRepository` / `BookmarkRepository` 経由に移行し、`localStorage` への直接参照を排除 (ID: 032)。
- Changed `viewer.js` の `displayBook()`, `checkLastSession()` を `BookmarkRepository` 経由に移行し、`localStorage` への直接参照を排除 (ID: 032)。
- Changed `commands.js` の `ExitReaderCommand`, `ClearStorageCommand` を `SessionRepository`, `BookmarkRepository`, `SettingsRepository` 経由に移行し、`localStorage` への直接参照を排除 (ID: 032)。
- Changed `yuzora.js` の `boot()` 内のセッション復元処理を `SessionRepository` 経由に移行し、`localStorage` への直接参照を排除 (ID: 032)。
- Added `src/externs.js` に `RepositoryInterface`, `SettingsRepositoryInterface`, `BookmarkRepositoryInterface`, `SessionRepositoryInterface` のインターフェース定義および `Object.prototype` プロパティ保護定義を追加し、ADVANCED_OPTIMIZATIONS でのリネームを防止 (ID: 032)。
- Added `tests/unit/repository.test.js` を新規作成し、`InMemoryRepository`、`SettingsRepository`、`BookmarkRepository`、`SessionRepository` の CRUD、境界値、エラーハンドリング、差し替え可能性を検証する26件のユニットテストを追加 (ID: 032)。
- Changed `Makefile` のビルドチェーンに `repository.js` を追加（`locator.js` の直後）(ID: 032)。
- Changed `package.json` の `test:unit` スクリプトに `repository.test.js` を追加 (ID: 032)。

- Changed 各モジュールにおけるイベントハンドラの登録・発火を `yuzora.publisher` 経由に統一し、依存関係の解決を `Yuzora.locator` 経由で行うようにグローバルプレフィックス（`window.locator`）をクリーンアップ (ID: 031)。
- Changed `externs.js` に `YuzoraInterface.prototype.publisher` および `Function.prototype.locator` の定義を追加し、アドバンスドコンパイルでのプロパティ名破損および collapsing を防止 (ID: 031)。

- Added 状態更新やデータ同期の疎結合な通知配信フローを実現するため、`YuzoraEventTarget` を内包した `Publisher` クラスによる Publish/Subscribe パターンを導入 (ID: 030)。
- Changed `Makefile` および `index.html` に `src/js/modules/publisher.js` を追加し、ビルド定義および開発用スクリプト読み込みへの統合を完了 (ID: 030)。
- Added `tests/unit/event.test.js` に `Publisher` の購読、配信、二重登録防止、および同一リスナーの複数トピック独立動作を検証する単体テストを追加 (ID: 030)。

- Fixed ESLint循環的複雑度（Cyclomatic Complexity）の制限値超過を解消するため、`ConfigModel.load`、`handleDebugKeyboardShortcuts`、および `setupDrawerControls` を複数のヘルパーメソッド・関数にリファクタリング・分割 (ID: 029)。
- Added ビルド前に静的検証が必ず実行されるよう、`Makefile` に `lint` ターゲットを追加し、`all` ターゲットの依存関係に設定 (ID: 029)。

- Added イベント識別子の型安全性を高めるため、15種類のドメインイベント種別をカプセル化した定数オブジェクト `YuzoraEventType` を `event.js` に追加 (ID: 028)。
- Changed `commands.js`, `viewer.js`, `ui.js` 内のマジックストリングによるイベントの通知・購読を、`YuzoraEventType` 定数参照へと全面的に移行 (ID: 028)。
- Changed コマンド実行層とUI層のデカップリングのため、`CommandHistory` 内の直接的なテキストエリア更新を廃止し、操作履歴の変更を `HISTORY_UPDATED` イベント経由でUIに通知する方式に変更 (ID: 028)。
- Documentation `DSN-02-low_level_design.md` を更新し、`YuzoraEventType` の詳細仕様および全15イベントのペイロード・ライフサイクル表を追加 (ID: 028)。

- Added クラス設計の統合のため、`BookModel`（データ）、`ConfigModel`（表示設定）、`BookmarkModel`（しおり・進捗）の各ドメインモデルクラスを追加 (ID: 027)。
- Changed レガシーな `AppState` クラスおよび `window` 上のグローバル互換用プロキシ定義を完全に削除し、`ViewContext` はUI要素の参照と一時状態のみを管理するようにリファクタリング (ID: 027)。
- Changed `ui.js`, `viewer.js`, `commands.js`, `diagnostics.js`, `parser.js` 内のプロキシ経由のグローバルアクセスを、サービスロケーターから直接解決したモデルオブジェクトのプロパティ参照へと全面的に移行 (ID: 027)。
- Changed `tools/externs.js` に `ViewContextInterface` の全DOM要素および設定関連プロパティ定義を追加し、アドバンスドコンパイルでのプロパティ名破損を完全に防止 (ID: 027)。
- Documentation `DSN-02-low_level_design.md` を更新し、`AppState` からドメインモデル/コンテキスト分離アーキテクチャへの更新、およびクラス設計仕様を追記 (ID: 027)。

- Added イベント駆動型アーキテクチャを実現するため、`src/js/modules/event.js` を新設し、`YuzoraEvent` および `YuzoraEventTarget` クラスによるカスタムイベントバスを導入 (ID: 026)。
- Changed `Makefile` および `index.html` に `src/js/modules/event.js` を追加し、本番難読化ビルドおよび開発時動作への統合を完了 (ID: 026)。
- Changed `commands.js` をリファクタリングし、`LoadBookCommand`、`NavigatePageCommand`、`ToggleDebugModalCommand` の実行時にUIやビューアーの関数を直接呼ぶ代わりに `YuzoraEventTarget` を通じたイベント（`book-loaded`、`navigate-page`、`toggle-debug-modal`）のディスパッチへと変更 (ID: 026)。
- Changed `viewer.js` をリファクタリングし、`book-loaded` および `navigate-page` イベントを監視して処理をトリガーするとともに、書籍レンダリング完了時に `book-rendered` イベントをディスパッチするようにデカップリング (ID: 026)。
- Changed `ui.js` をリファクタリングし、`book-rendered` および `toggle-debug-modal` イベントを監視してヘッダー表示や目次オブザーバー設定などのUI処理を実行するように結合を解消 (ID: 026)。
- Added `tools/externs.js` に `YuzoraEventInterface` および `YuzoraEventTargetInterface` を追加し、アドバンスドコンパイルでのプロパティ名破壊を防止 (ID: 026)。
- Added `tests/unit/event.test.js` にイベント駆動の動作を検証する単体テストを追加し、`package.json` の `test:unit` スクリプトへ登録 (ID: 026)。
- Documentation `DSN-01-high_level_design.md` および `DSN-02-low_level_design.md` を更新し、イベント駆動型アーキテクチャの基本概念および詳細インターフェース仕様を追記 (ID: 026)。
- Changed `Makefile` で Closure Compiler のコンパイルレベルを `ADVANCED_OPTIMIZATIONS` に引き上げ、警告をすべてエラー化 (`--jscomp_error=*`)、および `ECMASCRIPT_NEXT`・`--strict_mode_input=true` を適用 (ID: 025)。
- Changed `tools/externs.js` に `LocatorInterface`, `CommandInterface`, `CommandManagerInterface` および `AppState` 内の全プロキシプロパティ定義を追加し、アドバンスドコンパイルによる名前解決の破壊とプロパティ名短縮を防止 (ID: 025)。
- Changed `commands.js`, `locator.js` をリファクタリングして上記インターフェースの JSDoc `@implements` およびメソッド `@override` 記述を適用 (ID: 025)。
- Changed `ui.js` 内で `window.Yuzora` APIを文字列リテラルキーによって露出し、コンパイル後のテスト実行時における名前解決エラーを解消 (ID: 025)。
- Added `Makefile` に Closure Compiler の詳細警告設定（`--warning_level VERBOSE`）および各種厳格化オプションを追加し、グローバルプロキシ用の externs 宣言ファイルを新設 (ID: 024)。
- Refactor 全JavaScriptソースファイル（`src/js/modules/*.js`）の先頭行に `"use strict";` （厳格モード）を適用 (ID: 023)。
- Added タッチデバイス向けのスワイプジェスチャーによるページ送り機能を追加 (`ui.js`) (ID: 022)。
- Fixed 右から左（RTL）送り設定時に、画面右側のナビゲーションエリアをクリック/タップしても前のページに戻らない off-by-one 計算バグを、`scrollToPage` への呼び出し共通化により解消 (`commands.js`) (ID: 022)。
- Added RTL時のクリック/タップおよびタッチスワイプでの正確なページ遷移を検証するE2E自動テストを追加 (`viewer.spec.js`) (ID: 022)。

- Added `locator.js` を新規作成し、依存解決のための Service Locator パターンを導入 (ID: 019)。
- Added `locator.js` の動作を検証する単体テストを追加 (ID: 019)。
- Changed `config.js` 内に `AppState` クラスを定義し、従来グローバルだった状態変数およびDOM要素参照群をすべてクラス内にカプセル化 (ID: 019)。
- Changed `config.js` 末尾において `Object.defineProperty` を用い、レガシーグローバル変数アクセスおよびDOM参照を `AppState` にルーティングするプロキシゲッター/セッターを定義して互換性を維持 (ID: 019)。
- Changed `commands.js`, `parser.js`, `viewer.js`, `ui.js` 内の直接的なグローバル状態アクセスを、`window.locator.resolve(AppState)` を介したアクセスへとリファクタリング (ID: 019)。
- Documentation `DSN-02-low_level_design.md` のセクション 1 に Service Locator パターン、`AppState` クラス、およびプロキシラッパーの設計物理仕様を追記 (ID: 019)。

- Fixed `jumpToHeading` 実行直後に `IntersectionObserver` コールバックが `activeHeadingId` を文書順先頭見出しに上書きしてしまうレースコンディションを修正。`jumpLockUntil` タイムスタンプを導入し、ジャンプ後 800ms 間はオブザーバーによる上書きをブロックするよう変更 (`ui.js`)。
- Fixed `buildTOCList` の非同期チャンクレンダリング完了前に `updateActiveTOCItemUI` が呼ばれていた問題を修正。`renderChunk` の最終フレーム完了後にのみ `updateActiveTOCItemUI` を呼ぶよう変更し、TOC 再表示時にアクティブ見出しが正しくハイライトされるようになった (`ui.js`, `commands.js`)。

- Added 非同期の IntersectionObserver を用いたアクティブ見出し判定、および requestAnimationFrame を用いた目次リストのチャンク（遅延）描画による目次描画の高速化とレイアウトスラッシングの解消 (ID: 020)。
- Added UI操作（メニュー切り替え、設定・目次ドロワー開閉、デバッグ画面開閉、ホーム遷移、キャッシュクリア等）をCommandパターンによる操作履歴の記録・再現対象に追加 (ID: 019)。
- Fixed デバッグ画面において、「レイアウト診断」タブをクリックまたはキーボードの `2` を押下した際、表示が切り替わらない不具合を修正 (ID: 018)。
- Fixed キーボードの上矢印キー（`ArrowUp`）および下矢印キー（`ArrowDown`）押下時に、読書画面のメニュー（ヘッダー・フッター）表示状態（トグル）が切り替わらない不具合を修正。ブラウザのスクロール等のデフォルト動作も抑制 (ID: 017)。
- Changed 巨大なモノリスとなっていた JavaScript (`app.js`) および CSS (`style.css`) を画面/機能ごとのモジュールファイル (`src/js/modules/*.js`, `src/css/modules/*.css`) に完全分割 (ID: 016)。
- Changed `Makefile` にビルドルールを追加し、モジュール CSS の結合による `style.css` 生成、および依存順序を考慮したモジュール JS の Closure Compiler による `main-min.js` 難読化・軽量化ビルドを自動化 (ID: 016)。
- Changed 開発用 HTML (`index.html`) では機能モジュールファイルを直接個別ロードし、デプロイ・本番用 HTML (`compiled.html`) では結合・難読化後のビルドアセット（`style.css`, `main-min.js`）をロードするように分離 (ID: 016)。
- Changed 分割された JS モジュールの `JSDOM` ユニットテストを正常に継続するため、`app.test.js` 内で読み込むコード対象を結合後の `main-min.js` に修正 (ID: 016)。

- Fixed E2E テスト (`tests/e2e/diagnose.spec.js`) において、スクリーンショットの出力先パスにエージェント環境専用の絶対パスがハードコードされていたため、環境変数 `ARTIFACTS_DIR` またはプロジェクト直下の相対パス `./test-results` を動的に使用するよう修正。また、書き込み前に出力先ディレクトリを自動作成するようにし、GitHub Actions CI 上での `EACCES: permission denied` エラーを解消 (ID: 015)。

- Fixed プリデファインド本（オススメ書籍）が UTF-8 でエンコードされているため、`loadPredefinedBook` でデコードする際に UTF-8 を第一優先でデコードするように修正し、コンソールでの Shift_JIS デコード失敗警告ログを解消 (ID: 014)。

- Added GitHub Actions の CI ワークフローファイル (`.github/workflows/ci.yml`) を新規作成し、全ブランチへの push および main への PR で lint・ユニットテスト・E2E テスト・makeビルドを自動実行するよう設定 (ID: 013)。
- Changed GitHub Pages へのデプロイワークフローファイル (`.github/workflows/static.yml`) を拡張し、CI ワークフローの成功に依存させて自動デプロイするよう変更。また、デプロイ直前に `make` を実行して `main-min.js` を成果物に含めるよう追加 (ID: 013)。
- Changed Playwright の E2E テスト (`tests/e2e/viewer.spec.js` および `tests/e2e/diagnose.spec.js`) において、外部 Web フォントのネットワーク要求をインターセプトしてブロックする処理を追加し、サンドボックス環境でのネットワーク遅延によるタイムアウトを解消してテスト実行を高速化・安定化 (ID: 013)。

- Added ESLint (v9) を `devDependencies` に追加し、`eslint.config.js`（Flat Config）で `complexity: ['error', 10]` ルールを設定。`npm run lint` スクリプトを `package.json` に追加し、テストパイプラインに統合 (ID: 012)。
- Changed `app.js` のサイクロマティック複雑度（閾値 10 超）を検出し、以下のリファクタリングを実施。`CommandManager.add()` → `isDuplicateCommand()` / `limitHistorySize()`, `runLayoutDiagnosis()` → `diagnoseEnvironmentInfo()` / `diagnoseColumnsInfo()` / `diagnoseColumnWidthCheck()` / `diagnoseVerticalLayoutInfo()` / `diagnoseParagraphCoordinateInfo()` / `diagnoseBoundaryOverlap()`, `parseAozoraText()` → `buildLineHTML()` / `detectHeaderEnd()` / `parseJisage()` / `parseHeading()`, `sanitizeDOM()` → `cleanAttributes()` ヘルパー抽出、`handleOpenDebugModalKeys()` → `handleDebugTabKeys()` 抽出 (ID: 012)。
- Fixed `setupEventListeners()` の閉じブレースが欠落していた構文エラーを修正し、`closeDebugModal()` を独立した関数として外部定義 (ID: 012)。
- Documentation ADR-02 を `Proposed → Accepted` に更新し、実装結果（対象箇所・例外適用 6 箇所を含む）を記録 (ID: 012)。

- Added Google Closure Compiler (v20240317) の導入およびビルド自動化のための Makefile の新規作成 (ID: 011).
- Added ビルドされた JavaScript ファイル（`main-min.js`）をロードしてリリース検証を行うための html（`compiled.html`）を index.html から複製して追加 (ID: 011).
- Changed 環境変数 `TEST_PATH` に基づいてE2Eテスト実行対象のHTMLを動的に切り替えられるように、Playwrightテストスクリプト（`tests/e2e/viewer.spec.js` および `tests/e2e/diagnose.spec.js`）を拡張 (ID: 011).
- Changed 基本設計書 [DSN-01](file:///workspace/yuzora/yuzora/docs/DSN-01-high_level_design.md) を更新し、表示レイヤーおよび制御レイヤーのコンポーネント役割テーブルに `compiled.html` および `main-min.js` の説明を追記 (ID: 011).

- Changed デバッグモーダルウィンドウ（`#debug-modal`）について、カード風の丸角や枠線、半透明オーバーレイといったウィンドウらしさを美しく残したまま、サイズを大部分（最大横幅 1200px / 最大高さ 90vh）をカバーする広さへと拡大表示化。操作履歴 JSON やレイアウト診断結果テキストエリアもウィンドウ全体の伸縮に合わせて自動で縦に引き伸ばされるよう Flexbox 設定を調整し、デバッグの一覧性を最大化 (ID: 010 - Issue)。
- Changed [DSN-01]（基本設計書）のデバッグモーダルコンポーネント構成仕様を、大部分カバーする広幅ウィンドウのサイズ拡張方針に合わせて同期更新 (ID: 010 - Issue)。

- Fixed 目次（TOC）ジャンプ先がRTL縦書き時に微小にずれる（および画面の左側に寄ってしまう）問題を解消。見出し要素の物理的な開始端と終了端（`left` と `right`）から算出した「要素の中心絶対座標（Horizontal Center）」を基準にジャンプ先論理ページを計算するようにし、マージンや字下げ、ブラウザのカラム回り込みに伴う境界判定の誤作動を完全に防止 (ID: 008 - Issue)。
- Changed [DSN-02]（詳細設計書）に、RTL縦書きおよびLTR表示時における見出し要素物理中心から遷移先ページを決定する絶対座標の数学的アルゴリズム（Section 7.4）を追記 (ID: 008 - Issue)。

- Added [MNG-09] ユーザー操作履歴を Command パターンとして抽象化し、シリアライズ可能にする実装を完了 (ID: 009 - Issue)。
- Added デバッグ画面の「システム状態」タブ内に、操作履歴JSONを表示・編集できるテキストエリアおよび履歴のエクスポート/リプレイ機能（ボタンコントロール等）を実装 (ID: 009 - Issue)。
- Changed デバッグモーダルが開いている状態でのキーボードショートカット `c` / `C` コピーキーの挙動を、アクティブなタブ（システム状態 vs レイアウト診断）に応じて動的にコピー対象（履歴JSON vs 診断レポートMarkdown）を切り替えるよう共通化 (ID: 009 - Issue)。
- Changed `CommandManager` に最大履歴100世代までの制限と FIFO 破棄、および先頭の `LoadBookCommand` 固定的保護（初期ロードデータ保護）ロジックを実装 (ID: 009 - Issue)。
- Changed 履歴インポート時の構文エラーや不正配列に対する `try-catch` 例外処理・警告ダイアロックフォールバックによるセキュリティと堅牢性の向上 (ID: 009 - Issue)。
- Fixed `LoadBookCommand.execute()` にて、ファイル名描画には `textContent` を用い、本文表示時には Aozora HTML パースとサニタイズ処理を強制適用することでインポート履歴からのXSS脆弱性を完全に防止 (ID: 009 - Issue)。
- Added `tests/unit/app.test.js` に `CommandManager` の 100世代制限、FIFO＆LoadBook保護、JSONシリアライズ、例外捕捉エラーハンドリング等の自動ユニットテストを追加し、すべて正常パスを確認 (ID: 009 - Issue)。

- Added [MNG-09] バックログ 012 から、ユーザー操作履歴の Command パターン化実装用タスクとして [Issue 009](docs/issues/009-command-pattern-operation-history.md) を起票し、詳細な実装方針および DoD の精査（In Progress）を完了。
- Changed [MNG-09] 目次表示およびジャンプ機能 (TOC) バックログ (docs/backlogs/closed/005-table-of-contents-toc.md) を、実装完了に伴い Closed に更新し、アーカイブディレクトリへ移動。
- Added [MNG-09] 目次ドロワーのキーボード・スクリーンリーダー向けアクセシビリティ向上バックログ (docs/backlogs/013-toc-accessibility-enhancement.md) を起票 (ID: 013)。
- Changed [MNG-09] Commandパターンによるユーザー操作履歴の抽象化とデバッグ用シリアライズ対応バックログ (docs/backlogs/012-command-pattern-operation-history.md) を精査し、最大世代数制限（100世代および本のロードコマンド保護）を追加して Approved に更新 (ID: 012)。
- Added [MNG-09] 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化バックログ (docs/backlogs/011-modularize-src-by-screen-and-bundle.md) を起票 (ID: 011)。
- Added [MNG-09] 大容量テキストのインクリメンタルパースおよびレンダリングバックログ (docs/backlogs/007-incremental-text-parsing.md) を起票 (ID: 007)。
- Added [MNG-09] レイアウト診断レポート生成の非同期・タイムスライス化バックログ (docs/backlogs/008-async-layout-diagnostics.md) を起票 (ID: 008)。
- Added [MNG-09] しおり書き込み処理の非同期アイドル実行化バックログ (docs/backlogs/009-async-bookmark-storage.md) を起票 (ID: 009)。
- Added [MNG-09] 起動時オススメ書籍グリッドの遅延レンダリングバックログ (docs/backlogs/010-lazy-loading-predefined-books.md) を起票 (ID: 010)。
- Changed [MNG-09] 非同期処理による目次抽出および描画の高速化バックログ (docs/backlogs/006-async-toc-generation.md) を精査し、ステータスを Approved に更新 (ID: 006)。
- Added 目次表示およびジャンプ機能 (TOC) のUI（目次ボタンおよび目次ドロワー）を追加 (ID: 005 - Backlog)。
- Changed 見出しの階層レベルに応じたインデントと視覚表現（中見出し・小見出しの箇条書きマーク）の追加 (ID: 005 - Backlog)。
- Changed RTL縦書き表示時のマルチカラムスクロール座標系に対応した精密な見出しジャンプ計算ロジック（`getBoundingClientRect()` 基準）を実装 (ID: 005 - Backlog)。
- Changed スムーズスクロール完了後に `preventScroll` オプション付きでジャンプ先見出し要素へフォーカス（`focus()`）を当てるアクセシビリティ向上制御を導入 (ID: 005 - Backlog)。
- Fixed `index.html` 内のインライン `style="..."` 属性をすべて `src/css/style.css` のクラス定義へ移行し、Content Security Policy (style-src 'self') の違反警告を完全に解消 (ID: 005 - Backlog)。
- Fixed ユニットテストランナー実行時に、残存する JSDOM タイマーが原因でテストプロセスが終了せずハングする問題を `app.test.js` に `process.exit(0)` を追加することで解消 (ID: 005 - Backlog)。
- Changed [MNG-09] 目次表示およびジャンプ機能 (TOC) のバックログ要件 (docs/backlogs/005-table-of-contents-toc.md) を精査し、ステータスを Approved に更新 (ID: 007)。
- Changed エージェント行動規範 (.agents/AGENTS.md) に、新スキル (create-backlog, polish-backlog) によるバックログ管理ルールを追記 (ID: 007)。
- Changed ドキュメント構成の拡張に伴い、docs/README.md およびルートの README.md のディレクトリ構造記述を更新 (ID: 007)。
- Changed [MNG-02] 開発プロセスドキュメント (docs/MNG-02-development_process.md) に、新スキル (create-backlog, polish-backlog) とドキュメント (MNG-09) の三位一体対応セクションを追記し、関係性を整理 (ID: 007)。
- Added [MNG-09] バックログ精査用スキル (.agents/skills/polish-backlog/SKILL.md) を新設 (ID: 007)。
- Added [MNG-09] バックログ管理をマルチファイル構造（docs/backlogs/*.md および docs/backlogs/README.md）に移行し、MNG-01 ドキュメント台帳を更新 (ID: 007)。
- Changed [MNG-09] create-backlog スキルを個別バックログファイルの自動生成および台帳追記手順に更新 (ID: 007)。
- Added [MNG-09] バックログ登録用スキル (.agents/skills/create-backlog/SKILL.md) を新設 (ID: 007)。
- Added [MNG-09] 目次表示およびジャンプ機能 (TOC) をバックログ (BACKLOG-005) に登録 (ID: 007)。
- Fixed [T-I1] Content Security Policy (CSP) メタタグを index.html に導入し、外部へのコネクション制限 (connect-src 'self') および不要なリソース取得を制限して情報漏洩を防止 (ID: 007)。

- Fixed [T-E2] HTMLファイル読み込み時のXSS脆弱性の解消。ホワイトリスト方式のHTMLサニタイズ処理 (sanitizeDOM) を実装し、危険なタグやイベントハンドラを除去するように改善 (ID: 006)。
- Changed ドキュメント内のファイルリンクにおいて環境依存の絶対パスを禁止し、相対パスの使用を義務付けるルールを docs/MNG-02-development_process.md および .agents/AGENTS.md に追加 (ID: 006)。

- Fixed [T-E1] parseAozoraText の開始時にHTML特殊文字を一括エスケープし、タイトルや著者メタデータ等も含めたXSS脆弱性を解消 (ID: 005)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) に、システムデータフロー図 (DFD) および STRIDE詳細脅威分析結果シートを追記 (ID: 004)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) および脅威モデリング実行スキル (.agents/skills/threat-modeling/SKILL.md) を新設 (ID: 003)。
- Changed 開発哲学・マニフェスト (MNG-00) に「セキュリティ・バイ・デザイン」および「セキュア・バイ・デフォルト」を核心原則として追加 (ID: 003)。
- Changed 開発プロセス、問題管理、変更管理ドキュメント (MNG-02〜04) および既存スキル (polish-issue, review-diff-code) を脅威モデリングプロセスに適合するよう改定 (ID: 003)。
- Changed ドキュメント (MNG-01〜MNG-04) およびスキル (.agents/skills/*) を `MNG-00` に適合させ、三位一体モデルやドキュメント駆動開発の追跡性を強化 (ID: 002)。
- Fixed `docs/MNG-02-development_process.md` 内の文字コード崩れをクレンジング修復 (ID: 002)。
- Added [MNG-00] 開発哲学・マニフェスト (`docs/MNG-00-development_philosophy.md`) を新設し、プロダクト理念、UI/UX設計思想、運用統制の管理策、および三位一体連携モデルを集約。
- Added [MNG-09] バックログ管理プロセス定義書 (`docs/MNG-09-backlog_process.md`) を新設し、将来の要望やロードマップのプールを分離。
- Added [MNG-06] Active Issues台帳 (`docs/issues/README.md`) を新設し、現在進行中のオープンな課題を一元追跡。
- Added 完了（Closed）したIssueチケットを `docs/issues/closed/` に移動するアーカイブ規則を導入。
- Changed `create-issue`, `polish-issue`, `git-workflow` の各スキル手順書を更新し、メタデータブロックによるステータス（Open/Closed）の明示管理および台帳・移動ワークフローとの連携を組み込み。
- Changed [MNG-01] (文書台帳) および [MNG-02] (開発プロセス) から散らばっていた哲学解説をカットし、`MNG-00` への参照リンクへ一元・簡素化。
- Changed 既存の `docs/issues/001-page-left-right-overrun.md` のフォーマットを新バグテンプレートへ追従。
- Changed `src/css/style.css` のカラム幅（`column-width`）の計算式を `vw` ベースに修正し、端数計算誤差によるカラムズレを解消 (ID: 001)。
- Added テストキャプチャ自動化用の E2E 検証スクリプト (`tests/e2e/diagnose.spec.js`) をリポジトリに追加。
