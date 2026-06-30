---
ID: 029
種別: Bug
優先度: High
ステータス: Open (New)
---

# [BUG/SEC] ESLint complexity limit errors in config.js and ui.js (ID: 029)

## 1. 概要 / Summary
GitHub Actions CIおよびローカルでの `npm run lint` 実行時、循環的複雑度（Cyclomatic Complexity）の制限値（最大10）を超過している関数・メソッドが検出され、ビルドパイプラインが失敗する問題を修正します。

### 再現手順 / Steps to Reproduce
1. ターミナルで `npm run lint` を実行する。
2. 以下のエラーが出力され、コマンドが終了コード 1 で失敗する：
   - `src/js/modules/config.js` の `ConfigModel.load` メソッド（複雑度: 11）
   - `src/js/modules/ui.js` の `handleDebugKeyboardShortcuts` 関数（複雑度: 18）
   - `src/js/modules/ui.js` の `setupDrawerControls` 関数（複雑度: 14）

### 再現環境 / Environment
- ESLint configuration with rules: `complexity: ["error", 10]`

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [config.js](file:///workspace/yuzora/yuzora/src/js/modules/config.js)
- [ ] [ui.js](file:///workspace/yuzora/yuzora/src/js/modules/ui.js)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
- `ConfigModel.load`: LocalStorageからの設定値の読み込みと各種初期値割り当ての条件分岐（if-else）が単一のメソッドに集中しているため、複雑度が 11 に達しています。
- `handleDebugKeyboardShortcuts`: デバッグモーダルのタブ切り替え、コピー、シリアライズ、インポート等のキー判定分岐がフラットな if-else チェーンになっているため、複雑度が 18 に達しています。
- `setupDrawerControls`: 設定ドロワーおよび目次ドロワーのボタンイベント登録とドロワー開閉、オーバーレイ処理の条件判定が密結合しているため、複雑度が 14 に達しています。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 各関数・メソッドの処理を小さなヘルパー関数またはクラスメソッドへと適切に分割・委譲し、各スコープごとの循環的複雑度を 10 以下に抑制します。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/029-lint-complexity-errors`

1. **`ConfigModel.load` のリファクタリング**:
   - `load` メソッドから、個別の設定キー（`theme`, `font`, `size`, `lh`, `spacing`, `direction`）ごとの読み込みとフォールバック判定を private ヘルパーメソッド（例: `loadConfigValue_`）に抽出し、分割します。
2. **`handleDebugKeyboardShortcuts` のリファクタリング**:
   - キーイベントハンドラから、コピー/シリアライズの分岐やタブ選択などの判定を別々のヘルパー関数に抽出し、マッピングテーブルや個々のキーハンドラに処理を分割します。
3. **`setupDrawerControls` のリファクタリング**:
   - ドロワー制御の初期化、イベントリスナー割り当てをヘルパー関数（例: `bindDrawerTrigger_`）などに分割し、記述を整理します。
4. **検証**:
   - `npm run lint` が完全に成功することを確認。
   - `make clean && make` でビルドが成功することを確認。
   - `npm run test:unit` および `npm run test:e2e` を実行し、デグレードがないことを検証。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] すべてのソースファイルで `npm run lint` が警告・エラーなしで正常終了すること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 実装内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
