---
ID: 018
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT] CommandパターンによるUI表示操作（ボタン・ドロワー・メニュー表示状態）の記録と再現 (ID: 018)

## 1. 概要 / Summary
以前実装された操作履歴のCommandパターン（[012-command-pattern-operation-history.md](closed/012-command-pattern-operation-history.md)）を拡張し、読書状態の変更だけでなく、ドロワー（設定・目次）の開閉ボタン操作や、上下メニュー（ヘッダー・フッター）の表示・非表示トグル切り替えなどのUIインタラクション操作についてもCommandパターンによる記録および再現（リプレイ）の対象とします。

さらに、ユーザーが読書を終えてウェルカム画面に戻る操作や、しおり・表示設定の初期化（localStorageクリア）操作、さらにはトラブルシューティングのためのデバッグ画面（モーダル）の開閉操作といった、アプリケーションのライフサイクルや環境制御に関するUI操作もコマンド化し、完全に一貫したセッション再現を可能にします。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [commands.js](../../src/js/modules/commands.js) (新規コマンドクラスの定義とデシリアライズ処理の追加)
- [ui.js](../../src/js/modules/ui.js) (UI操作イベント発生時のコマンド実行・記録呼び出しの統合)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

1. **新規コマンドの定義**:
   - `ToggleControlsCommand`: ヘッダー・フッター表示のオン/オフ切り替えを記録・実行します。
     - `execute()`: パラメータ値（`visible`）に基づき、ヘッダー・フッターメニューを表示（`triggerHeaderShow()`）または非表示（`hideControls()`）にします。
   - `ToggleDrawerCommand`: 各種ドロワー（設定ドロワー、目次ドロワー）の開閉を記録・実行します。
     - `execute()`: パラメータ（`drawerId`: `"settings"` / `"toc"`, `open`: `true` / `false`）に基づき、対象ドロワーを開くか閉じます（`openSettings()`, `closeSettings()`, `openTOC()`, `closeTOC()` を呼び出します）。
   - `ExitReaderCommand`: 読書画面からウェルカム画面（ホーム）に戻る操作を記録・実行します。
     - `execute()`: 読書画面を非表示にしてウェルカム画面を表示し、メモリ上およびlocalStorage上の現在の読書セッション状態をクリアします（`btnBack` のクリックイベントの処理を実行します）。
   - `ClearStorageCommand`: しおりデータや表示設定の初期化（localStorageクリア）操作を記録・実行します。
     - `execute()`: パラメータ（`clearType`: `"bookmarks"` / `"config"` / `"all"`) にbaseづき、localStorageのデータ消去と必要な再読み込み（または初期化）を実行します。
   - `ToggleDebugModalCommand`: デバッグモーダルの開閉操作を記録・実行します。
     - `execute()`: パラメータ（`open`: `true` / `false`）に基づき、デバッグ画面の表示/非表示を切り替えます。

2. **ユーザー操作時のコマンド発行**:
   - [ui.js](../../src/js/modules/ui.js) の各イベントリスナー（ビューポートクリック、矢印キーによるメニュー切り替え、設定/目次ボタンのクリック、ドロワーを閉じるボタンやエスケープキー、戻るボタンのクリック、デバッグ画面の各種初期化ボタンのクリック、デバッグ画面の開閉ボタンクリックなど）において、イベント発生時に対応するコマンドインスタンスを作成し、`CommandManager.execute(command)` を通して呼び出します。

3. **リプレイ時の考慮**:
   - 既存の `CommandManager.replay` の仕組みを用いて、逆シリアライズ時に新設コマンドをインスタンス化し、300msの間隔で自動リプレイを行います。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] ドロワーの開閉（設定、目次）、メニューの表示切り替え、ホームに戻る操作、localStorage初期化操作、およびデバッグ画面の開閉操作が、正しくコマンド履歴（JSON）に記録・シリアライズされること。
- [ ] エクスポートした履歴を別セッションでインポートした際、ドロワーやデバッグ画面の開閉状態、ホームに戻る動作、データのクリア動作が、ディレイを持って完全に再現されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 新規実装について、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) への設計更新が必要な箇所が漏れなく反映されていること。
