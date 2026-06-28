---
ID: 019
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] CommandパターンによるUI表示操作（ボタン・ドロワー・メニュー表示状態）の記録と再現 (ID: 019)

## 1. 概要 / Summary
以前実装された操作履歴のCommandパターン（[012-command-pattern-operation-history.md](../backlogs/closed/012-command-pattern-operation-history.md)）を拡張し、読書状態の変更だけでなく、ドロワー（設定・目次）の開閉ボタン操作や、上下メニュー（ヘッダー・フッター）の表示・非表示トグル切り替えなどのUIインタラクション操作についてもCommandパターンによる記録および再現（リプレイ）の対象とします。

さらに、ユーザーが読書を終えてウェルカム画面に戻る操作や、しおり・表示設定の初期化（localStorageクリア）操作、さらにはデバッグ画面（モーダル）の開閉操作といった、アプリケーションのライフサイクルや環境制御に関するUI操作もコマンド化し、完全に一貫したセッション再現を可能にします。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [018-command-pattern-ui-interactions.md](../backlogs/closed/018-command-pattern-ui-interactions.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [DSN-02-low_level_design.md](../DSN-02-low_level_design.md)
- [x] [commands.js](../../src/js/modules/commands.js)
- [x] [ui.js](../../src/js/modules/ui.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/019-command-pattern-ui-interactions`

### Step 1: 設計ドキュメントの更新
1. **`docs/DSN-02-low_level_design.md` の更新**:
   - セクション 7.1 に新規コマンドクラス（`ToggleControlsCommand`, `ToggleDrawerCommand`, `ExitReaderCommand`, `ClearStorageCommand`, `ToggleDebugModalCommand`）の設計仕様（クラス構成、パラメータ、`execute` 処理内容）を追記しました。

### Step 2: コマンドクラスの実装 (`src/js/modules/commands.js`)
1. **`ToggleControlsCommand` の追加**:
   - `visible` (boolean) パラメータを受け取り、`triggerHeaderShow()` または `hideControls()` を呼び出すように実装しました。
2. **`ToggleDrawerCommand` の追加**:
   - `drawerId` (string) と `open` (boolean) パラメータを受け取り、`openSettings()`, `closeSettings()`, `openTOC()`, `closeTOC()` を呼び出すように実装しました。
3. **`ExitReaderCommand` の追加**:
   - 読書画面からウェルカム画面への遷移とカレント書籍状態の初期化を行うように実装しました。
4. **`ClearStorageCommand` の追加**:
   - `clearType` (string) に基づき、localStorageを消去するように実装しました。リプレイ中は `location.reload()` を呼び出さないように制御を組み込みました。
5. **`ToggleDebugModalCommand` の追加**:
   - デバッグモーダルの開閉およびモニターの更新を行うように実装しました。
6. **`CommandManager` の更新**:
   - `recreateCommand(item)` メソッドに新規コマンドのデシリアライズ分岐をすべて登録しました。

### Step 3: UIイベントリスナーのコマンド化 (`src/js/modules/ui.js`)
1. **メニュー表示切替 (Click/Key)**:
   - 画面クリック時およびキーボード操作トグル時に `ToggleControlsCommand` を発行するように差し替えました。
2. **ドロワー開閉 (Settings/TOC)**:
   - 設定/目次の開閉ボタン、Escapeキー、オーバーレイ背景、Homeアイコンクリック時に `ToggleDrawerCommand` を発行するように差し替えました。
3. **ホームに戻るボタン (`btnBack`)**:
   - `ExitReaderCommand` を実行するように差し替えました。
4. **localStorageパージボタン (`btnClear...`)**:
   - `ClearStorageCommand` を実行するように差し替えました。
5. **デバッグ画面開閉**:
   - `ToggleDebugModalCommand` を実行するように差し替え、補助関数として `openDebugModal` を新設しました。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] 設定・目次ドロワーの開閉、メニューの表示切り替え、ホームに戻る操作、localStorage初期化操作、およびデバッグ画面の開閉操作が、正しくコマンド履歴（JSON）に記録・シリアライズされること。
- [x] エクスポートした履歴を別セッションでインポートした際、ドロワーやデバッグ画面の開閉状態、ホームに戻る動作、キャッシュクリア動作が、ディレイを持って完全に再現されること。
- [x] 新規追加したUIコマンドの記録と再現動作を検証する E2E テストが追加され、正常にパスすること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 本実装は、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
