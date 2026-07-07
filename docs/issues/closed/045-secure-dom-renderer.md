---
ID: 045
種別: Feature
優先度: Medium
ステータス: Closed
---

# [FEAT/ENH] セキュリティ・バイ・デザインに基づくセキュアレンダラーパターンの強制 (ID: 045)

## 1. 概要 / Summary
ゆうぞらは完全なクライアントサイド静的SPAであり、ユーザーが持ち込んだローカルのテキストやHTML、XHTMLファイルを読み込んでブラウザ上にレンダリングします。現在、XSS（クロスサイトスクリプティング）などの脆弱性対策として個別にエスケープやサニタイズを行っていますが、今後パース処理の複雑化や新規モジュールの追加に伴い、対策漏れによる脆弱性が再発するリスクがあります。

このリスクを根本から遮断するため、アーキテクチャレベルでの二重の防壁（Defense in Depth）を構築します。
具体的には、最終的に DOM にコンテンツを挿入する `Renderer.render()` において、流し込まれる HTML に対して強制的にホワイトリスト方式のサニタイズを適用する「セキュアレンダラー（Secure DOM Renderer）」パターンを導入・強制します。これにより、パース層（`parser.js`）等でエスケープ漏れや脆弱性があった場合でも、表示の最終フェーズで悪意のあるスクリプトや属性を確実に無害化します。

---

## 2. トレーサビリティ / Traceability
* 関連要求 (URD): URD-03 (セキュリティ)
* 関連要件 (SRD): SRD-05 (セキュリティ設計)
* 関連バックログ: [039-secure-dom-renderer.md](../backlogs/039-secure-dom-renderer.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
* [ ] [renderer.js](file:///workspace/yuzora/yuzora/src/js/modules/renderer.js) (MODIFY)
* [ ] [comprehensive-threat-modeling.md](file:///workspace/yuzora/yuzora/docs/threat-modeling/comprehensive-threat-modeling.md) (MODIFY)
* [ ] [DSN-02-low_level_design.md](file:///workspace/yuzora/yuzora/docs/DSN-02-low_level_design.md) (MODIFY)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/045-secure-dom-renderer`

### 4.1. `VerticalRenderer` へのサニタイズロジックの導入 (`renderer.js`)
* `VerticalRenderer.render(htmlContent)` メソッドにて、受け取った `htmlContent` 文字列を `DOMParser.parseFromString` を用いて非アクティブな Document としてパースします。
* パースされた DOM ツリーに対して、ホワイトリスト方式のサニタイズ（`this.sanitizeDOM(body)`）を実行します。
  - **許可するタグ**: `div`, `span`, `p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `a`, `ruby`, `rt`, `rp`, `br`, `img`, `b`, `i`, `strong`, `em`
  - **許可する属性**: `class`, `id`, `src`, `alt`, `href`
  - **属性制限**: 属性名が `on` で始まるインラインイベントハンドラ（例: `onerror`, `onload`）、および `href`/`src` 内の `javascript:` / `data:` / `vbscript:` スキームを完全に除去します。
* サニタイズ完了後、`viewContext.readerContent` の既存の子要素をクリアし、サニタイズ済みの DOM の子ノードを `appendChild` 等で直接移行します（安全かつ効率的な描画を強制し、`innerHTML` によるブラウザの再評価脆弱性を防ぎます）。

### 4.2. セキュリティ文書と設計書の更新
* `comprehensive-threat-modeling.md` 内の `T-E1` / `T-E2` 脅威シナリオの緩和策に、セキュアレンダラーによる二重防御策を追記します。
* `DSN-02-low_level_design.md` の `VerticalRenderer` クラスの仕様に、サニタイズ処理の詳細を追記します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `VerticalRenderer.render` において、`DOMParser` とホワイトリスト制限による安全な DOM 構築・移行が強制されること。
- [ ] サニタイズのユニットテストを `tests/unit/` に追加し、悪意ある `<script>` や `onerror` 属性等のインジェクション攻撃が適切に無力化されることを検証すること。
- [ ] 実装内容が設計ドキュメント ([DSN-02](../DSN-02-low_level_design.md)) および [comprehensive-threat-modeling.md](../threat-modeling/comprehensive-threat-modeling.md) に正しく同期されていること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。

