---
ID: 034
種別: Refactor
優先度: Medium
ステータス: Closed
---

# [REFACTOR] Scene遷移フレームワーク（SceneDirector）の実装によるモジュール分離 (ID: 034)

## 1. 概要 / Summary

バックログ [024-implement-scene-framework.md](../backlogs/024-implement-scene-framework.md) をプロモートしたイシュー。

`viewer.js` / `commands.js` に散在する `classList.add/remove('hidden')` による画面遷移ロジックを `SceneDirector` クラスに集約し、メモリリークの防止とコードの疎結合化を実現する。

### 再現手順 / Steps to Reproduce

- 現状 `viewer.js:109-110` と `commands.js:221-222` に直接 DOM 操作が存在している

### 再現環境 / Environment

- 全環境（アーキテクチャ上の問題）

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [NEW] [src/js/modules/scene.js](../../src/js/modules/scene.js)
- [MODIFY] [src/js/modules/viewer.js](../../src/js/modules/viewer.js)
- [MODIFY] [src/js/modules/commands.js](../../src/js/modules/commands.js)
- [MODIFY] [src/js/modules/yuzora.js](../../src/js/modules/yuzora.js)
- [MODIFY] [src/externs.js](../../src/externs.js)
- [MODIFY] [Makefile](../../Makefile)
- [MODIFY] [index.html](../../index.html)
- [NEW] [tests/unit/scene.test.js](../../tests/unit/scene.test.js)
- [MODIFY] [package.json](../../package.json)

---

## 3. 実装方針 / Implementation Plan

Target Branch: `feat/034-implement-scene-director`

### ステップ 1: `src/js/modules/scene.js` の新規作成

```js
class Scene {
    enter(data) { throw new Error('enter() must be implemented'); }
    exit() { throw new Error('exit() must be implemented'); }
}
class WelcomeScene extends Scene { ... }
class ReaderScene extends Scene { ... }
class SceneDirector { transitionTo(sceneName, data) { ... } }
```

- `WelcomeScene.enter()`: welcomeScreen 表示、readerScreen 非表示
- `WelcomeScene.exit()`: welcomeScreen 非表示
- `ReaderScene.enter(data)`: displayBook() のDOM操作部分を呼び出し、readerScreen 表示
- `ReaderScene.exit()`: readerScreen 非表示
- `SceneDirector.transitionTo(sceneName, data)`: currentScene.exit() → nextScene.enter(data) の順を保証、isTransitioning フラグで二重遷移防止
- ファイル末尾で Locator に SceneDirector インスタンスを登録

### ステップ 2: `src/externs.js` への externs 追加

- `SceneInterface`（`enter(data)`, `exit()`）
- `SceneDirectorInterface`（`transitionTo(sceneName, data)`, `currentScene`, `isTransitioning`）

### ステップ 3: `src/js/modules/viewer.js` の修正（displayBook 内）

```diff
-    // Display Reader, Hide Welcome Screen
-    viewContext.welcomeScreen.classList.add('hidden');
-    viewContext.readerScreen.classList.remove('hidden');
+    // Transition to reader scene via SceneDirector
+    const sceneDirector = Yuzora.locator.resolve(SceneDirector);
+    sceneDirector.transitionTo('reader');
```

### ステップ 4: `src/js/modules/commands.js` の修正（ExitReaderCommand.execute 内）

```diff
-    viewContext.welcomeScreen.classList.remove("hidden");
-    viewContext.readerScreen.classList.add("hidden");
+    const sceneDirector = Yuzora.locator.resolve(SceneDirector);
+    sceneDirector.transitionTo('welcome');
```

### ステップ 5: `src/js/modules/yuzora.js` の修正

- `boot()` 冒頭で `SceneDirector` を Locator に登録:
  ```js
  const sceneDirector = new SceneDirector();
  this.locator.register(SceneDirector, sceneDirector);
  ```

### ステップ 6: `Makefile` と `index.html` の更新

- `Makefile`: `locator.js` 直後に `scene.js` を追加
- `index.html`: `locator.js` の `<script>` 直後に `scene.js` の `<script>` を追加

### ステップ 7: `tests/unit/scene.test.js` の新規作成

- `SceneDirector.transitionTo()` の exit() → enter() 順序を検証
- isTransitioning フラグの動作を検証
- 直接 `scene.js` ソースを読み込み Node.js 環境でテスト

### ステップ 8: `package.json` の `test:unit` スクリプトに `scene.test.js` を追加

### ステップ 9: 設計ドキュメントの更新
- `docs/DSN-02-low_level_design.md` に `Scene` 基底クラス、`WelcomeScene`、`ReaderScene`、`SceneDirector` の設計および遷移シーケンス、ライフサイクル仕様を追加する。

---

## 4. 完了条件 / Success Criteria (DoD)

- [ ] `SceneDirector.transitionTo()` 呼び出し後に `exit()` → `enter()` の順序でライフサイクルが実行されることを検証するユニットテストがパスすること。
- [ ] `viewer.js` / `commands.js` の直接 `classList` 操作（hidden）が `SceneDirector.transitionTo()` に置き換わること。
- [ ] `npm run test:unit` が全件パスすること。
- [ ] `npm run test:e2e` が全件パスすること（書籍ロード、ホーム遷移等）。
- [ ] 開発ビルド・本番ビルド（Closure Compiler ADVANCED_OPTIMIZATIONS）が警告・エラーなしで成功すること。
- [ ] 本実装が `docs/DSN-01-high_level_design.md` および `docs/DSN-02-low_level_design.md` の設計仕様と完全に一致していること（ドキュメントの陳腐化がないこと）。
- [ ] イシュー完了時に `CHANGES.md` が更新され、コミットされること。

