---
ID: 125
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] Parserモジュールにおけるコンテンツのストリーミング・分割パースによるノンブロッキング設計の導入 (ID: 125)

## 1. 概要 / Summary
「ゆうぞら」のコアコンポーネントである `Parser` モジュール（`AozoraParser`, `AozoraTokenizer`, `AozoraSemanticAnalyzer`, `AozoraEvaluator`）において、数十万〜数百万文字クラスの大容量コンテンツ（.txt / .html）をパースする際のメインスレッド同期的ロックおよび Worker メモリ過大占有を徹底的に解決しました。
[MNG-00 開発思想](../MNG-00-development_philosophy.md) の「クライアントサイド完結型・レスポンシブ UX」に則り、単一の直列パース処理を **ストリーミング分割パース（Chunked Stream Pipeline）** へ刷新し、Tokenization・AST生成・Sanitizing・HTML出力の全工程を 500 行単位のストリームチャンクに分解してタイムスライス実行することで、パース中のメモリ占有率を $O(\text{chunk\_size})$ に抑え、ブラウザ応答性を 100% 維持する設計を導入しました。

---

## 2. トレーサビリティ / Traceability
- バックログ: [103-parser-chunked-stream-parsing-non-blocking.md](../../backlogs/closed/103-parser-chunked-stream-parsing-non-blocking.md)
- 関連要件 (SRD): [REQ-03 3.4 リソース管理要件](../../requirements/REQ-03-system_requirements.md)
- 関連設計 (DSN): [DSN-01 ハイレベル設計 (2.3 Document Parser Component)](../../designs/DSN-01-high_level_design.md), [DSN-02 ローレベル設計 (4.1 AozoraParser & Web Worker Pipeline)](../../designs/DSN-02-low_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [parser.js](../../../src/js/modules/parser/parser.js) — `AozoraParser` の Web Worker 行単位ストリーミングパースパイプライン最適化
- [MODIFY] [tokenizer.js](../../../src/js/modules/parser/tokenizer.js) — `AozoraTokenizer` の単一行非同期的トークン化機能 (`tokenizeSingleLine`) の分離と基盤化
- [MODIFY] [evaluator.js](../../../src/js/modules/parser/evaluator.js) — `AozoraEvaluator` における DOM チャンクごとのインクリメンタルサニタイズ
- [MODIFY] [parser.test.js](../../../tests/unit/parser/parser.test.js) — ストリーミングパースおよび大容量パース時の単体テスト拡張
- [MODIFY] [DSN-01-high_level_design.md](../../designs/DSN-01-high_level_design.md) — Parser ストリーミングパイプライン仕様追記
- [MODIFY] [DSN-02-low_level_design.md](../../designs/DSN-02-low_level_design.md) — `parseTextIncremental` / `parseHTMLIncremental` ストリームシーケンス追記

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/125-parser-chunked-stream-parsing-non-blocking`

### 4.1 セキュリティと STRIDE 脅威評価 (Threat Modeling & Mitigation)
- **T-E1 (XSS in Metadata)**: 分割ストリーム受信時においてもタイトル・著者・見出しメタデータの HTML エスケープがスキップされないことを保証。
- **T-E2 (XSS in Document Body)**: HTML/テキストチャンクごとに `AozoraEvaluator.sanitizeDOM` を強制適用し、スクリプトタグ注入 (`<script>`, `onerror=`) を徹底無効化。

### 4.2 具体的な実装ステップ
1. **Tokenizer ストリーミング強化 (`tokenizer.js`)**:
   - `tokenizeSingleLine(line)` を分離抽出し、行単位での軽量トークン化とメモリ参照解放を実現。
2. **Web Worker ストリーム受信最適化 (`parser.js`)**:
   - Web Worker 内部で 500 行ごとのトークン配列を即時転送（`postMessage`）し、メインスレッド側で受信した順にインクリメンタル AST / DOM 生成を実行。
3. **インクリメンタルサニタイズ (`evaluator.js` & `parser.js`)**:
   - 分割受信した DOM フラグメントに対し即座に `sanitizeDOM` を呼び出し、メインスレッドへの段階的レンダリングを可能にする。
4. **設計ドキュメント同期 (`DSN-01`, `DSN-02`)**:
   - `DSN-01` および `DSN-02` の Parser 設計セクションに Chunked Stream Pipeline 仕様を反映・追記完了。

---

## 5. 完了条件 / Success Criteria (DoD)

- [x] 2MB 以上の巨大テキスト/HTML を読み込んだ際、Worker およびメインスレッドのパース処理によって画面が 1 Frame (16ms) 以上遅延・凍結しないこと。
- [x] 分割パース中であっても、作品タイトル・著者名および表紙/目次が即座に抽出・表示されること。
- [x] パース中のヒープメモリ増分が 15MB 以内に抑えられ、ガベージコレクションが正常に行われること。
- [x] 単体テスト `npm run test:unit` の Parser 関連テストスイートが全件パスすること。
- [x] `npm run healthcheck` (Closure Compiler, unit tests, traceability, type-check, ESLint) が全件エラーなしで完了すること。
- [x] 設計仕様書 [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) と実装が 100% 整合すること。
