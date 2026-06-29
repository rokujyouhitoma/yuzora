---
ID: 022
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] 読書ビューアーのドメイン固有イベントの定義 (ID: 022)

## 1. 概要 / Summary
`Event` 登録・発火機構の導入（ID: 021）に続き、青空文庫縦書きビューアーのビジネスロジックやドメイン固有のイベント（例：書籍のパース開始・完了、しおりの変更、テーマ・フォント設定の変更、ドロワー開閉、ページのスクロール移動等）を定義します。

これにより、イベント定義を明確化し、各モジュールがリッスンすべきイベント名や、通知とともに渡されるペイロードデータ（書籍情報、しおり進捗割合等）の仕様を一元管理し、コードの保守性と堅牢性を向上させます。

本イベントの登録・ディスパッチ処理は、[021-implement-event-emitter.md](021-implement-event-emitter.md) で定義される DOM Level 2 Events 準拠のインターフェース設計を利用します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/game/events.js

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [NEW] [events.js](../../src/js/modules/events.js) (ドメインイベント群の定義クラスの追加)
- [ui.js](../../src/js/modules/ui.js) (UI側イベント発火・ハンドリング)
- [viewer.js](../../src/js/modules/viewer.js) (ビューアー側イベント発火・ハンドリング)
- [parser.js](../../src/js/modules/parser.js) (パースイベント発火・ハンドリング)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach
1. **カスタムイベントクラスの定義**:
   - `Event` クラス（ID: 021）を継承した具象イベントクラス群を `events.js` に集約・定義します：
     - `BookLoadStartEvent`: ファイルロード開始時
     - `BookLoadedEvent`: パース・表示完了時（`detail` にタイトルやTOCデータを保持）
     - `BookmarkChangedEvent`: しおり進捗率の更新時（`detail` に進捗率を保持）
     - `ConfigChangedEvent`: テーマやフォントサイズなどの設定変更時（`detail` に変更後の設定値を保持）
2. **イベント名の定数化**:
   - イベント名をマジックストリングとして埋め込まず、クラスの static な定数等（例：`BookLoadedEvent.TYPE`）として参照可能にし、記述ミスによるバグを防止します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] 定義した各ドメインイベントクラスが、正しく対応するペイロードを内包してインスタンス化できることのテストがパスすること。
- [ ] モジュール間での書籍ロード、しおり更新、テーマ変更などのイベント発火およびハンドリングが、独自定義のイベントクラスを媒介して完璧に行えること。
- [ ] 既存の全テスト・機能が壊れずに維持されていること。
