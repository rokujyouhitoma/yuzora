# Changelog / 変更履歴

All notable changes to this project will be documented in this file.

## [Unreleased]

- Fixed 目次（TOC）ジャンプ先がRTL縦書き時に微小にずれる（および画面の左側に寄ってしまう）問題を解消。見出し要素の物理的な開始端と終了端（`left` と `right`）から算出した「要素の中心絶対座標（Horizontal Center）」を基準にジャンプ先論理ページを計算するようにし、マージンや字下げ、ブラウザのカラム回り込みに伴う境界判定の誤作動を完全に防止 (ID: 008 - Issue)。
- Changed [DSN-02]（詳細設計書）に、RTL縦書きおよびLTR表示時における見出し要素物理中心から遷移先ページを決定する絶対座標の数学的アルゴリズム（Section 7.4）を追記 (ID: 008 - Issue)。

- Added [MNG-09] ユーザー操作履歴を Command パターンとして抽象化し、シリアライズ可能にする実装を完了 (ID: 009 - Issue)。
- Added デバッグ画面の「システム状態」タブ内に、操作履歴JSONを表示・編集できるテキストエリアおよび履歴のエクスポート/リプレイ機能（ボタンコントロール等）を実装 (ID: 009 - Issue)。
- Changed デバッグモーダルが開いている状態でのキーボードショートカット `c` / `C` コピーキーの挙動を、アクティブなタブ（システム状態 vs レイアウト診断）に応じて動的にコピー対象（履歴JSON vs 診断レポートMarkdown）を切り替えるよう共通化 (ID: 009 - Issue)。
- Changed `CommandManager` に最大履歴100世代までの制限と FIFO 破棄、および先頭の `LoadBookCommand` 固定的保護（初期ロードデータ保護）ロジックを実装 (ID: 009 - Issue)。
- Changed 履歴インポート時の構文エラーや不正配列に対する `try-catch` 例外処理・警告ダイアロックフォールバックによるセキュリティと堅牢性の向上 (ID: 009 - Issue)。
- Fixed `LoadBookCommand.execute()` にて、ファイル名描画には `textContent` を用い、本文表示時には Aozora HTML パースとサニタイズ処理を強制適用することでインポート履歴からのXSS脆弱性を完全に防止 (ID: 009 - Issue)。
- Added `tests/unit/app.test.js` に `CommandManager` の 100世代制限、FIFO＆LoadBook保護、JSONシリアライズ、例外捕捉エラーハンドリング等の自動ユニットテストを追加し、すべて正常パスを確認 (ID: 009 - Issue)。

- Added [MNG-09] バックログ 012 から、ユーザー操作履歴の Command パターン化実装用タスクとして [Issue 009](docs/issues/009-command-pattern-operation-history.md) を起票し、詳細な実装方針および DoD の精査（In Progress）を完了。
- Changed [MNG-09] 目次表示およびジャンプ機能 (TOC) バックログ (docs/backlogs/closed/005-table-of-contents-toc.md) を、実装完了に伴い Closed に更新し、アーカイブディレクトリへ移動。
- Added [MNG-09] 目次ドロワーのキーボード・スクリーンリーダー向けアクセシビリティ向上バックログ (docs/backlogs/013-toc-accessibility-enhancement.md) を起票 (ID: 013)。
- Changed [MNG-09] Commandパターンによるユーザー操作履歴の抽象化とデバッグ用シリアライズ対応バックログ (docs/backlogs/012-command-pattern-operation-history.md) を精査し、最大世代数制限（100世代および本のロードコマンド保護）を追加して Approved に更新 (ID: 012)。
- Added [MNG-09] 画面・機能ごとの開発用ファイル分割と最終生成物のバンドル統合化バックログ (docs/backlogs/011-modularize-src-by-screen-and-bundle.md) を起票 (ID: 011)。
- Added [MNG-09] 大容量テキストのインクリメンタルパースおよびレンダリングバックログ (docs/backlogs/007-incremental-text-parsing.md) を起票 (ID: 007)。
- Added [MNG-09] レイアウト診断レポート生成の非同期・タイムスライス化バックログ (docs/backlogs/008-async-layout-diagnostics.md) を起票 (ID: 008)。
- Added [MNG-09] しおり書き込み処理の非同期アイドル実行化バックログ (docs/backlogs/009-async-bookmark-storage.md) を起票 (ID: 009)。
- Added [MNG-09] 起動時オススメ書籍グリッドの遅延レンダリングバックログ (docs/backlogs/010-lazy-loading-predefined-books.md) を起票 (ID: 010)。
- Changed [MNG-09] 非同期処理による目次抽出および描画の高速化バックログ (docs/backlogs/006-async-toc-generation.md) を精査し、ステータスを Approved に更新 (ID: 006)。
- Added 目次表示およびジャンプ機能 (TOC) のUI（目次ボタンおよび目次ドロワー）を追加 (ID: 005 - Backlog)。
- Changed 見出しの階層レベルに応じたインデントと視覚表現（中見出し・小見出しの箇条書きマーク）の追加 (ID: 005 - Backlog)。
- Changed RTL縦書き表示時のマルチカラムスクロール座標系に対応した精密な見出しジャンプ計算ロジック（`getBoundingClientRect()` 基準）を実装 (ID: 005 - Backlog)。
- Changed スムーズスクロール完了後に `preventScroll` オプション付きでジャンプ先見出し要素へフォーカス（`focus()`）を当てるアクセシビリティ向上制御を導入 (ID: 005 - Backlog)。
- Fixed `index.html` 内のインライン `style="..."` 属性をすべて `src/css/style.css` のクラス定義へ移行し、Content Security Policy (style-src 'self') の違反警告を完全に解消 (ID: 005 - Backlog)。
- Fixed ユニットテストランナー実行時に、残存する JSDOM タイマーが原因でテストプロセスが終了せずハングする問題を `app.test.js` に `process.exit(0)` を追加することで解消 (ID: 005 - Backlog)。
- Changed [MNG-09] 目次表示およびジャンプ機能 (TOC) のバックログ要件 (docs/backlogs/005-table-of-contents-toc.md) を精査し、ステータスを Approved に更新 (ID: 007)。
- Changed エージェント行動規範 (.agents/AGENTS.md) に、新スキル (create-backlog, polish-backlog) によるバックログ管理ルールを追記 (ID: 007)。
- Changed ドキュメント構成の拡張に伴い、docs/README.md およびルートの README.md のディレクトリ構造記述を更新 (ID: 007)。
- Changed [MNG-02] 開発プロセスドキュメント (docs/MNG-02-development_process.md) に、新スキル (create-backlog, polish-backlog) とドキュメント (MNG-09) の三位一体対応セクションを追記し、関係性を整理 (ID: 007)。
- Added [MNG-09] バックログ精査用スキル (.agents/skills/polish-backlog/SKILL.md) を新設 (ID: 007)。
- Added [MNG-09] バックログ管理をマルチファイル構造（docs/backlogs/*.md および docs/backlogs/README.md）に移行し、MNG-01 ドキュメント台帳を更新 (ID: 007)。
- Changed [MNG-09] create-backlog スキルを個別バックログファイルの自動生成および台帳追記手順に更新 (ID: 007)。
- Added [MNG-09] バックログ登録用スキル (.agents/skills/create-backlog/SKILL.md) を新設 (ID: 007)。
- Added [MNG-09] 目次表示およびジャンプ機能 (TOC) をバックログ (BACKLOG-005) に登録 (ID: 007)。
- Fixed [T-I1] Content Security Policy (CSP) メタタグを index.html に導入し、外部へのコネクション制限 (connect-src 'self') および不要なリソース取得を制限して情報漏洩を防止 (ID: 007)。

- Fixed [T-E2] HTMLファイル読み込み時のXSS脆弱性の解消。ホワイトリスト方式のHTMLサニタイズ処理 (sanitizeDOM) を実装し、危険なタグやイベントハンドラを除去するように改善 (ID: 006)。
- Changed ドキュメント内のファイルリンクにおいて環境依存の絶対パスを禁止し、相対パスの使用を義務付けるルールを docs/MNG-02-development_process.md および .agents/AGENTS.md に追加 (ID: 006)。

- Fixed [T-E1] parseAozoraText の開始時にHTML特殊文字を一括エスケープし、タイトルや著者メタデータ等も含めたXSS脆弱性を解消 (ID: 005)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) に、システムデータフロー図 (DFD) および STRIDE詳細脅威分析結果シートを追記 (ID: 004)。
- Added [MNG-07] 脅威モデリング定義書 (docs/MNG-07-threat_modeling.md) および脅威モデリング実行スキル (.agents/skills/threat-modeling/SKILL.md) を新設 (ID: 003)。
- Changed 開発哲学・マニフェスト (MNG-00) に「セキュリティ・バイ・デザイン」および「セキュア・バイ・デフォルト」を核心原則として追加 (ID: 003)。
- Changed 開発プロセス、問題管理、変更管理ドキュメント (MNG-02〜04) および既存スキル (polish-issue, review-diff-code) を脅威モデリングプロセスに適合するよう改定 (ID: 003)。
- Changed ドキュメント (MNG-01〜MNG-04) およびスキル (.agents/skills/*) を `MNG-00` に適合させ、三位一体モデルやドキュメント駆動開発の追跡性を強化 (ID: 002)。
- Fixed `docs/MNG-02-development_process.md` 内の文字コード崩れをクレンジング修復 (ID: 002)。
- Added [MNG-00] 開発哲学・マニフェスト (`docs/MNG-00-development_philosophy.md`) を新設し、プロダクト理念、UI/UX設計思想、運用統制の管理策、および三位一体連携モデルを集約。
- Added [MNG-09] バックログ管理プロセス定義書 (`docs/MNG-09-backlog_process.md`) を新設し、将来の要望やロードマップのプールを分離。
- Added [MNG-06] Active Issues台帳 (`docs/issues/README.md`) を新設し、現在進行中のオープンな課題を一元追跡。
- Added 完了（Closed）したIssueチケットを `docs/issues/closed/` に移動するアーカイブ規則を導入。
- Changed `create-issue`, `polish-issue`, `git-workflow` の各スキル手順書を更新し、メタデータブロックによるステータス（Open/Closed）の明示管理および台帳・移動ワークフローとの連携を組み込み。
- Changed [MNG-01] (文書台帳) および [MNG-02] (開発プロセス) から散らばっていた哲学解説をカットし、`MNG-00` への参照リンクへ一元・簡素化。
- Changed 既存の `docs/issues/001-page-left-right-overrun.md` のフォーマットを新バグテンプレートへ追従。
- Changed `src/css/style.css` のカラム幅（`column-width`）の計算式を `vw` ベースに修正し、端数計算誤差によるカラムズレを解消 (ID: 001)。
- Added テストキャプチャ自動化用の E2E 検証スクリプト (`tests/e2e/diagnose.spec.js`) をリポジトリに追加。
