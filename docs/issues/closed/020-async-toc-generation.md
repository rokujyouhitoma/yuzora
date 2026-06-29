---
ID: 020
種別: Feature
優先度: Low
ステータス: Closed
---

# [FEAT/ENH] 非同期処理による目次抽出および描画の高速化 (ID: 020)

## 1. 概要 / Summary
大容量の青空文庫テキストをロード・レンダリングする際の初期表示パフォーマンスを最優先とするため、目次（TOC）関連の処理を非同期化・遅延評価にし、UIのレンダリングブロック（カクつき）やレイアウトスラッシング（強制再レイアウト）を解消します。
本機能拡張は、ブラウザでの完全クライアントサイド実行モデル（MNG-00）および縦書き表示仕様に則り、以下の対応を行います：
1. 目次データの構築処理および初期化処理を遅延（`setTimeout` 等による非同期タスク）実行とし、初期描画とスクロール復元を最優先する。
2. スクロールに追従するアクティブ見出しの判定に `IntersectionObserver` を導入し、描画スレッドに負荷をかける同期的な座標判定（レイアウトスラッシング）を完全に排除する。
3. 目次ドロワー表示の際、`DocumentFragment` と `requestAnimationFrame` による分割（チャンク化）描画を導入し、アニメーションの60FPS維持と progressive rendering を実現する。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): なし
- 関連要件 (SRD): なし
- バックログ: [006-async-toc-generation.md](../backlogs/closed/006-async-toc-generation.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (詳細設計書の更新)
- [x] [config.js](../../src/js/modules/config.js) (グローバル変数の追加)
- [x] [viewer.js](../../src/js/modules/viewer.js) (オブザーバー初期化呼び出しの統合)
- [x] [ui.js](../../src/js/modules/ui.js) (IntersectionObserver の実装とチャンク描画処理の実装)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/020-async-toc-generation`

### Step 1: 設計ドキュメントの更新
1. **`docs/DSN-02-low_level_design.md` の更新**:
   - 目次の IntersectionObserver 導入および Progressive Rendering による遅延描画ロジックの設計内容を物理設計セクションに追記しました。

### Step 2: 共有状態の定義 (`src/js/modules/config.js`)
1. **グローバル変数の定義**:
   - `var activeHeadingId = null;` (現在表示されているアクティブ見出し要素のID)
   - `var tocObserver = null;` (目次要素を監視する IntersectionObserver インスタンス)

### Step 3: 目次要素の監視および描画処理の実装 (`src/js/modules/ui.js`)
1. **`setupTOCObserver()` 関数の定義**:
   - 既存の `tocObserver` があれば `disconnect()` する。
   - `IntersectionObserver` インスタンスを生成する。オプションとして `root: readerViewport`, `threshold: 0.1` などを指定する。
   - コールバック処理: 交差（`isIntersecting === true`）した要素の ID を `visibleHeadingIds` Set に追加、交差していないものは削除。Set 内の最初の見出し要素（`currentTOC` 内の DOM 順序に基づく）を `activeHeadingId` に設定する。
   - 目次ドロワーが開いている場合のみ `updateActiveTOCItemUI()` を呼び出す。
   - `currentTOC` 内のすべての見出しIDに対応する DOM 要素に対して `observe()` を実行する。
2. **`updateActiveTOCItemUI()` 関数の定義**:
   - ドロワー内の `.toc-item` をクエリし、`activeHeadingId` と一致する要素に `active` クラスを追加、それ以外から削除する。
3. **`buildTOCList()` のチャンク描画化**:
   - `DocumentFragment` を使用して DOM 挿入をバッチ化。
   - `requestAnimationFrame` を用いて、1フレームあたり100件ずつ分割して progressive rendering を行う。
   - 同期的な座標判定 (`getBoundingClientRect`) を廃止し、`activeHeadingId` との完全一致判定のみで `active` クラスを初期付与する。
4. **`jumpToHeading(headingId)` の同期更新**:
   - 目次タップでスクロールする際、非同期オブザーバーのコールバックを待たずに即座に `activeHeadingId = headingId` を設定することで、アクティブ表示の遅延を解消する。

### Step 4: 書籍ロード後の初期化処理の統合 (`src/js/modules/viewer.js`)
1. `displayBook` のレンダリングおよびスクロール復元完了後の `setTimeout` ブロック内において、`setupTOCObserver()` を呼び出し、見出し監視を開始する。また、パース直後に `activeHeadingId` を最初の見出し要素にデフォルト初期化する。

---

## 5. 完了条件 / Success Criteria (DoD)
- [x] 大容量の書籍データ（1MB以上、見出し数100件以上）をロードした際、初期ロードやスクロールの復元がスムーズに行われ、目次解析による遅延が発生しないこと。
- [x] 目次ドロワーを開く際のアニメーションがカクつかず、60FPSで動作すること。
- [x] 目次構築時に `getBoundingClientRect()` が一切呼び出されず、`IntersectionObserver` 経由で非同期にアクティブ位置が特定されること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [x] 本実装は、[DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること。
