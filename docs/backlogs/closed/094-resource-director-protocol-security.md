---
ID: 094
種別: Enhancement
優先度: High
ステータス: Closed
---

# [ENH] ResourceDirector における不審プロトコル制限と Spoofing 防御の強化 (ID: 094)

## 1. 概要 / Summary
「ゆうぞら」における外部・ローカルリソースのローディング統括クラス `ResourceDirector` において、不審な URL スキーム指定や外部オリジンからのデータロードによる Spoofing（T-S2: なりすまし）およびスクリプト実行を遮断します。
セキュリティスペシャリスト（SC）の要請に基づき、`ResourceDirector.prototype._isAllowedOrigin` 内で `javascript:`, `data:`, `blob:` などの危険なスキームを厳格に拒否し、Same-Origin ポリシーに準拠する通信境界を強制します。

---

## 2. 影響範囲と関連ファイル / Scope & Affected Files

- [MODIFY] [resource-director.js](../../src/js/modules/storage/resource-director.js) — `ResourceDirector.prototype._isAllowedOrigin` 内での不審プロトコルチェックおよび Same-Origin 検証の強化
- [MODIFY] [repository.test.js](../../tests/unit/storage/repository.test.js) — 外部オリジンおよび `javascript:`, `data:` スキームブロックのセキュリティユニットテストの追加

---

## 3. 要件と技術的詳細 / Requirements & Technical Details

### 3.1 スキームおよび Origin 検証アルゴリズム
- ロード対象 URL に対し、小文字化した文字列に対するブラックリスト検証 (`javascript:`, `data:`, `blob:`) を実施し、合致した場合は即座に判定偽 (`false`) を返却。
- 相対パス (`src/books/*.txt` 等) を許可しつつ、絶対 URL (`http://`, `https://`, `//`) が指定された場合は `new URL(url, window.location.href)` を用いてオリジンを算出し、`target.origin === window.location.origin` の Same-Origin 条件のみを許可する。
- 許可されないソースが指定された場合、`loadBook` は即座に `Security Error` 例外をスローし処理を強制終了する。

---

## 4. 受入基準 (DoD) / Acceptance Criteria

- [x] `javascript:alert(1)` や `data:text/html,...` などの悪意あるスキームが `ResourceDirector.loadBook()` に渡された際、セキュリティエラーとして確実に拒否されること。
- [x] クロスオリジン (`http://example.com/malicious.txt`) からのアセットフェッチ要求がブロックされること。
- [x] ユニットテスト `npm run test:unit` における Spoofing 防御テストケースが正常にパスすること。
