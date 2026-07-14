const { test, expect } = require('@playwright/test');

test.describe('Yuzora Page Break Tests', () => {
  test('should successfully enforce column break on .page-break elements', async ({ page }) => {
    // 1. Navigate to main page
    await page.goto('http://localhost:8080/');

    // 2. Load the predefined book "こころ" (which has natural columns and we can insert a manual test element)
    await page.click('.book-card:has-text("こころ")');
    await page.waitForSelector('#reader-viewport');

    // 3. Inject dummy HTML with a very long p-before text and a page break into reader-content
    await page.evaluate(() => {
      const content = document.getElementById('reader-content');
      content.style.blockSize = 'max-content'; // Restore auto-expansion logical block-size!
      const longTextBefore = "これは改ページ前の非常に長い段落テキストです。".repeat(40);
      const longTextAfter = "これは改ページ後の非常に長い段落テキストです。確実に次のカラムに行く必要があります。".repeat(40);
      content.innerHTML = `
        <p id="p-before">${longTextBefore}</p>
        <div class="page-break" id="test-page-break"></div>
        <p id="p-after">${longTextAfter}</p>
      `;
      // Clear bounds cache to force recalculation
      const renderer = window.yuzora.locator.resolve(window.Yuzora.VerticalRenderer);
      renderer.paragraphBoundsCache = [];
    });

    // 4. Wait a frame for layout rendering
    await page.waitForTimeout(500);

    // 5. Measure dimensions and absolute coordinates of predecessor, break element, and successor
    const viewportSize = await page.evaluate(() => {
      const vp = document.getElementById('reader-viewport');
      const content = document.getElementById('reader-content');
      const pb = document.getElementById('test-page-break');
      const vpStyle = window.getComputedStyle(vp);
      const contentStyle = window.getComputedStyle(content);
      const pbStyle = window.getComputedStyle(pb);
      return {
        vpHeight: vp.clientHeight,
        vpWidth: vp.clientWidth,
        vpComputedHeight: vpStyle.height,
        contentHeight: content.clientHeight,
        contentWidth: content.clientWidth,
        contentComputedWidth: contentStyle.width,
        contentComputedHeight: contentStyle.height,
        contentBlockSize: contentStyle.blockSize,
        contentColumnWidth: contentStyle.columnWidth,
        contentColumnGap: contentStyle.columnGap,
        pbDisplay: pbStyle.display,
        pbBreakBefore: pbStyle.breakBefore,
        pbBreakAfter: pbStyle.breakAfter,
        pbWebkitColumnBreakBefore: pbStyle.webkitColumnBreakBefore,
        pbPageBreakBefore: pbStyle.pageBreakBefore,
        pbWidth: pbStyle.width,
        pbHeight: pbStyle.height,
        pbMarginLeft: pbStyle.marginLeft
      };
    });
    console.log(`[Test Debug] Viewport & Content dimensions:`, viewportSize);

    const rectBefore = await page.locator('#p-before').boundingBox();
    const rectBreak = await page.locator('#test-page-break').boundingBox();
    const rectAfter = await page.locator('#p-after').boundingBox();

    console.log(`[Test Debug] p-before left: ${rectBefore.x}, width: ${rectBefore.width}`);
    console.log(`[Test Debug] test-page-break left: ${rectBreak ? rectBreak.x : 'null'}, width: ${rectBreak ? rectBreak.width : 'null'}, height: ${rectBreak ? rectBreak.height : 'null'}`);
    console.log(`[Test Debug] p-after left: ${rectAfter.x}, width: ${rectAfter.width}`);

    // Save screenshot for visual debugging
    await page.screenshot({ path: 'test-results/pagebreak-debug.png' });

    // In RTL layout, columns progress to the left (negative X axis).
    // Therefore, the successor element (#p-after) MUST be located strictly to the left of the predecessor (#p-before).
    // The column gap is 80px, and column width is 560px (total step 640px).
    // So rectAfter.x should be significantly less than rectBefore.x.
    expect(rectAfter.x).toBeLessThan(rectBefore.x - 300);
  });
});
