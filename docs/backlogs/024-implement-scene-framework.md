---
ID: 024
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] Scene遷移（画面遷移）フレームワークの実装によるモジュール分離 (ID: 024)

## 1. 概要 / Summary
Yuzora の画面状態（ウェルカム画面 `welcome-screen` と読書画面 `reader-screen`）の切り替えや、初期表示・書籍読み込みなどの一連の画面フロー制御を標準化し疎結合にするため、Scene (画面遷移制御) フレームワークを導入します。

各画面を `WelcomeScene`, `ReaderScene` などのクラスとして定義し、画面のアクティブ化・非アクティブ化、リソース解放（デストラクタ処理）、およびシーン遷移時の中間状態管理（ローディング表示等）を一元制御できるようにリファクタリングします。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/lib/scene.js
