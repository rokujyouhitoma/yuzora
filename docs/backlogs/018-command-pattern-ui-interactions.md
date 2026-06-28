---
ID: 018
種別: Feature
優先度: Medium
ステータス: Approved
---

# [FEAT] CommandパターンによるUI表示操作（ボタン・ドロワー・メニュー表示状態）の記録と再現 (ID: 018)

## 1. 概要 / Summary
以前実装された操作履歴のCommandパターン（[012-command-pattern-operation-history.md](closed/012-command-pattern-operation-history.md)）を拡張し、読書状態の変更だけでなく、ドロワー（設定・目次）の開閉ボタン操作や、上下メニュー（ヘッダー・フッター）の表示・非表示トグル切り替えなどのUIインタラクション操作についてもCommandパターンによる記録および再現（リプレイ）の対象とします。

これまでは状態変更を伴わない低レベルのDOMイベントとして除外されていましたが、設定ドロワーを開く・閉じる、ヘッダー・フッターの表示状態を切り替えるといった操作もコマンド化することで、UI表示状態を含んだより詳細なユーザー操作の自動再現・リプレイが可能になります。

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

2. **ユーザー操作時のコマンド発行**:
   - [ui.js](../../src/js/modules/ui.js) の各イベントリスナー（ビューポートのクリック、上下矢印キーによるメニュー切り替え、設定/目次ボタンのクリック、ドロワーを閉じるボタンやエスケープキーによる閉動作など）において、イベント発生時に対応するコマンドインスタンスを作成し、`CommandManager.execute(command)` を通して呼び出します。

3. **リプレイ時の考慮**:
   - 既存の `CommandManager.replay` の仕組みを用いて、逆シリアライズ時に新設コマンドをインスタンス化し、300msの間隔で自動リプレイを行います。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] ドロワーの開閉（設定、目次）およびメニューの表示切り替え（クリック、キーボード操作を含む）が、正しくコマンド履歴（JSON）に記録・シリアライズされること。
- [ ] エクスポートした履歴を別セッションでインポートした際、ドロワーが自動的に開き、またメニューの表示切り替えがディレイを持って完全に再現されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 新規実装について、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) への設計更新が必要な箇所が漏れなく反映されていること。
