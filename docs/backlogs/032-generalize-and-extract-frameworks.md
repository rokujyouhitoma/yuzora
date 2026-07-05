---
ID: 032
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] JavaScriptモジュールの汎用化・フレームワーク抽出とディレクトリ分離 (ID: 032)

## 1. 概要 / Summary

現在、`src/js/modules/` 配下の各JavaScriptファイルには、アプリケーション「Yuzora」のドメインロジック（書籍データのロード、特定UIのDOM操作など）と、アプリケーションに依存しない再利用可能な汎用コアロジック（Locator、EventEmitter、PubSub、Scene遷移の基底定義など）が混在しています。

例えば、`scene.js` には汎用的な基底クラス `Scene` や `SceneDirector` とともに、Yuzora固有の画面定義である `InitializeScene`、`WelcomeScene`、`ReaderScene` が同一ファイル内に記述されています。

本バックログでは、これらの汎用ロジックを「フレームワーク」として抽出し、`src/js/frameworks/` などの独立したディレクトリ配下へ移送・整理することで、アプリケーション固有のドメインコードと汎用的な構造コードを分離し、保守性と疎結合性を向上させます。
