---
ID: 035
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] SceneライフサイクルによるUI初期化・クリーンアップ処理の定義 (ID: 035)

## 1. 概要 / Summary

バックログ [031-scene-lifecycle-ui-initialization-cleanup.md](../backlogs/closed/031-scene-lifecycle-ui-initialization-cleanup.md) をプロモートしたイシュー。

現在、`yuzora.js` の `boot()`, `setupEventListeners()`, `setupDrawerControls()` および `ui.js` / `viewer.js` 内に散在している画面要素の初期表示構築、イベントリスナーの登録処理を、Sceneフレームワークの `Scene.enter()` に集約します。
また、シーンの終了時にメモリリークを防ぐため、登録したイベントリスナーを `Scene.exit()` で確実にデタッチするクリーンアップ構造を導入します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [MODIFY] [`src/js/modules/scene.js`](../../src/js/modules/scene.js) — `WelcomeScene`、`ReaderScene` でのUI構築・イベントバインディング・クリーンアップの実装
- [MODIFY] [`src/js/modules/yuzora.js`](../../src/js/modules/yuzora.js) — イベントリスナー登録・オススメ書籍カード生成のSceneへの委譲
- [MODIFY] [`src/js/modules/ui.js`](../../src/js/modules/ui.js) — イベントリスナー定義の整理とScene連携化
- [MODIFY] [`src/js/modules/viewer.js`](../../src/js/modules/viewer.js) — ビューアー特有のイベント（スクロールハンドラ等）の `ReaderScene` への移行
- [MODIFY] [`tests/unit/scene.test.js`](../../tests/unit/scene.test.js) — イベントリスナーのデタッチおよび多重バインド防止のユニットテスト追加
- [MODIFY] [`docs/DSN-02-low_level_design.md`](../../docs/DSN-02-low_level_design.md) — ライフサイクルのイベント管理・メモリリーク防止仕様の追記

---

## 3. 実装方針 / Implementation Plan

Target Branch: `feat/035-scene-lifecycle-ui-initialization-cleanup`

### ステップ 1: `scene.js` におけるイベント参照の保持とバインド
- `WelcomeScene`：
  - アプリ起動時のオススメ書籍グリッド生成処理（`yuzora.js` 内の `PREDEFINED_BOOKS` 描画）を `enter()` へ移送。
  - `#drop-zone` に対するドラッグ＆ドロップイベント、および `#file-input` に対するファイル選択ハンドラを `enter()` でバインド。
  - イベント登録したハンドラ関数の参照を `WelcomeScene` のプロパティに保持。
  - `exit()` が実行されたら、保持しているハンドラ参照を用いて `removeEventListener` を実行。

- `ReaderScene`：
  - `viewer.js` / `ui.js` でバインドされていた以下のリスナー登録を `enter()` に集約：
    - ウィンドウリサイズハンドラ、スクロールハンドラ (`handleScroll`)
    - 設定/目次の各ドロワーのトグル制御ボタン (`#btn-back`, `#btn-toc`, `#btn-settings`, `#btn-first-page`)
    - キーボードショートカットイベント
    - `tocObserver` (IntersectionObserver) の生成と監視開始
  - 登録したリスナー関数やオブザーバーのインスタンスを `ReaderScene` のプロパティに保持。
  - `exit()` が実行されたら、全てのリスナーを `removeEventListener` でデタッチし、IntersectionObserver は `disconnect()` を実行。

### ステップ 2: `yuzora.js` および `ui.js` / `viewer.js` の整理
- `yuzora.js` 内で起動時に直接行っていたオススメ書籍カードのイベント登録、および `setupEventListeners()` / `setupDrawerControls()` 内の各DOMイベントバインドを削除。
- `viewer.js` および `ui.js` のグローバルや `DOMContentLoaded` 契機で行っていたリスナー登録を整理し、Scene側のライフサイクルメソッド呼び出しに合わせる。

### ステップ 3: ユニットテストの強化 (`scene.test.js`)
- `WelcomeScene` / `ReaderScene` への遷移（`transitionTo`）を実行した際、リスナー登録が適切に行われ、かつ逆方向に遷移した際に全てのリスナーが `removeEventListener` によって削除されることを検証するテストケースを実装。
- 多重遷移が行われても、リスナーの二重バインドが発生しないことを保証するアサーションを追加。

### ステップ 4: 設計ドキュメントの更新
- `docs/DSN-02-low_level_design.md` に各Sceneが担当するUIライフサイクル（イベントハンドラおよびクリーンアップ）の物理設計を追記。

---

## 4. 完了条件 / Success Criteria (DoD)

- [ ] `WelcomeScene` から退出する際、オススメ本カードやドラッグ＆ドロップ関連のイベントハンドラがすべてデタッチされること。
- [ ] `ReaderScene` から退出する際（`ExitReaderCommand` 等によるウェルカム画面への遷移時）、スクロールハンドラ、キーボードショートカット、ドロワー開閉、戻るボタン等の全てのイベントリスナーが漏れなく解除されること。
- [ ] 遷移を繰り返した際にイベントハンドラの多重登録やイベントの二重発火（二重ジャンプや二重ロード等）が起きないこと。
- [ ] `npm run test:unit` が全件パスすること。
- [ ] `npm run test:e2e` が全件パスすること。
- [ ] 実装が `docs/DSN-01-high_level_design.md` および `docs/DSN-02-low_level_design.md` と完全に一致していること。
