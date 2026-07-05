# ゆうぞら (Yuzora) - 青空文庫縦書きビューアー

青空文庫のテキストファイル（.txt）やXHTMLファイル（.html）をブラウザへドラッグ＆ドロップするだけで、美しい縦書き表示に変換し、快適に読書ができるクライアントサイド専用の静的Web SPAビューアーです。

🚀 **動作URL (GitHub Pages デモサイト)**: [https://rokujyouhitoma.github.io/yuzora/](https://rokujyouhitoma.github.io/yuzora/)

---

## 📖 主な機能 (Features)

1. **吉川英治「宮本武蔵」8作品のプリロード**
   * モバイルデバイス等でのダウンロードやファイル選択の手間を解消するため、宮本武蔵（全8巻）をマスターデータとしてプリロード。ウェルカム画面の美しい書籍風カードからワンタップで即時読書を開始できます。
2. **文字コード自動判定 & デコード**
   * 青空文庫の標準エンコーディングである Shift_JIS (CP932) での読み込みを第一優先とし、不正なバイトシーケンスを検出した場合は自動的に UTF-8 にフォールバックします。
3. **青空文庫ルビ・記法のパース**
   * `｜漢字《かんじ》`（境界あり）や `漢字《かんじ》`（境界なし）のルビ表示に対応。
   * `［＃改ページ］` による段組みページ境界の自動改ページや、`［＃「...」に傍点］` の傍点（強調マーク）表示に対応。
4. **表示カスタマイズ（設定引き出し）**
   * 配色テーマ：「和紙（セピア、デフォルト）」、「明（ライト）」、「暗（ダーク）」、「漆黒（ブラック）」
   * フォント：明朝体（Noto Serif JP） / ゴシック体
   * 文字サイズ、行間、文字間の動的調整
5. **読書進行方向（RTL/LTR）切り替え**
   * 日本の伝統的な「右から左（RTL）」の送り方向のほか、現代的な「左から右（LTR）」の送り方向へ設定から切り替え可能です。
6. **しおり保存と最後の読書セッション復元**
   * スクロール操作のデバウンス処理およびタブの非表示（`visibilitychange`）を検知し、ページごとのしおり進捗率を `localStorage` に自動記録。
   * アプリ再起動時、直前に読んでいた本の状態（コンテンツ、スクロール位置、表示設定）を一瞬で自動復元します。
7. **ジャンプ機能（先頭・指定・進捗バー）**
   * ヘッダーの戻るボタンで先頭（1ページ目）へスムーズジャンプ。
   * フッターのページ数インジケーターをクリックして、任意の指定ページへジャンプ。
   * フッターの太めのプログレスバー上をクリックして、その割合の位置へジャンプ。
8. **目次表示およびジャンプ機能 (TOC)**
   * 青空文庫の見出し注記（大・中・小見出し）をパース時に自動検出し、ルビを除去したプレーンテキスト形式で階層的な目次リストを自動抽出します。目次ドロワーから任意の項目をクリックすることで、送り方向（RTL/LTR）に応じたスムーズスクロールで指定位置へ正確にジャンプできます。
9. **操作履歴の Command 化と自動リプレイ / デバッグ機能**
   * アプリ内で行われた本のロード、ページ遷移、表示設定の変更といった主要操作を `Command` パターンによって履歴管理。最大100世代（初期ロードコマンドは固定保護）の FIFO 履歴を JSON としてデバッグ画面からエクスポート/インポート可能。貼り付けた履歴を 300ms 間隔で自動的に再現実行するリプレイ機能や、デバッグモーダルのタブコンテキストに応じた `c` / `C` コピーキーの動的共通化をサポートします。
10. **イベント駆動型（Pub/Sub）アーキテクチャによる疎結合の実現**
    * アプリケーション内の状態変化や操作リクエストを型安全なイベント定数（`YuzoraEventType`）に基づき、`Publisher` クラスを用いた Publish/Subscribe パターンによって管理。コマンド実行層、表示描画層（ビューアー）、ユーザーインターフェース層（UI）を相互に依存させず疎結合にすることで、高い保守性と拡張性を維持します。
11. **ドメインモデル分離、Yuzora クラス抽出と Service Locator によるクリーン設計**
    * アプリケーションのビジネスデータや設定、永続化ロジック等を専用 of ドメインモデルクラス（`BookModel`, `ConfigModel`, `BookmarkModel`）とUIコンテキスト管理クラス（`ViewContext`）に明確に分離。また、コアとなる `Yuzora` クラスを独立したモジュールへ分割。これらは Service Locator（`Locator`）にインスタンス登録（`Yuzora.locator` 経由）されて解決されるため、隠れたグローバル変数や `window` プロキシ依存が完全に排除され、コンパイラの厳格モード（strict）による高度な型チェックと完璧な圧縮・難読化を支えています。
12. **画面遷移（シーン遷移）状態管理フレームワークによる一元管理**
    * アプリケーション全体の画面状態（ウェルカム画面 `#welcome-screen` ⇔ 読書画面 `#reader-screen`）の切り替えを、ライフサイクルメソッド（`enter`、`exit`）を持つ `Scene` クラスと `SceneDirector` クラスにより抽象化。遷移状態を一元制御し、遷移中の二重処理防止（`isTransitioning` ガード）を保証。さらに、画面の切り替えに連動してUIイベントリスナー（welcomeListeners / readerListeners）の動的登録および `removeEventListener` による漏れなき削除を完全自動化し、メモリリークと多重登録バグを恒久対策しました。
13. **URLハッシュベースの Router による履歴と状態のディスパッチ**
    * `location.hash` の値（`#/welcome`、`#/reader?book=xxx`、`#/reader?local=xxx`）を監視して画面状態や書籍ロードをディスパッチする `Router` を導入。これにより推奨書籍へのディープリンク（直リンク）や、ブラウザの「戻る」「進む」キーによる履歴操作、リロード時の自動復元といった標準的なWeb SPAとしての挙動を完全に実現しています。

---

## 🛠️ 技術スタック & アーキテクチャ

* **コア**: HTML5 / Vanilla CSS3 / Pure JavaScript (ES6)
* **フォント**: Google Fonts (Noto Serif JP, Outfit, Inter)
* **ビルドツール**: Google Closure Compiler (v20240317) / Makefile (開発効率と配布時のパフォーマンス向上のため、JavaScriptの難読化・軽量化をサポート)
* **構成**: フレームワークを使用しない、軽量なクライアントサイド静的SPA。GitHub Pages などの静的ホスティングで即時公開可能です。

---

## 📁 ディレクトリ構成

```
yuzora/
├── .github/workflows/static.yml   # GitHub Pages デプロイワークフロー
├── docs/                         # 要求仕様・要件・設計書ドキュメント類
│   ├── adr/                      # アーキテクチャ意思決定記録 (ADR)
│   │   ├── ADR-01-predefined-books-and-storage.md
│   │   └── ADR-02-cyclomatic-complexity-threshold.md # 循環的複雑度
│   ├── backlogs/                 # 将来の機能要望・改善のアイデア（台帳と個別要件）
│   ├── issues/                   # 現在進行中の開発課題・バグ
│   ├── threat-modeling/          # 包括的脅威モデリング結果（STRIDE分析等）
│   ├── MNG-01-document_ledger.md # 文書管理・ドキュメント台帳
│   ├── MNG-02-development_process.md # 開発プロセスおよび成果物定義書
│   ├── REQ-01-user_requirements.md # 要求定義書 (URD)
│   ├── REQ-02-feature_list.md    # 機能一覧 (Feature List)
│   ├── REQ-03-system_requirements.md # 要件定義書 (SRD)
│   ├── DSN-01-high_level_design.md # 基本設計書 (HLD)
│   ├── DSN-02-low_level_design.md  # 詳細設計書 (LLD)
│   └── USR-01-user_manual.md       # 操作マニュアル
├── src/                          # ソースコード
│   ├── books/                    # 同梱オススメ書籍データ（宮本武蔵、こころ、故郷）
│   ├── css/
│   │   ├── modules/              # 機能別分割スタイルシートファイル群
│   │   └── style.css             # 結合・生成されたアプリケーション共通スタイル
│   └── js/
│       ├── frameworks/           # アプリ非依存の汎用フレームワーク定義（locator.js, event.js, publisher.js, scene.js, router.js）
│       └── modules/              # Yuzoraドメインモジュールファイル群（config.js, viewer.js, ui.js, commands.js等）
├── tools/                        # ビルド用外部ツール（Closure Compiler 実行jar等）
├── Makefile                      # ビルドコマンド定義 (make main-min.js)
├── index.html                    # メイン HTML (SPA エントリポイント - 開発用)
├── compiled.html                 # リリース検証用 HTML (main-min.js 読み込み)
├── LICENSE                       # ライセンスファイル
└── README.md                     # 本ファイル
```

---

## 🚀 ローカルでの実行方法 (Local Running)

### 開発用 (index.html の実行)
本アプリは完全に静的なSPAであるため、ローカルで動かすには簡易Webサーバーを起動するだけです。

1. **Python3を使用する場合**
   ```bash
   python3 -m http.server 8000
   ```
2. **Node.js (npx serve) を使用する場合**
   ```bash
   npx serve .
   ```

起動後、ブラウザで [http://localhost:8000](http://localhost:8000) または表示されたアドレスへアクセスしてください。

### リリース検証用 (compiled.html の実行)
1. ワークスペースルートでビルドを実行して `main-min.js` を生成します。
   ```bash
   make
   ```
2. 簡易Webサーバーを起動後、ブラウザで `http://localhost:8000/compiled.html` へアクセスしてください。
3. ビルド成果物の削除：
   ```bash
   make clean
   ```

---

## ⚖️ ライセンス (License)

本ソフトウェアは [Apache License 2.0](./LICENSE) のもとで公開されています。