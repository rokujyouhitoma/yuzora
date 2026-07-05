---
ID: 024
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] Scene遷移（画面遷移）フレームワークの実装によるモジュール分離 (ID: 024)

## 1. 概要 / Summary

Yuzora の画面状態（ウェルカム画面 `welcome-screen` と読書画面 `reader-screen`）の切り替えや、初期表示・書籍読み込みなどの一連の画面フロー制御を標準化し疎結合にするため、Scene フレームワークを導入します。

各画面を `WelcomeScene`、`ReaderScene` などのクラスとして定義し、画面のアクティブ化・非アクティブ化、リソース解放（イベントリスナーのデタッチ）、およびシーン遷移の順序保証を `SceneDirector` が一元制御します。

現状、画面遷移のロジックは `viewer.js` の `displayBook()` 内の `classList.add('hidden')` / `classList.remove('hidden')` と、`commands.js` の `ExitReaderCommand` に分散しており、遷移時のクリーンアップ処理が統一されていません。本リファクタリングによってそれを `SceneDirector` に集約し、メモリリークのリスクを排除します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/lib/scene.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [NEW] [`scene.js`](../../src/js/modules/scene.js) — `Scene` 基底クラス、`WelcomeScene`、`ReaderScene`、`SceneDirector` クラスの新規実装
- [MODIFY] [`viewer.js`](../../src/js/modules/viewer.js) — `displayBook()` 内の `welcomeScreen.classList.add('hidden')` / `readerScreen.classList.remove('hidden')` を `SceneDirector.transitionTo('reader', data)` 呼び出しへ置き換え
- [MODIFY] [`commands.js`](../../src/js/modules/commands.js) — `ExitReaderCommand` 内の `welcomeScreen.classList.remove('hidden')` / `readerScreen.classList.add('hidden')` を `SceneDirector.transitionTo('welcome')` 呼び出しへ置き換え
- [MODIFY] [`yuzora.js`](../../src/js/modules/yuzora.js) — `boot()` 内で `SceneDirector` を Locator に登録し、初期シーンを `welcome` に設定
- [MODIFY] [`Makefile`](../../Makefile) — ビルドチェーンの `locator.js` 直後に `scene.js` を追加
- [MODIFY] [`index.html`](../../index.html) — 開発用スクリプト読み込みに `scene.js` を追加
- [MODIFY] [`src/externs.js`](../../src/externs.js) — `SceneDirector`、`Scene` インターフェースの externs 定義を追加（ADVANCED_OPTIMIZATIONS でのリネーム防止）

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

### 3-1. Scene ライフサイクルの設計

`Scene` 抽象基底クラスに以下のライフサイクルメソッドを定義します：

| メソッド | タイミング | 役割 |
|---|---|---|
| `enter(data)` | シーン進入時 | DOM 表示化、イベントリスナー登録、データバインド |
| `exit()` | シーン脱出時 | イベントリスナー解除、DOM 非表示化、状態リセット |

`WelcomeScene.enter()`: `welcomeScreen.classList.remove('hidden')` / `readerScreen.classList.add('hidden')`  
`WelcomeScene.exit()`: `welcomeScreen.classList.add('hidden')`  
`ReaderScene.enter(data)`: `displayBook(data)` のDOM操作部分を委譲、`readerScreen.classList.remove('hidden')`  
`ReaderScene.exit()`: `readerScreen.classList.add('hidden')`、将来的に読書イベントリスナーのデタッチを担う

### 3-2. SceneDirector による集中管理

`SceneDirector` は現在アクティブなシーン (`currentScene`) を内部に保持し、`transitionTo(sceneName, data)` によって以下の遷移シーケンスを保証します：

```
currentScene.exit()  →  nextScene.enter(data)  →  currentScene = nextScene
```

- 遷移中の二重呼び出しを防止するために `isTransitioning` フラグを保持します。
- `SceneDirector` は `Locator` に登録され、他モジュールから `Yuzora.locator.resolve(SceneDirector)` で取得します。

### 3-3. Locator・Publisher との統合

- `SceneDirector` を `Locator` に登録し、`viewer.js` / `commands.js` から依存注入で利用します。
- シーン遷移完了後、`Publisher` を通じて `YuzoraEventType.SCENE_CHANGED` などのイベントを発行することで、UIモジュールへの通知を疎結合に保ちます（本イシューのスコープ外として将来拡張可）。

### 3-4. メモリリークの防止

- `ReaderScene.exit()` 内で読書ビューアー固有のイベントリスナー（スクロール監視等）を確実にデタッチします。
- `enter()` / `exit()` はべき等（複数回呼び出しに対して安全）であることを保証します。

### 3-5. Closure Compiler (ADVANCED_OPTIMIZATIONS) 対応

- `src/externs.js` に `SceneInterface`（`enter`, `exit`）および `SceneDirectorInterface`（`transitionTo`）を追加し、プロパティ名のリネームを防止します。

---

## 4. 完了条件 / Success Criteria (DoD)

- [ ] `SceneDirector.transitionTo()` 呼び出し後に `exit()` → `enter()` の順序でライフサイクルが実行されることを検証するユニットテストがパスすること。
- [ ] 読書画面からウェルカム画面に戻る際（`ExitReaderCommand` 実行時）、読書中のイベントリスナーが完全にデタッチ（クリーンアップ）されること。
- [ ] `viewer.js` / `commands.js` の直接 `classList` 操作が `SceneDirector.transitionTo()` に置き換わること。
- [ ] `make all`（Closure Compiler ADVANCED_OPTIMIZATIONS）が警告・エラーなしで成功すること。
- [ ] 画面遷移を伴う既存のすべてのE2Eテストが以前と同等の品質でパスすること（書籍ロード、ホーム遷移等）。
