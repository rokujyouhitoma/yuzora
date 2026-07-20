# ゆうぞら (Yuzora) - ドキュメント構造と管理規約 (Documentation Ledger & Rules)

本ディレクトリ（`docs/`）は、「ゆうぞら (Yuzora)」プロジェクトにおけるすべての設計、要件、および開発管理用のドキュメント（Single Source of Truth: SOT）を格納しています。

すべてのドキュメントの整合性と品質を維持するため、開発および保守にあたっては以下の構成および管理ルールを厳守してください。

---

## 1. ドキュメント構成 (Directory Structure)

本プロジェクトのドキュメントは、目的と性質ごとに分類プレフィックス（2〜3桁のアルファベット）＋2桁の連番で管理されています。

* **`docs/requirements/` (`REQ-xx` / Requirements)**: 要求定義、機能一覧、システム要件定義などの上流仕様・制約ドキュメント。
* **`docs/designs/` (`DSN-xx` / Design)**: システムアーキテクチャや論理設計を定義する基本設計（HLD / DSN-01）および、クラス・物理仕様を定義する詳細設計（LLD / DSN-02）。
* **`docs/processes/` (`MNG-xx` / Management)**: 文書管理台帳、開発・変更・問題管理プロセス、システムテスト仕様書（MNG-05）などの管理・検証ドキュメント。
* **`docs/manuals/` (`USR-xx` / User Documentation)**: 操作マニュアルなどの一般ユーザー向けガイド。
* **`docs/adr/` (`ADR-xx` / Architecture Decision Records)**: 重要な技術選定や設計決定とその背景の記録。
* **`docs/backlogs/`**: 将来の機能要望、改善案などのアイデア。
* **`docs/issues/`**: 現在アクティブな開発課題、バグ。
* **`docs/threat-modeling/`**: STRIDE に基づくセキュリティ脅威分析結果シート。
* **`docs/phases/`**: 開発ライフサイクルの各フェーズ進行状況を追跡する台帳。

> [!NOTE]
> 各文書の具体的な役割、想定読者、およびすみ分け規則の詳細については、[[MNG-01] 文書管理・ドキュメント台帳](processes/MNG-01-document_ledger.md) を参照してください。

---

## 2. 文書管理規約 (Documentation Rules)

開発メンバー（人間およびAIエージェント）がドキュメントを作成・編集・削除する際は、以下のルールに必ず従わなければなりません。

### Rule 1: 相対パスリンクの義務化 (Relative Path Link Rule)
* ドキュメント間やソースコードへのハイパーリンクを作成する際は、環境依存を防ぎポータビリティを担保するため、絶対パス（例: `file:///...`）を**一切使用してはなりません**。
* すべての相互参照は、相対パス（例: `[MNG-01](processes/MNG-01-document_ledger.md)` や `[yuzora.js](../src/js/modules/core/yuzora.js)`) で記述してください。

### Rule 2: ドキュメント先行更新 (Doc-First Principle)
* 機能の追加や仕様の変更が発生した際は、必ずソースコードの修正に先立ち、または並行して該当するドキュメント（要件定義書、基本設計書、詳細設計書等）を更新します。
* 設計が死文化（形骸化）した状態での開発やコードのコミットは厳格に排除されます。

### Rule 3: 情報の一元化と重複排除 (Single Source of Truth)
* 同一の仕様や実装詳細を複数のドキュメントに重複して記述しないでください。
* 競合が発生した場合の分掌ルール（例: 要件定義が基本設計より優先されるなど）は、[[MNG-01] 文書管理・ドキュメント台帳](processes/MNG-01-document_ledger.md) の棲み分け定義に従って一元管理してください。

### Rule 4: 登録管理制 (Document Control)
* 新たなドキュメントを作成・削除する際は、必ず [[MNG-01] 文書管理・ドキュメント台帳](processes/MNG-01-document_ledger.md) の台帳に事前登録し、一意の管理番号（プレフィックス＋連番）を発行してください。
* ドキュメントの変更や削除を行った際は、他のドキュメントからの参照リンクが崩れていないか確認し、デッドリンクを完全に防止してください。

### Rule 5: CHANGES.md および README.md の同期更新義務 (Changelog & Readme Sync Rule)
* 機能の追加、バグ修正、またはドキュメントの重大な再構成を行った際は、コミットおよびマージの前に、必ず以下の2ファイルを更新・確認しなければなりません。
  1. **[CHANGES.md](../CHANGES.md)**: 変更内容（Added, Changed, Fixed, Deprecated 等）を conventional commit に準拠した形で正確に追記します。
  2. **[README.md](../README.md)**: 導入された新機能や設定項目が、ルートの README の説明と乖離していないか確認し、必要に応じて説明を最新化します。

