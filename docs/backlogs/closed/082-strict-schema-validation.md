---
ID: 082
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] インポートデータ（設定/履歴）の厳格なスキーマ検証によるプロトタイプ汚染対策 (ID: 082)

## 1. 概要 / Summary
外部からインポートされる設定データ（JSON）やデバッグ用コマンド履歴を読み込む際、入力データオブジェクトに対して再帰的なキー検証を適用し、`__proto__` や `constructor`、`prototype` などの特殊プロパティが存在しないかチェックします。これにより、クライアントサイドでのプロトタイプ汚染（Prototype Pollution）脆弱性を完全に防ぎ、インポート機能の安全性を確保します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [src/js/modules/storage/repository.js](../../src/js/modules/storage/repository.js) (`SettingsRepository.load()` における設定キー・値のホワイトリスト検証の導入)
- [src/js/modules/core/commands.js](../../src/js/modules/core/commands.js) (`commands.js` の `validateCommandItem_` における再帰的プロトタイプ汚染防御とコマンド別パラメータスキーマ制限の強化)
- [tests/unit/core/commands.test.js](../../tests/unit/core/commands.test.js) (プロトタイプ汚染および不正コマンドスキーマに対するテストケースの拡充)
- [tests/unit/storage/repository.test.js](../../tests/unit/storage/repository.test.js) (不正キーやプロトタイプ汚染ペイロードを含む設定ファイルのインポート拒否検証)

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 設定データのホワイトリスト検証
*   `SettingsRepository.load()` において、`JSON.parse()` されたオブジェクトが以下に適合することを確認します：
    *   オブジェクトがプレーンな `Object` であること（配列やプリミティブ等は除外）。
    *   すべてのキーが既定の設定オプション（`theme`, `font`, `direction`, `size`, `lh`, `spacing`, `headingPageBreakMode`）のいずれかであること。
    *   各設定値が定義済みの許可された値（値のホワイトリスト。例：`theme` の場合は `sepia`, `night`, `light` 等）の範囲内であること。
    *   不正な値や特殊プロパティ（`__proto__` 等）が含まれていた場合は、そのプロパティのみを除外するか、パース全体を拒否して空のオブジェクトを返します。

### 3.2 コマンド履歴データの再帰的プロトタイプ汚染対策と厳格なスキーマ検証
*   `commands.js` の `validateCommandItem_` において、`JSON.parse` された操作履歴オブジェクトの検証を強化します：
    *   コマンドオブジェクトの第一階層だけでなく、`params` オブジェクトの入れ子になったすべての深さにおいて、プロキシや再帰ループを考慮しつつ `__proto__`, `constructor`, `prototype` キーがないか再帰的にスキャンします。
    *   コマンドごとの許可されたパラメータスキーマを定義し、各コマンド型に不要な追加プロパティ（ノイズデータ、XSSペイロードを意図したスクリプト等）が含まれている場合はインポートを拒否します。
        *   例：`UpdateConfig` は `configKey`, `configValue` のみ許可。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [x] `SettingsRepository.load()` がプロトタイプ汚染ペイロードを含む設定データを安全にフィルタリングし、許可されたキー・値のみをロードすること。
- [x] `commands.js` のインポート処理が、ネストされたオブジェクト内のプロトタイプ汚染キー（`__proto__`, `constructor`, `prototype`）を完全に検知してインポートを拒否すること。
- [x] 各コマンド型（`LoadBook`, `NavigatePage`, `UpdateConfig` 等）に必要な最小限のパラメータのみを許可する厳格な型/キー検証が実装されていること。
- [x] 不正設定データおよびネストされたプロトタイプ汚染に対する単体テストケースが追加され、すべてパスすること。
- [x] 難読化コンパイル（`make`）が警告なしで完了し、E2Eテストがすべてクリアすること。
