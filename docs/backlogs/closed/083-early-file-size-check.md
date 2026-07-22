---
ID: 083
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] 最初期フェーズにおけるインポートファイルサイズ制限によるDoS対策 (ID: 083)

## 1. 概要 / Summary
ドラッグ＆ドロップなどのユーザーインポート動作における最も外側のエントリポイント（イベントリスナーのハンドラー直後）で、対象ファイルのサイズチェックを即時実施します。2MBを超える過大ファイルがロードされた場合に、パーサー等の下流処理へ渡る前に処理を遮断し、ブラウザのメインスレッドフリーズやメモリ枯渇を伴うサービス拒否（DoS）状態を未然に防ぎます。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [ui.js](../../src/js/modules/ui/ui.js)
- [resource-director.js](../../src/js/modules/storage/resource-director.js)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- File 読み込みイベント (`drop`, `change`) ハンドラーの最初期フェーズで `file.size > 2 * 1024 * 1024` (2MB) を事前検証し、過大ファイル時に即座に拒否通知を表示して読み込みを中止する。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] 2MB を超えるファイルインポート時に早期エラー通知が表示され処理が中断されること。
- [ ] 2MB 以下のファイルインポートは正常に読み込まれること。
