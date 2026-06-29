---
ID: 024
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] Scene遷移（画面遷移）フレームワークの実装によるモジュール分離 (ID: 024)

## 1. 概要 / Summary
Yuzora の画面状態（ウェルカム画面 `welcome-screen` と読書画面 `reader-screen`）の切り替えや、初期表示・書籍読み込みなどの一連の画面フロー制御を標準化し疎結合にするため、Scene (画面遷移制御) フレームワークを導入します。

各画面を `WelcomeScene`, `ReaderScene` などのクラスとして定義し、画面のアクティブ化・非アクティブ化、リソース解放（デストラクタ処理）、およびシーン遷移時の中間状態管理（ローディング表示等）を一元制御できるようにリファクタリングします。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/lib/scene.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [scene.js](../../src/js/modules/scene.js) (SceneおよびSceneManagerクラスの新規追加)
- [ui.js](../../src/js/modules/ui.js) (Scene遷移トリガーへの書き換え)
- [viewer.js](../../src/js/modules/viewer.js) (Viewer機能の ReaderScene への移行)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **Sceneライフサイクルの設計**:
   - ベースクラス `Scene` を定義し、以下のライフサイクルメソッドを提供します：
     - `init()`: シーンの初回構築・初期化処理。
     - `enter(data)`: シーン進入時。DOMの表示化、イベントリスナーの登録、データバインド等。
     - `exit()`: シーン脱出時。イベントリスナーの解除、リソースのクリーンアップ、DOMの非表示化等。
     - `destroy()`: シーンの破棄・メモリ解放。
2. **SceneManager による集中管理**:
   - 状態変数（現在アクティブなシーン）を保持し、`SceneManager.transitionTo(sceneName, data)` によって前シーンの `exit()` と次シーンの `enter(data)` を順序正しくシーケンシャルに呼び出し実行します。
3. **メモリリークの完全防止**:
   - 画面が切り替わった後、古い画面のイベントリスナーが DOM やグローバル空間に残留して発生するメモリリークを完全に防止します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] シーンの遷移コールバックおよびライフサイクル実行順序（exit -> enter）が正しく行われることのテストがパスすること。
- [ ] 読書画面からウェルカム画面に戻る際、読書中のスクロールリスナーやイベント監視が完全にデタッチ（クリーンアップ）されること。
- [ ] 画面遷移を伴う既存のE2E機能（書籍ロード、ホーム遷移）が以前と同一の品質でスムーズに動作すること。
- [ ] すべてのE2Eテストがパスすること。
