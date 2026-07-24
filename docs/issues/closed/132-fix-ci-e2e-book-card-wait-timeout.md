---
ID: 132
種別: Bug
優先度: High
ステータス: Closed (Resolved)
---

# [BUG] CI/CD E2Eテストにおける book-card 検出タイムアウトの解消 (ID: 132)

## 1. 概要 / Summary
GitHub Actions CIおよびローカル環境におけるE2Eテスト (`tests/e2e/viewer.spec.js` および `tests/e2e/vrt.spec.js`) において、`#developer-books-grid .book-card` の要素待ちおよびクリック時に 90000ms のタイムアウトが発生し、CIが失敗する現象を解消します。[MNG-00](../MNG-00-development_philosophy.md) の完全クライアントサイド実行および直感的な操作性を維持しつつ、堅牢で高速なテスト実行環境を確立します。

### 再現手順 / Steps to Reproduce
1. `npm run test:e2e` または `TEST_PATH=/compiled.html npm run test:vrt` を実行する。
2. `tests/e2e/vrt.spec.js:21` または `tests/e2e/viewer.spec.js:391` にて `#developer-books-grid .book-card` の検出でタイムアウトが発生する。

### 再現環境 / Environment
- Browser / OS: Headless Chromium (Playwright CI / Linux)
- Environment: GitHub Actions CI / Local test environment

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [ui.js](../../src/js/modules/ui/ui.js) — オススメ本グリッドの非同期レンダリング処理 (`setupPredefinedBooksGrids`)
- [x] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — RTLモードスワイプテストの `waitForSelector` 漏れの補完
- [x] [vrt.spec.js](../../tests/e2e/vrt.spec.js) — VRTテストの要素検出タイミングの調整
- [x] [README.md](README.md) — Issue台帳の更新

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
1. `src/js/modules/ui/ui.js` の `setupPredefinedBooksGrids` 関数において、`DOMUtils.nextFrame` (requestAnimationFrame) 内で `DOMUtils.afterRender` (setTimeout) を呼び出し、さらに `AnimationUtils.delay(600)` による600msの人工的な遅延を行っていた。
2. Headless Chromium環境（特にCI環境やバックグラウンド実行時）では `requestAnimationFrame` のフレーム更新タイマーが抑制・遅延される場合があり、DOM描画までの遅延が累積して Playwright の要素待ちタイムアウトを引き起こす原因となっていた。
3. `tests/e2e/viewer.spec.js` の RTL スワイプテスト (L391) において、`.book-card` の描画完了を待つ `await page.waitForSelector('#developer-books-grid .book-card')` が欠落しており、描画前のクリック試行によりタイムアウトが発生していた。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: 
  1. `ui.js` の `setupPredefinedBooksGrids` における過度なフレームスケジューリングのネスト (`DOMUtils.nextFrame` + `DOMUtils.afterRender`) を整理し、スケルトン表示から本カード表示への非同期変換を `AnimationUtils.delay(300)` による確定的なマイクロタスク/タイマーに統一して過度な描画遅延を防止する。
  2. `tests/e2e/viewer.spec.js` の L391 直前に `await page.waitForSelector('#developer-books-grid .book-card');` を明示的に追加する。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/132-ci-e2e-book-card-wait-timeout`

### 5.1 UIレンダリング制御のリファクタリング
- `src/js/modules/ui/ui.js` 内の `setupPredefinedBooksGrids`:
  - 過度な `DOMUtils.nextFrame` や `DOMUtils.afterRender` の多重ネストを取り除き、スケルトンの初期化と本カードへのフェードイン変換処理を軽量かつ確実に動作するように更新する。

### 5.2 E2Eテストコードの補完
- `tests/e2e/viewer.spec.js`:
  - L391のクリック直前に `await page.waitForSelector('#developer-books-grid .book-card');` を挿入する。

### 5.3 ビルドと検証
- `make` を実行して `main-min.js` を再コンパイルする。
- `npm run test:unit` を実行して全ユニットテストがパスすることを確認する。
- `npm run test:vrt` および `npm run test:e2e` を実行して全E2Eテストがパスすることを確認する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] `tests/e2e/viewer.spec.js` および `tests/e2e/vrt.spec.js` がタイムアウトなく成功すること。
- [ ] `npm run test:vrt` および `npm run test:e2e:compiled` を含むすべての E2E テストが正常にパスすること。
- [ ] すべてのユニットテスト (`npm run test:unit`) および Closure Compiler ビルド (`make`) がエラーなく成功すること。
- [ ] 実装内容が [DSN-01](../designs/DSN-01-high_level_design.md) および [DSN-02](../designs/DSN-02-low_level_design.md) と完全な整合性を保持していること。

