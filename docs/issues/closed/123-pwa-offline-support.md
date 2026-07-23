---
ID: 123
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT] オフライン自律稼働とPWA（Progressive Web App）化の導入 (ID: 123)

## 1. 概要 / Summary
「ゆうぞら」はサーバーサイドの処理を持たない完全なクライアントサイド静的SPA（Single Page Application）です。本タスクでは、この設計上の強みを活かし、ネットワークが不安定な環境や完全オフライン環境（地下鉄車内や飛行機内など）でも常にアプリが高速起動し、快適に読書を継続できるよう「オフライン自律稼働」と「PWA（Progressive Web App）化」を実現します。

システム設計討論（ID: 043）におけるネットワークスペシャリスト（NW）およびセキュリティスペシャリスト（SC）の検討に基づき、以下の課題を解決します：
1. **オフライン動作能力の確保**: ネットワーク非接続時でも Service Worker がアプリケーションの核となる静的アセット（HTML, JS, CSS, アイコン, 推奨書籍データ）を即座にローカルキャッシュから提供し、完全オフラインで起動可能にする。
2. **スタンドアロンアプリ体験（PWA化）**: Web App Manifest (`manifest.json`) を配置し、PCやモバイル端末のホーム画面追加・インストールに対応。レスポンシブなフルスクリーン/スタンドアロン表示を提供する。
3. **効率的なキャッシュライフサイクルと非同期ロード**: 初期起動に必要なアセットのプレキャッシュとともに、アセット更新時の即時有効化・古いキャッシュの安全なパージ（クリーンアップ）制御を行う。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): [MNG-00 完全クライアントサイドサーバーレス動作](../MNG-00-development_philosophy.md), [バックログ 040](../backlogs/closed/040-pwa-offline-support.md)
- 関連要件 (SRD): [REQ-02 機能要件 (オフライン自律稼働・PWA)](../requirements/REQ-02-functional_requirements.md)
- 関連設計書: [DSN-01 基本設計書](../designs/DSN-01-high_level_design.md), [DSN-02 詳細設計書](../designs/DSN-02-low_level_design.md)
- 関連脅威モデリング: [T-S2/T-I1/CSP適合](../threat-modeling/comprehensive-threat-modeling.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [NEW] [manifest.json](../../manifest.json) — PWAマニフェストファイル（アプリ名、アイコン、テーマカラー、起動URL、表示モードの定義）
- [NEW] [sw.js](../../sw.js) — Service Worker スクリプト（アセットのプレキャッシュ、Fetchイベントのネットワーク／キャッシュファースト制御、バージョン管理）
- [NEW] [icons/](../../icons/) — PWA用アイコンアセット（`icon-192.png`, `icon-512.png`, `maskable-icon.png` 等）
- [MODIFY] [index.html](../../index.html) — `<link rel="manifest">`、`theme-color` メタタグの追加、および Service Worker 連携用メタデータ
- [MODIFY] [compiled.html](../../compiled.html) — スタンドアロンリリースビルド向け PWA メタタグ・マニフェスト参照の同期
- [MODIFY] [yuzora.js](../../src/js/modules/core/yuzora.js) — `Yuzora.prototype.boot()` における Service Worker の非同期登録、更新検知、および `navigator.onLine` に連動したオフライン状態のUIフィードバック
- [MODIFY] [externs.js](../../src/externs.js) — Closure Compiler (ADVANCED_OPTIMIZATIONS) 用 Service Worker API (`navigator.serviceWorker`, `caches`, `CacheStorage` 等) の宣言追記
- [MODIFY] [Makefile](../../Makefile) — ビルド生成物・静的アセット同期プロセスへの Service Worker / Manifest / Icons の組み込みおよびキャッシュバスター連動
- [NEW] [pwa.spec.js](../../tests/e2e/pwa.spec.js) — PWAマニフェストの有効性、Service Worker の正常登録、およびオフライン擬似環境におけるページロード動作のE2Eテスト
- [MODIFY] [DSN-01-high_level_design.md](../designs/DSN-01-high_level_design.md) — 物理構成・PWAアーキテクチャおよびService Workerキャッシュモデルの追記
- [MODIFY] [DSN-02-low_level_design.md](../designs/DSN-02-low_level_design.md) — Service Workerライフサイクル、PWAマニフェスト仕様、オンライン/オフライン検知イベント処理の追記

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/123-pwa-offline-support`

1. **PWA マニフェスト (`manifest.json`) の作成**:
   - `name`: "ゆうぞら - 青空文庫縦書きビューアー"
   - `short_name`: "ゆうぞら"
   - `start_url`: "./index.html"
   - `display`: "standalone"
   - `background_color`: "#f4ecd8" (セピアテーマ標準背景色)
   - `theme_color`: "#2c2416"
   - `icons`: 192x192, 512x512, maskable アイコン定義
2. **PWA アイコンアセットの配置**:
   - `icons/icon-192.png`, `icons/icon-512.png`, `icons/maskable-icon.png` を生成・配備。
3. **Service Worker (`sw.js`) の実装**:
   - キャッシュ名: `yuzora-cache-v{BUILD_ID}` （`BUILD_ID` は `Makefile` にてビルド時に置換可能）。
   - `install` イベント: コアアセット (`index.html`, `compiled.html`, `main-min.js`, `src/css/style.css`, アイコン類) および推奨書籍データ (`src/books/*.txt`) を `caches.open()` で一括プレキャッシュ。`self.skipWaiting()` を実行。
   - `activate` イベント: 古いバージョン (`yuzora-cache-v*`) の CacheStorage を削除。`self.clients.claim()` を実行。
   - `fetch` イベント: 同一オリジン (`'self'`) に対する Cache First with Network Fallback 戦略。キャッシュヒット時は CacheStorage から返し、失敗時はネットワークから取得してキャッシュ追加。
4. **`index.html` / `compiled.html` の更新**:
   - `<link rel="manifest" href="manifest.json">` を追加。
   - `<meta name="theme-color" content="#2c2416">` を追加。
5. **`yuzora.js` での Service Worker 登録と状態監視**:
   - `Yuzora.prototype.boot()` 内で `if ('serviceWorker' in navigator)` チェックを行い `sw.js` を登録。
   - `navigator.onLine` および `online`/`offline` イベントをリッスンし、オフライン時には操作画面に非破壊的通知バッジまたはステータス表示を提供。
6. **Closure Compiler (`externs.js`) の対応**:
   - `navigator.serviceWorker`, `ServiceWorkerRegistration`, `caches`, `CacheStorage`, `Cache` 関連プロパティの難読化保護宣言を追加。
7. **ビルドプロセス (`Makefile`) の調整**:
   - `make` ターゲット実行時に `sw.js`, `manifest.json`, `icons/` の同期および `BUILD_ID` キャッシュバスター埋め込みを自動化。
8. **脅威モデリングとセキュリティ設計**:
   - **Cache Poisoning 防御**: 同一オリジン (`'self'`) リクエストのみキャッシュ対象とし、不審プロトコルやクロスドメイン応答の自動キャッシュを遮断。
   - **CSP 適合**: `worker-src 'self' blob:;` および `script-src 'self'` を維持し、不正なインラインワーカー実行を禁止。
9. **設計ドキュメント (`DSN-01`, `DSN-02`) の同期更新**:
   - `DSN-01-high_level_design.md` に PWA / Service Worker アーキテクチャ図およびキャッシュ方針を追記。
   - `DSN-02-low_level_design.md` に SW ライフサイクル、マニフェスト構造、`Yuzora` の SW 登録ロジックを追記。
10. **E2E テスト (`tests/e2e/pwa.spec.js`) の新設**:
   - Playwright による PWA マニフェスト取得テスト、Service Worker 登録検証テスト、オフライン擬似環境でのページロードテストを構築。

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] Chrome DevTools の Application パネルにて `manifest.json` が正常にロードされ、PWA インストール可能（Installable）と判定されること。
- [ ] ネットワークを「Offline」に設定した状態でリロードしても、アプリ（ウェルカム画面および読書画面）が即座に起動し、内蔵推奨書籍の読書が問題なく行えること。
- [ ] `sw.js` の `install` / `activate` ライフサイクルにおいて、アプリの更新時に古いキャッシュが正しく消去され、最新アセットが反映されること。
- [ ] CSP ヘッダー/メタタグの制約により Service Worker の登録や動作がブロックされないこと。
- [ ] `make` による Closure Compiler 難読化ビルド（`main-min.js`）がエラー・警告なしでパスすること。
- [ ] 設計ドキュメント [DSN-01](../designs/DSN-01-high_level_design.md) および [DSN-02](../designs/DSN-02-low_level_design.md) の記述が最新の実装と完全に整合していること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
