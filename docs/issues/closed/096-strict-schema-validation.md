---
ID: 096
種別: Feature
ステータス: Closed
---

# [FEAT/ENH] インポートデータ（設定/履歴）の厳格なスキーマ検証によるプロトタイプ汚染対策 (ID: 096)

## 1. 概要 / Summary
外部からロード・インポートされる設定データ（localStorage）やデバッグ用コマンド履歴（JSON）を読み込む際、入力データオブジェクトに対して再帰的なキー検証を適用し、`__proto__` や `constructor`、`prototype` などの特殊プロパティが存在しないかチェックします。これにより、クライアントサイドでのプロトタイプ汚染（Prototype Pollution）脆弱性を完全に防ぎ、インポート機能の安全性と堅牢性を確保します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): URD 4.2 セキュリティ・安全性
- 関連要件 (SRD): SRD 4.2 セキュリティ・安全性
- 関連バックログ: [082-strict-schema-validation.md](../../backlogs/082-strict-schema-validation.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [repository.js](../../src/js/modules/storage/repository.js)
- [x] [commands.js](../../src/js/modules/core/commands.js)
- [x] [commands.test.js](../../tests/unit/core/commands.test.js)
- [x] [repository.test.js](../../tests/unit/storage/repository.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/096-strict-schema-validation`

### 4.1 設計書の更新 (LLD)
*   [DSN-02-low_level_design.md](../../designs/DSN-02-low_level_design.md) の「4.1 UI設定 (`yuzora_config`)」および「7.2 コマンドマネージャ (`CommandManager`) の設計」を更新し、インポートデータ読み込み時に再帰的なプロトタイプ汚染チェックおよびホワイトリストベースのスキーマ検証を実施する記述を追加する。

### 4.2 設定データ（yuzora_config）のホワイトリストバリデーションの実装
*   `src/js/modules/storage/repository.js` の `SettingsRepository.prototype.load()` メソッドを以下のように拡張する：
    *   `JSON.parse(raw)` でパースしたオブジェクトに対して、再帰的なプロトタイプ汚染キー（`__proto__`, `constructor`, `prototype`）の存在有無を確認し、存在した場合はログ出力のうえ空オブジェクト `{}` を返す。
    *   パースしたオブジェクトが配列である場合、または `object` でない場合は空オブジェクト `{}` を返す。
    *   オブジェクトのすべてのプロパティについてループを回し、許可されたキー（`theme`, `font`, `direction`, `size`, `lh`, `spacing`, `headingPageBreakMode`）のみを含んでいることを検証する。規定外のキーが含まれていた場合は、そのエントリーを除去（フィルタリング）する。
    *   各設定値について、ホワイトリスト値に合致しているか検証する。不適合な値がある場合はそのキー・値ペアを除去する。
        *   `theme` -> `sepia`, `dark`, `light`, `black`
        *   `font` -> `font-gothic`, `font-mincho`
        *   `direction` -> `rtl`, `ltr`
        *   `size` -> `size-sm`, `size-md`, `size-lg`, `size-xl`
        *   `lh` -> `line-height-tight`, `line-height-normal`, `line-height-loose`
        *   `spacing` -> `spacing-tight`, `spacing-normal`, `spacing-loose`
        *   `headingPageBreakMode` -> `none`, `large`, `large-medium`, `all`

### 4.3 コマンド履歴データの再帰的プロトタイプ汚染対策と厳格なスキーマ検証の実装
*   `src/js/modules/core/commands.js` に再帰的プロトタイプ汚染キー検知用ヘルパー関数 `hasPrototypePollutionKeys(obj)` を追加し、`validateCommandItem_(item)` で使用する：
    *   `item` 全体（`params` 含む）に対して `hasPrototypePollutionKeys(item)` を呼び出し、プロトタイプ汚染キーが含まれていた場合は即座に `false` を返し、警告出力のうえ破棄する。
    *   コマンドごとの許可されたパラメータスキーマ検証（`validateParamsByType_`）を強化する：
        *   各コマンドパラメータ（`LoadBook`, `NavigatePage`, `UpdateConfig`, `SyncBookmark`, `ToggleControls`, `ToggleDrawer`, `ExitReader`, `ClearStorage`, `ToggleDebugModal`）に定義されていない過剰なパラメータ（ノイズキー）が含まれている場合は `false` を返し破棄する。
        *   各パラメータの型と値の範囲（例：`NavigatePage` の `targetPage` は 1以上の整数、`SyncBookmark` の `progress` は 0.0 以上 1.0 以下の数値、`UpdateConfig` の `configKey` / `configValue` はホワイトリスト値）を厳格にチェックする。

### 4.4 テストケースの追加と実行
*   `tests/unit/storage/repository.test.js` に `SettingsRepository.load()` のスキーマ検証テストを追加：
    *   `yuzora_config` にプロトタイプ汚染データ（`{"__proto__": {"polluted": true}}`）や不正キーが含まれる場合にロード処理で除去されること。
*   `tests/unit/core/commands.test.js` にプロトタイプ汚染および不正スキーマコマンドインポートテストを追加：
    *   ネストされたオブジェクト内に `__proto__` などのプロトタイプ汚染キーを含む JSON がインポート時に拒否されること。
    *   不要なパラメータを持つコマンドや値が規格外のコマンドが拒否されること。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `SettingsRepository.load()` において設定キー・値のホワイトリスト検証が正しく機能し、単体テストをパスすること。
- [x] 操作履歴インポートにおいて、ネストされたプロトタイプ汚染キー（`__proto__`, `commands`, `constructor`, `prototype`）を持つ JSON データが確実に破棄されること。
- [x] 各操作コマンドに不要な追加パラメータが存在する場合にインポートが拒否されること。
- [x] 変更内容が基本設計書 [DSN-01](../../designs/DSN-01-high_level_design.md) / [DSN-02](../../designs/DSN-02-low_level_design.md) に正しく反映されており、ドキュメントの整合性が保たれていること。
- [x] すべてのE2Eテスト (`npm run test:e2e` 及び `npm run test:e2e:compiled`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
