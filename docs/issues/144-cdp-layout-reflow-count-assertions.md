---
ID: 144
種別: Enhancement
優先度: Medium
ステータス: Open (In Progress)
---

# [ENH] CDP `LayoutCount`・`RecalculateStyleCount` リフロー回数アサーションの実装 (ID: 144)

## 1. 概要 / Summary

Backlog 114 で確立した設計方針に基づき、Playwright CDP Session (`Performance.getMetrics`) を通じて
`LayoutCount`（レイアウトリフロー回数）および `RecalculateStyleCount`（スタイル再計算回数）の計測・
アサーションを E2E テストに追加します。

`JSHeapUsedSize` メモリリーク検証は Issue 136 で実装済みですが、
`LayoutCount` / `RecalculateStyleCount` のアサーションは未実装のため本 Issue で補完します。

MNG-00 「プロダクションコード無依存・ゼロランタイム追加」原則を厳格遵守し、
追加 npm パッケージなしで Playwright 標準の CDP API のみを使用します。

---

## 2. トレーサビリティ / Traceability

- 関連バックログ: [Backlog 114](../backlogs/114-evaluate-thirdparty-heavyweight-testing-tools.md)
- 関連 Issue: Issue 136 (JSHeapUsedSize 実装済み)
- 関連要求 (URD): [REQ-01](../../requirements/REQ-01-user_requirements_specification.md)
- 関連要件 (SRD): [REQ-03](../../requirements/REQ-03-system_requirements.md)
- 設計: [DSN-01](../../designs/DSN-01-high_level_design.md), [DSN-02](../../designs/DSN-02-low_level_design.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [viewer.spec.js](../../tests/e2e/viewer.spec.js) — CDP `LayoutCount`/`RecalculateStyleCount` アサーションテスト追加

---

## 4. 実装方針 / Implementation Plan

Target Branch: `feat/144-cdp-layout-reflow-count-assertions`

### 変更対象: `tests/e2e/viewer.spec.js`

既存の `E2E Playwright CDP Session Memory Leak Guard (Issue 136)` テスト（L499-525）の**後ろ**に、
新しいテスト `E2E CDP Layout & Style Reflow Count Guard (Backlog 114)` を追加する。

#### 追加するテストの仕様:

```javascript
test('E2E CDP Layout & Style Reflow Count Guard (Backlog 114)', async ({ browser }) => {
    // 1. 新しい browser context + CDP session を作成
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(targetUrl);
    await page.waitForSelector('#developer-books-grid .book-card');

    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send('Performance.enable');

    // 2. ベースライン計測（書籍ロード前）
    const beforeMetrics = await cdpSession.send('Performance.getMetrics');
    const beforeLayout = beforeMetrics.metrics.find(m => m.name === 'LayoutCount')?.value || 0;
    const beforeStyle  = beforeMetrics.metrics.find(m => m.name === 'RecalculateStyleCount')?.value || 0;

    // 3. 書籍を開いてレンダリングを完了させる
    await page.click('#developer-books-grid .book-card');
    await page.waitForSelector('#reader-viewport', { state: 'visible' });
    await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });
    await page.waitForTimeout(500);

    // 4. 計測後のメトリクス取得
    const afterMetrics = await cdpSession.send('Performance.getMetrics');
    const afterLayout = afterMetrics.metrics.find(m => m.name === 'LayoutCount')?.value || 0;
    const afterStyle  = afterMetrics.metrics.find(m => m.name === 'RecalculateStyleCount')?.value || 0;

    // 5. デルタ（増分）算出とアサーション
    const layoutDelta = afterLayout - beforeLayout;
    const styleDelta  = afterStyle  - beforeStyle;

    console.log(`[CDP Reflow Guard] LayoutCount delta: ${layoutDelta}, RecalculateStyleCount delta: ${styleDelta}`);

    // 書籍ロード・初期レイアウト修復を含む複雑な処理のため余裕ある閾値を設定
    // LayoutCount: 初期リフローを含み 500 回以内を許容
    expect(layoutDelta).toBeLessThan(500);
    // RecalculateStyleCount: スタイル再計算 500 回以内を許容
    expect(styleDelta).toBeLessThan(500);

    await context.close();
});
```

#### 閾値設定の根拠:
- 書籍ロード時は自己修復レイアウトエンジン（Issue 056, 070, 083）が複数パスのリフローを実行するため余裕ある閾値（各500回）を設定。
- 将来的なリグレッション検出のためのベースライン確立が目的であり、閾値は実測値に基づき段階的に厳格化できる。

---

## 5. 完了条件 / Success Criteria (DoD)

- [ ] `tests/e2e/viewer.spec.js` に `E2E CDP Layout & Style Reflow Count Guard (Backlog 114)` テストが追加されていること。
- [ ] `LayoutCount` デルタが 500 未満であること（アサーション通過）。
- [ ] `RecalculateStyleCount` デルタが 500 未満であること（アサーション通過）。
- [ ] すべての E2E テスト (`npm run test:e2e`) が正常にパスすること。
- [ ] すべてのユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] Backlog 114 の 5.2 実装・検証完了条件がすべてチェック済みになること。
- [ ] [DSN-01](../../designs/DSN-01-high_level_design.md) および [DSN-02](../../designs/DSN-02-low_level_design.md) のデザイン仕様と完全整合していること（テストのみの変更のため設計文書の更新は不要）。
