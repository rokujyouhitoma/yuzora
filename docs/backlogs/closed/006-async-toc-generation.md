---
ID: 006
種別: Enhancement
優先度: Low
ステータス: Promoted
---

# [ENH] 非同期処理による目次抽出および描画の高速化 (ID: 006)

## 1. 概要 / Summary
大容量の青空文庫テキストをロード・レンダリングする際の初期表示パフォーマンスを最優先とするため、目次（TOC）関連の処理を非同期化・遅延評価にし、UIのレンダリングブロック（カクつき）やレイアウトスラッシング（強制再レイアウト）を解消します。

現在、`buildTOCList()` の中で目次項目ごとに `getBoundingClientRect()` を同期的に実行して現在のアクティブ行を判定しており、見出し数が多い場合に開閉時のアニメーションや表示に遅延が発生する原因となっています。また、パース直後の目次データ構築も同期的に行われています。

本機能拡張では、以下の対応を行います：
1. 目次データの構築処理および初期化処理を遅延（`setTimeout` 等による非同期タスク）実行とし、初期描画とスクロール復元を最優先する。
2. スクロールに追従するアクティブ見出しの判定に `IntersectionObserver` を導入し、描画スレッドに負荷をかける同期的な座標判定（レイアウトスラッシング）を完全に排除する。
3. 目次ドロワー表示の際、`DocumentFragment` と `requestAnimationFrame` による分割（チャンク化）描画を導入し、アニメーションの60FPS維持と progressive rendering を実現する。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [config.js](../../src/js/modules/config.js) (アクティブ見出しID等のグローバル変数の追加)
- [viewer.js](../../src/js/modules/viewer.js) (書籍ロード時の非同期オブザーバー初期化呼び出しの追加)
- [ui.js](../../src/js/modules/ui.js) (目次の IntersectionObserver の実装、および buildTOCList() の chunked レンダリング化)

---

## 3. 要件と技術的アプローチ / Requirements & Technical Approach

1. **スクロール位置監視とアクティブ見出し判定 (`IntersectionObserver`)**:
   - `ui.js` に見出しを監視する `IntersectionObserver`（`tocObserver`）を定義します。
   - 書籍表示および初期位置スクロール完了後のタイミングで `setupTOCObserver()` を実行し、すべての見出し（`currentTOC` 内の id 要素）をオブザーバーに登録します。
   - ビューポート内に入った見出しを非同期で検知し、最後に交差した見出しのIDを `activeHeadingId`（config.js 内で保持）に設定します。これにより、ドロワー開閉時の同期的な `getBoundingClientRect()` 呼び出しを完全に廃止します。

2. **目次描画のチャンク化 (Progressive Rendering)**:
   - 目次ドロワー構築関数 `buildTOCList()` において、`DocumentFragment` を使用してバッチ DOM 挿入を行います。
   - `requestAnimationFrame` を用いて、1フレームあたり一定件数（例: 100件）ずつ分割して DOM 項目を生成・追加します。これにより、ドロワー開閉アニメーション中のメインスレッド占有を防ぎ、カクつきのない開閉を実現します。
   - 各目次アイテムに `data-heading-id` を付与し、`tocObserver` のコールバックで `activeHeadingId` が更新された際は、ドロワーが開いている場合のみ該当アイテムの `.active` クラスをリアルタイムに更新（`updateActiveTOCItemUI()`）します。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] 大容量の書籍データ（1MB以上、見出し数100件以上）をロードした際、初期ロードやスクロールの復元がスムーズに行われ、目次解析による遅延が発生しないこと。
- [ ] 目次ドロワーを開く際のアニメーションがカクつかず、60FPSで動作すること。
- [ ] 目次構築時に `getBoundingClientRect()` が一切呼び出されず、`IntersectionObserver` 経由で非同期にアクティブ位置が特定されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] 本実装は、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
