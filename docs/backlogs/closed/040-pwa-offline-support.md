---
ID: 040
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT] オフライン自律稼働とPWA（Progressive Web App）化の導入 (ID: 040)

## 1. 概要 / Summary
「ゆうぞら」はサーバーサイドの処理を持たない完全なクライアントサイド静的SPA（Single Page Application）です。本タスクでは、この設計上の強みを活かし、ネットワークが不安定な環境や完全オフライン環境（地下鉄車内や飛行機内など）でも常にアプリが高速起動し、快適に読書を継続できるよう「オフライン自律稼働」と「PWA（Progressive Web App）化」を実現しました。

システム設計討論（ID: 043）におけるネットワークスペシャリスト（NW）の要請に基づき、以下の課題を解決しました：
1. **オフライン動作能力の確保**: ネットワーク非接続時でも Service Worker がアプリケーションの核となる静的アセット（HTML, JS, CSS, アイコン, 推奨書籍データ）を即座にローカルキャッシュから提供し、完全オフラインで起動可能にする。
2. **スタンドアロンアプリ体験（PWA化）**: Web App Manifest (`manifest.json`) を配置し、PCやモバイル端末のホーム画面追加・インストールに対応。レスポンシブなフルスクリーン/スタンドアロン表示を提供する。
3. **効率的なキャッシュライフサイクルと非同期ロード**: 初期起動に必要なアセットのプレキャッシュとともに、アセット更新時の即時有効化・古いキャッシュの安全なパージ（クリーンアップ）制御を行う。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [NEW] [`manifest.json`](../../manifest.json) — PWAマニフェストファイル（アプリ名、アイコン、テーマカラー、起動URL、表示モードの定義）
- [NEW] [`sw.js`](../../sw.js) — Service Worker スクリプト（アセットのプレキャッシュ、Fetchイベントのネットワーク／キャッシュファースト制御、バージョン管理）
- [NEW] [`icons/`](../../icons/) — PWA用アイコンアセット（`icon-192.png`, `icon-512.png`, `maskable-icon.png` 等）
- [MODIFY] [`index.html`](../../index.html) — `<link rel="manifest">`、`theme-color` メタタグの追加、および開発環境における Service Worker 連携用タグ
- [MODIFY] [`compiled.html`](../../compiled.html) — スタンドアロンリリースビルド向け PWA メタタグ・マニフェスト参照の同期
- [MODIFY] [`yuzora.js`](../../src/js/modules/core/yuzora.js) — `Yuzora.prototype.boot()` における Service Worker の非同期登録、更新検知、および `navigator.onLine` に連動したオフライン状態のUIフィードバック
- [MODIFY] [`externs.js`](../../src/externs.js) — Closure Compiler (ADVANCED_OPTIMIZATIONS) 用 Service Worker API (`navigator.serviceWorker`, `caches`, `CacheStorage` 等) の宣言追記
- [MODIFY] [`Makefile`](../../Makefile) — ビルド生成物・静的アセット同期プロセスへの Service Worker / Manifest / Icons の組み込みおよびキャッシュバスター連動
- [NEW] [`pwa.spec.js`](../../tests/e2e/pwa.spec.js) — PWAマニフェストの有効性、Service Worker の正常登録、およびオフライン擬似環境におけるページロード動作のE2Eテスト

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 Web App Manifest (`manifest.json`) の仕様
- アプリケーション基本情報:
  - `name`: "ゆうぞら - 青空文庫縦書きビューアー"
  - `short_name`: "ゆうぞら"
  - `start_url`: "./index.html" (または "./")
  - `display`: "standalone"
  - `background_color`: "#f4ecd8" (セピアテーマ標準背景色)
  - `theme_color`: "#2c2416"
  - `orientation`: "any"
- アイコン定義:
  - `icons`: 192x192 (`image/png`), 512x512 (`image/png`), および maskable アイコン指定

### 3.2 Service Worker (`sw.js`) のキャッシュ戦略とライフサイクル
- **キャッシュ識別子**: `yuzora-cache-v{BUILD_ID}` （`Makefile` ビルド時にバージョン自動埋め込み）
- **Precache（インストール時 `install` イベント）**:
  - アプリコアアセット: `index.html`, `compiled.html`, `main-min.js`, `src/css/style.css` (または `src/css/modules/*.css`), アイコン群
  - 内蔵推奨書籍テキスト (`src/books/*.txt`)
  - `self.skipWaiting()` を呼び出し、即座に新しい Service Worker をアクティブ化可能に制御。
- **クリーンアップ（`activate` イベント）**:
  - 現在のキャッシュバージョン以外（古い `yuzora-cache-v*`）を安全に削除。
  - `self.clients.claim()` を呼び出し、既存クライアントを即座に制御下に置く。
- **Fetchハンドリング戦略（`fetch` イベント）**:
  - **Cache First with Network Fallback**: 静的アセットおよび内蔵書籍リクエストに対し、まず CacheStorage を検索し、ヒットした場合は高速に返却。キャッシュにない場合は Fetch 経由で取得しキャッシュに追加。
  - **Network Only / Bypass**: ブラウザ拡張機能やデータインポート（IndexedDB 直接アクセス）など、動的ローカル処理は Service Worker キャッシュをバイパス。

### 3.3 アプリケーション層 (`yuzora.js`) での統括制御
- `Yuzora.prototype.boot()` 内で、`navigator.serviceWorker` の存在を確認後、安全に `sw.js` を登録。
- Service Worker の更新（`updatefound` イベント）を検知した場合、ユーザーの読書体験を阻害しない範囲でバックグラウンド更新を完了させる。
- `window.addEventListener('online')` および `'offline'` を監視し、オフライン状態に切り替わった際は操作画面上に非破壊的なステータス通知（「オフラインモードで動作中」等）を表示。

### 3.4 セキュリティ（CSP）・難読化（Closure Compiler）適合性
- **Content Security Policy (CSP)**: `index.html` および `compiled.html` の CSP メタタグに `worker-src 'self' blob:;` および `script-src 'self'` が正しく定義されていることを確認・維持する。
- **オリジン保護**: Service Worker は同一オリジン (`'self'`) のみからスコープされるため、外部からのキャッシュインジェクション/汚染（Cache Poisoning）を防ぐ。
- **Closure Compiler**: `externs.js` に `ServiceWorkerContainer`, `ServiceWorkerRegistration`, `CacheStorage`, `Cache` のインターフェース/プロパティ名を定義し、難読化（ADVANCED_OPTIMIZATIONS）時のシンボル破損を防ぐ。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] Chrome DevTools の Application パネルにて `manifest.json` がエラーなく認識され、PWA インストール可能（Installable）と判定されること。
- [x] ネットワークを「Offline」に設定した状態でリロードしても、アプリ（ウェルカム画面および読書画面）が即座に起動し、内蔵推奨書籍の読書が問題なく行えること。
- [x] `sw.js` の `install` / `activate` ライフサイクルにおいて、アプリの更新時に古いキャッシュが正しく消去され、最新アセットが反映されること。
- [x] CSP ヘッダー/メタタグの制約により Service Worker の登録や動作がブロックされないこと。
- [x] `make` による Closure Compiler 難読化ビルド（`main-min.js`）がエラー・警告なしでパスすること。
- [x] 新設した E2E テスト (`tests/e2e/pwa.spec.js`) および既存の単体・統合テストが全件パスすること。
