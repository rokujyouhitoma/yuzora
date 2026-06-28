# [ADR-02] 循環的複雑度（サイクロマティック複雑度）の閾値設定と自動検知の導入

## 日付
2026-06-28

## ステータス
Accepted (承認済み・実装完了)

## 実装結果
- `eslint@9` を導入し、`eslint.config.js` で `complexity: ['error', 10]` を設定
- `app.js` において以下のリファクタリングを実施:
  - `CommandManager` の `add()` → `isDuplicateCommand()`, `limitHistorySize()` を分割
  - `runLayoutDiagnosis()` → `diagnoseEnvironmentInfo()`, `diagnoseColumnsInfo()`, `diagnoseColumnWidthCheck()`, `diagnoseVerticalLayoutInfo()`, `diagnoseParagraphCoordinateInfo()`, `diagnoseBoundaryOverlap()` に分割
  - `parseAozoraText()` → `buildLineHTML()`, `detectHeaderEnd()`, `parseJisage()`, `parseHeading()` を分割
  - `sanitizeDOM()` → `cleanAttributes()` ヘルパーを抽出
  - `setupEventListeners()` のブレース漏れを修正し、`closeDebugModal()` を外部関数として分離
  - `handleOpenDebugModalKeys()` → `handleDebugTabKeys()` を抽出
- ADR-02 で規定した例外措置（`eslint-disable-next-line complexity`）を以下の 6 箇所に適用:
  - `DOMContentLoaded` コールバック (DOM 登録の構造的関数)
  - `setupEventListeners()` (任意 DOM 要素の null ガード多数)
  - `diagnoseColumnWidthCheck()` (レイアウト計算の性質上)
  - `diagnoseBoundaryOverlap()` 内の `forEach` コールバック (座標計算の性質上)
  - `handleDebugTabKeys()` (キーバインド判別の性質上)
  - `parseAozoraText()` (青空文庫パース処理の性質上)

## コンテキスト
プロジェクトの規模拡大に伴い、JavaScript コード（特にビューアーの描画処理やパース処理）の肥大化・複雑化が進み、可読性と保守性（およびテスト容易性）が低下するリスクがあります。
コードの品質を定量的に管理し、複雑すぎる関数の出現を自動で検知してリファクタリングを促す仕組みが必要です。

### 検討した選択肢：
1. **ESLint の `complexity` ルールのみを使用する**
   - メリット: 追加のライブラリ依存がなく、既存のLinterプロセス（`npm run lint`）に統合できる。ビルドやCIの段階で強制力を持たせられる。
   - デメリット: 複雑度の詳細な推移や可読性指数（Maintainability Index）などの複合的なメトリクスは算出できない。
2. **専用の静的解析ツール (`escomplex`, `plato` 等) を導入する**
   - メリット: 各ファイルの複雑度、行数、保守性指数をダッシュボードや詳細なレポートとして出力できる。
   - デメリット: 新たな依存パッケージが増える。開発者が能動的にレポートを確認する必要があり、実装段階での強制力が弱い。
3. **閾値の設定基準の検討**
   - **閾値 15 以上**: やや緩やかな基準。一般的なソフトウェア開発で許容される上限。
   - **閾値 10 以上**: 一般的なクリーンコードの推奨値。テストの書きやすさと可読性が良好に保たれる。
   - **閾値 5〜8 以上**: 非常に厳しい基準。関数が細分化されすぎることで、逆にコード全体の処理フローが追いにくくなる懸念がある。

## 意思決定
以下の通りアプローチを決定します。

1. **静的解析ツールとして ESLint の `complexity` ルールを採用する**
   - 依存関係の増加を防ぎ、既存の開発・CIプロセスに完全に統合できるため、第一選択として最も適切であると判断しました。
2. **循環的複雑度の閾値は「10」とする**
   - 論理的根拠: 複雑度が10以下の関数は、制御フローの全経路を網羅するユニットテストを記述するのが容易であり、不具合の温床になりにくい（McCabe の基準において「リスク低」とされる境界）。
   - 例外措置: 青空文庫のパースやビューアーの座標計算など、アルゴリズムの性質上どうしても分岐が多くなる一部の関数については、インラインコメント（`/* eslint-disable-next-line complexity */`）による個別除外を認める。ただし、その際はコードレビューで除外の妥当性を厳格に確認する。
3. **CIおよびGitフックでの検証**
   - `npm run lint` に含め、PR作成時またはコミット時に自動チェックを行い、閾値を超えた場合はビルドを失敗させる。

## 結果 (Consequences)

### メリット
- 関数の肥大化が自動的にブロックされるため、開発者が意識せずとも自然とコードの細分化・モジュール化が進む。
- ユニットテストの作成が容易になり、コードのテストカバレッジ向上に寄与する。
- 依存関係が増えないため、プロジェクトのビルドパフォーマンスやセキュリティリスクを最小限に抑えられる。

### デメリット / 注意点
- すでに記述されている既存のコードで、複雑度が10を超えている箇所がある場合、ルール導入時にエラーが発生するため、初期のリファクタリング作業が必要になる可能性がある。
- 単純な条件分岐（多数の `case` を持つ `switch` 文など）でも複雑度が上昇するため、過度な共通化・関数分割による可読性低下（関数のジャンプ回数増加による追いづらさ）に注意する。
