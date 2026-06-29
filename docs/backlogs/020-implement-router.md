---
ID: 020
種別: Feature
優先度: Medium
ステータス: Draft
---

# [FEAT] Routerの実装とURLによる状態ディスパッチ機能 (ID: 020)

## 1. 概要 / Summary
読書状態や表示画面（ウェルカム画面、読書画面）をブラウザの URL ハッシュ（ハッシュルーティング）または History API を用いてディスパッチする Router 機構を導入します。

これにより、ユーザーが特定の書籍への直リンクによる遷移、ブラウザの「進む」「戻る」キーによる履歴遷移、リロード時の状態維持（しおり位置の復元や直前ページの保持）などが標準のWebアプリケーションの振る舞いとしてシームレスに機能するように設計します。

### 参考 URL
- https://github.com/rokujyouhitoma/horse-racing-game-js/blob/master/src/js/lib/router.js
