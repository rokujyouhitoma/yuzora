---
ID: 040
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] AssetクラスとResourceDirectorの導入によるリソース管理の抽象化 (ID: 040)

## 1. 概要 / Summary
書籍データやそのロード、保持、廃棄のライフサイクル管理が特定のモジュールに直接組み込まれている現状を改善するため、`Asset` および `ResourceDirector` の概念を導入し、リソースのロード・保持・解放の責務を抽象化・一元化します。これにより、将来的な画像やフォントなどの他アセット追加への拡張性を持たせ、メモリリークのリスクを最小化します。
これは開発哲学である「サーバーレスでの静的クライアントサイド実行」において、メモリ管理とデータ境界をクリーンに保つための基盤設計です。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): URD-01 (青空文庫縦書き表示の基本表示性能・リソース管理)
- 関連要件 (SRD): SRD-03 (メモリ使用効率、ファイルライフサイクル)
- 関連設計書:
  - [DSN-01-high_level_design.md](../DSN-01-high_level_design.md) (アーキテクチャ図、コンポーネント一覧)
  - [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (クラス設計、イベントフロー)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [asset.js](../../src/js/modules/asset.js) [NEW] (Asset, BookAsset 等の定義)
- [ ] [resource-director.js](../../src/js/modules/resource-director.js) [NEW] (ResourceDirector の定義)
- [ ] [viewer.js](../../src/js/modules/viewer.js) (書籍ロード・保持処理の分離)
- [ ] [yuzora.js](../../src/js/modules/yuzora.js) (起動時の初期化、および新モジュールのレジストリ登録)
- [ ] [locator.js](../../src/js/modules/locator.js) (ロケーターへの登録)
- [ ] [Makefile](../../Makefile) (新ファイルのコンパイルターゲット追加)
- [ ] [index.html](../../index.html) (scriptタグの追加)
- [ ] [externs.js](../../src/externs.js) (外部定義の追加)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/040-introduce-asset-and-resource-director`

### 4.1 設計ドキュメントの更新
コードを変更する前に、以下の設計仕様を更新します。
- [DSN-01-high_level_design.md](../DSN-01-high_level_design.md): アーキテクチャ図とコンポーネント一覧に `asset.js` および `resource-director.js` を追加。
- [DSN-02-low_level_design.md](../DSN-02-low_level_design.md): `Asset`, `BookAsset`, `ResourceDirector` の詳細設計仕様、およびサービスロケーター登録情報を追記。

### 4.2 クラス設計詳細
1. **`Asset` クラス (基底)**:
   - プロパティ: `id` (一意のキー), `type` (アセット種別: 'book', 'image' 等), `status` ('loading'|'ready'|'failed'), `error` (ロード失敗時エラー)
   - メソッド: `dispose()` (リソース解放、プロパティを `null` 化)
2. **`BookAsset` クラス (継承)**:
   - プロパティ: `title`, `content` (パース前のテキストまたはXHTML), `toc` (目次データ)
3. **`ResourceDirector` クラス**:
   - プロパティ: `assets` (Map<string, !Asset>)
   - メソッド:
     - `loadBook(id, source, loaderFn)`: `loaderFn` を非同期実行してアセットをロードし、キャッシュする。
     - `unload(id)`: 指定IDのアセットをアンロードし、`dispose()` を実行してメモリから解放する。
     - `clear()`: キャッシュされたすべてのアセットをアンロードする。

### 4.3 セキュリティ対策（STRIDE緩和策の適用）
- **T-S2 (Spoofing) 対策**: `ResourceDirector` における非同期フェッチ処理（loaderFn等）において、フェッチ先が許可されたドメイン（同一生成元、または `connect-src` でホワイトリスト化されたURL）のみであることを検証し、外部の未承認URLへのリクエストを遮断する。
- **T-D2 (DoS) 対策**: ファイルロード時に、サイズが 2MB（書籍テキストの安全基準上限）を超えているか事前にチェックし、超過した場合は `BookAsset` を `failed` ステータスとし、ロード処理を直ちに中断する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] `Asset` クラスおよび `ResourceDirector` クラスが独立したモジュールとして実装され、Locatorに登録されていること。
- [x] 既存の書籍読み込み処理（ドラッグ＆ドロップおよびオススメ本選択）が `ResourceDirector` を経由して動作すること。
- [x] 2MBを超える巨大ファイルがドロップされた場合、ロードが直ちに拒否され、エラーハンドリングが行われること（DoS対策）。
- [x] 設計書（[DSN-01](../docs/DSN-01-high_level_design.md), [DSN-02](../docs/DSN-02-low_level_design.md)）の内容と実装が完全に一致していること（デッドドキュメントの防止）。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
