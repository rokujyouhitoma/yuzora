---
ID: 021
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] Eventクラスの実装とイベントディスパッチャーによるモジュール疎結合化 (ID: 021)

## 1. 概要 / Summary
アプリケーション内の各種モジュール間（parser, viewer, ui 等）の密結合を解消し、イベント駆動（イベントドリブン）アーキテクチャを実現するため、汎用的な `Event` 登録・発火機構を導入します。

これらにより、状態変更やUI更新イベント（書籍ロード完了、ページめくり、テーマ変更等）をイベント通知として処理し、各モジュールが互いの内部関数を直接呼び出す依存関係を排除して、独立性と保守性を向上させます。

イベント登録・伝播インターフェースの設計においては、W3C の **DOM Level 2 Events** 仕様（`addEventListener`, `removeEventListener`, `dispatchEvent`）を参考に実装します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/event.js
