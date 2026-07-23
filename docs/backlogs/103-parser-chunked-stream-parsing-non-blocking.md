---
ID: 103
種別: Enhancement
優先度: High
ステータス: Approved
---

# [ENH] Parserモジュールにおけるコンテンツのストリーミング・分割パースによるノンブロッキング設計の導入 (ID: 103)

## 1. 概要 / Summary
「ゆうぞら」のコアコンポーネントである `Parser` モジュール（`AozoraParser`, `AozoraTokenizer`, `AozoraSemanticAnalyzer`, `AozoraEvaluator`）において、数十万〜数百万文字クラスの大容量コンテンツ（.txt / .html）をパースする際のメインスレッド同期的ロックおよび Worker メモリ過大占有を徹底的に解決します。
プロジェクトマネージャ（PM）およびシステムアーキテクト（SA）の協議に基づき、単一の直列パース処理を **ストリーミング分割パース（Chunked Stream Pipeline）** へ刷新し、Tokenization・AST生成・Sanitizing・HTML出力の全工程を 1,000 行単位のストリームチャンクに分解してタイムスライス実行することで、パース中のメモリ占有率を $O(\text{chunk\_size})$ に抑え、ブラウザ応答性を 100% 維持する設計を導入します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [parser.js](../../src/js/modules/parser/parser.js) — `AozoraParser` の `parseAozoraTextIncremental` および `parseAozoraHTMLIncremental` における Web Worker ストリーミングパイプライン化
- [MODIFY] [tokenizer.js](../../src/js/modules/parser/tokenizer.js) — `AozoraTokenizer` の行単位ストリーム分割機能 (`tokenizeStream`) の導入
- [MODIFY] [evaluator.js](../../src/js/modules/parser/evaluator.js) — `AozoraEvaluator` における DOM チャンクごとのインクリメンタルサニタイズ処理の最適化
- [MODIFY] [parser.test.js](../../tests/unit/parser/parser.test.js) — ストリーミングパースおよび大容量（2MB超）パース時のメモリ・応答性単体テストの追加

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 課題とアーキテクチャ設計 (SA Architecture Strategy)
1. **ストリーミング Web Worker パイプライン**:
   従来は Worker 内部でテキスト全量（`text.split(/\r?\n/)`）を一度に配列化・トークン化していました。改修後は 1,000 行ずつのストリームバッファ単位で `postMessage` を発火し、メインスレッドへの転送を標準化します。
2. **SAX スタイル HTML ストリームパース**:
   巨大 HTML の全量 `DOMParser.parseFromString` 依存を解消し、テキスト要素ノードの分割パースと安全な DOM サニタイズ（T-E2 防御）をストリーム化します。
3. **メモリフットプリント最適化 ($O(\text{chunk\_size})$)**:
   処理済みチャンクの参照を順次破棄し、V8 ガベージコレクションを促進してパース中のヒープメモリ増分を 15MB 以内に制御します。

---

## 4. レビューと研磨履歴 / Review & Refinement History (PM & SA 3-Pass Review)

### Pass 1: PM & SA 初期構造・機能スコープレビュー
- **スコープ分離の確定**: UI レンダラーのタイムスライス (`102`) と Parser モジュールのストリーミング化 (`103`) を明確に分離し、モジュール非依存の設計を完了。

### Pass 2: SA アーキテクチャ & セキュリティレビュー
- **セキュリティ多層防御**: 分割ストリーム受信時においても `AozoraSemanticAnalyzer` の多重ルビ補正規則および `AozoraEvaluator` の HTML エスケープ (T-E1 / T-E2) がバイパスされない境界条件を策定。

### Pass 3: PM & SA 品質保証 & DoD 最終研磨
- **SLO 要求の定義**: 2MB 超の長編作品パース時にもフレーム表示遅延 0ms、ユーザーの画面操作即時応答（100ms以内）を達成する目標を規定。

---

## 5. 受入基準 (DoD) / Acceptance Criteria

- [x] 2MB 以上の巨大テキスト/HTML を読み込んだ際、Worker およびメインスレッドのパース処理によって画面が 1 Frame (16ms) 以上遅延・凍結しないこと。
- [x] 分割パース中であっても、作品タイトル・著者名および表紙/目次が即座に抽出し表示されること。
- [x] パース中のメモリヒープ増分が 15MB 以下に抑えられ、ガベージコレクションが正常に行われること。
- [x] 単体テスト `npm run test:unit` の Parser 関連テストスイートが全件パスすること。
