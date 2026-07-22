---
ID: 088
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT] コマンド履歴エクスポート時へのチェックサム付与とインポート時整合性検証 (ID: 088)

## 1. 概要 / Summary
不具合発生時のデバッグおよび操作ログの証跡としての信頼性を高めるため、操作履歴（Command History）を JSON ファイルとしてエクスポートする際、データのハッシュ値（チェックサム）を生成してファイル内に付与します。インポート時には、このハッシュ値を用いてデータが手動改ざんされたり破損したりしていないかを検証するチェックロジックを導入し、デバッグ再生データの完全性を保証します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- [debug-console.js](../../src/js/modules/ui/debug-console.js)
- [commands.js](../../src/js/modules/core/commands.js)
- [commands.test.js](../../tests/unit/core/commands.test.js)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- コマンド履歴エクスポート JSON にハッシュ/チェックサムフィールド (`checksum`) を付与。
- インポート時にチェックサムの整合性を検証し、一致しない場合はインポートを拒否。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] エクスポートした JSON に `checksum` が含まれ、改ざんされた JSON インポート時にエラーが検知されること。
