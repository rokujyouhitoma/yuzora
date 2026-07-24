const { test, expect } = require('@playwright/test');

test.describe('Yuzora Page Break Tests', () => {
  test('should successfully enforce column break on .page-break elements', async ({ page }) => {
    // 1. Navigate to main page
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

    // 2. Load the predefined book "こころ" (which has natural columns and we can insert a manual test element)
    await page.waitForSelector('.book-card:has-text("こころ")');
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
      renderer.cacheParagraphBounds();
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

    // CRITICAL: Guarantee that subsequent elements are completely outside the visible viewport (Page 2 or later, left of the viewport)
    const rectViewport = await page.locator('#reader-viewport').boundingBox();
    console.log(`[Test Debug] viewport x: ${rectViewport.x}, width: ${rectViewport.width}`);
    expect(rectAfter.x + rectAfter.width).toBeLessThan(rectViewport.x);
  });

  test('should successfully enforce column break on .page-break elements even with short text', async ({ page }) => {
    // 1. Navigate to main page
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

    // 2. Load the predefined book
    await page.waitForSelector('.book-card:has-text("こころ")');
    await page.click('.book-card:has-text("こころ")');
    await page.waitForSelector('#reader-viewport');

    // 3. Inject short HTML content with a page break
    await page.evaluate(() => {
      const content = document.getElementById('reader-content');
      content.style.blockSize = 'max-content';
      content.innerHTML = `
        <p id="p-before-short">Before</p>
        <div class="page-break" id="test-page-break-short"></div>
        <p id="p-after-short">After</p>
      `;
      // Clear bounds cache to force recalculation
      const renderer = window.yuzora.locator.resolve(window.Yuzora.VerticalRenderer);
      renderer.paragraphBoundsCache = [];
      renderer.cacheParagraphBounds();
    });

    // 4. Wait a frame for layout rendering
    await page.waitForTimeout(500);

    // 5. Measure dimensions
    const rectBefore = await page.locator('#p-before-short').boundingBox();
    const rectAfter = await page.locator('#p-after-short').boundingBox();

    console.log(`[Short Text Test Debug] p-before x: ${rectBefore.x}, width: ${rectBefore.width}`);
    console.log(`[Short Text Test Debug] p-after x: ${rectAfter.x}, width: ${rectAfter.width}`);

    // In RTL, the successor element (#p-after-short) MUST be in the next column to the left.
    // The step is 640px. So rectAfter.x should be significantly less than rectBefore.x.
    expect(rectAfter.x).toBeLessThan(rectBefore.x - 400);

    // CRITICAL: Guarantee that subsequent elements are completely outside the visible viewport (Page 2 or later, left of the viewport)
    const rectViewport = await page.locator('#reader-viewport').boundingBox();
    console.log(`[Short Text Test Debug] viewport x: ${rectViewport.x}, width: ${rectViewport.width}`);
    expect(rectAfter.x + rectAfter.width).toBeLessThan(rectViewport.x);
  });

  test('should successfully adjust page break sizes on window resize / different viewport widths', async ({ page }) => {
    // 1. Navigate to main page
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

    // 2. Load the predefined book "こころ"
    await page.waitForSelector('.book-card:has-text("こころ")');
    await page.click('.book-card:has-text("こころ")');
    await page.waitForSelector('#reader-viewport');

    // 3. Inject short HTML content with a page break
    await page.evaluate(() => {
      const content = document.getElementById('reader-content');
      content.style.blockSize = 'max-content';
      content.innerHTML = `
        <p id="p-before-resize">Before Resize Paragraph</p>
        <div class="page-break" id="test-page-break-resize"></div>
        <p id="p-after-resize">After Resize Paragraph</p>
      `;
      // Clear bounds cache to force recalculation
      const renderer = window.yuzora.locator.resolve(window.Yuzora.VerticalRenderer);
      renderer.paragraphBoundsCache = [];
      renderer.cacheParagraphBounds();
    });

    await page.waitForTimeout(300);

    // Test sizes: [1280, 900, 600]
    const widths = [1280, 900, 600];
    for (const width of widths) {
      console.log(`[Resize Test] Testing viewport width: ${width}px`);
      await page.setViewportSize({ width: width, height: 720 });
      
      // Trigger resize handler manually
      await page.evaluate(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      // Wait for layout repair and rendering
      await page.waitForTimeout(500);

      // Measure coordinates
      const rectBefore = await page.locator('#p-before-resize').boundingBox();
      const rectAfter = await page.locator('#p-after-resize').boundingBox();
      const rectBreak = await page.locator('#test-page-break-resize').boundingBox();
      const vpInfo = await page.evaluate(() => {
        const pb = document.getElementById('test-page-break-resize');
        const pbStyle = window.getComputedStyle(pb);
        const content = document.getElementById('reader-content');
        const contentStyle = window.getComputedStyle(content);
        return {
          pbWidth: pbStyle.width,
          pbMarginLeft: pbStyle.marginLeft,
          pbMarginRight: pbStyle.marginRight,
          pbMarginBlockEnd: pbStyle.marginBlockEnd,
          contentColumnWidth: contentStyle.columnWidth,
          contentColumnGap: contentStyle.columnGap
        };
      });

      console.log(`[Resize Test - ${width}px] p-before x: ${rectBefore.x}, width: ${rectBefore.width}`);
      console.log(`[Resize Test - ${width}px] page-break x: ${rectBreak ? rectBreak.x : 'null'}, width: ${rectBreak ? rectBreak.width : 'null'}`);
      console.log(`[Resize Test - ${width}px] p-after x: ${rectAfter.x}, width: ${rectAfter.width}`);
      console.log(`[Resize Test - ${width}px] Style info:`, vpInfo);

      // Calculate difference between the next element's right edge and the expected right edge
      const colGap = parseFloat(vpInfo.contentColumnGap);
      const pAfterRight = rectAfter.x + rectAfter.width;
      const expectedRight = rectBreak.x - colGap;
      const diff = Math.abs(pAfterRight - expectedRight);
      console.log(`[Resize Test - ${width}px] pAfterRight: ${pAfterRight}, expectedRight: ${expectedRight}, diff: ${diff}`);
      expect(diff).toBeLessThan(3.0); // Allow 3px subpixel rounding error across layouts

      // CRITICAL: Guarantee that subsequent elements are completely outside the visible viewport (Page 2 or later, left of the viewport)
      const rectViewport = await page.locator('#reader-viewport').boundingBox();
      console.log(`[Resize Test - ${width}px] viewport x: ${rectViewport.x}, width: ${rectViewport.width}`);
      expect(pAfterRight).toBeLessThan(rectViewport.x);
    }
  });
});


