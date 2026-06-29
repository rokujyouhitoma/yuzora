---
ID: 022
種別: Refactor
優先度: Medium
ステータス: Draft
---

# [REFACTOR] 読書ビューアーのドメイン固有イベントの定義 (ID: 022)

## 1. 概要 / Summary
`EventEmitter` (または `Event` 登録・発火機構) の導入（ID: 021）に続き、青空文庫縦書きビューアーのビジネスロジックやドメイン固有のイベント（例：書籍のパース開始・完了、しおりの変更、テーマ・フォント設定の変更、ドロワー開閉、ページのスクロール移動等）を定義します。

これにより、イベント定義を明確化し、各モジュールがリッスンすべきイベント名や、通知とともに渡されるペイロードデータ（書籍情報、しおり進捗割合等）の仕様を一元管理し、コードの保守性と堅牢性を向上させます。

本イベントの登録・ディスパッチ処理は、[021-implement-event-emitter.md](021-implement-event-emitter.md) で定義される DOM Level 2 Events 準拠のインターフェース設計を利用します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/events.js
