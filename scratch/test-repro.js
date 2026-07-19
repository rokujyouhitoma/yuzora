const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = 'file://' + path.resolve(__dirname, 'repro.html');
  console.log(`Navigating to ${filePath}`);
  await page.goto(filePath);
  
  // Wait a moment for layout
  await page.waitForTimeout(500);

  // Pattern 1 の座標を測る
  const p1_1 = await page.locator('#content1 p').nth(0).boundingBox();
  const p1_2 = await page.locator('#content1 p').nth(1).boundingBox();
  
  console.log('\n--- Pattern 1 (Current implementation with .page-break + *) ---');
  if (p1_1 && p1_2) {
    console.log(`  Paragraph 1: x=${p1_1.x.toFixed(2)}, y=${p1_1.y.toFixed(2)}, w=${p1_1.width.toFixed(2)}, h=${p1_1.height.toFixed(2)}`);
    console.log(`  Paragraph 2: x=${p1_2.x.toFixed(2)}, y=${p1_2.y.toFixed(2)}, w=${p1_2.width.toFixed(2)}, h=${p1_2.height.toFixed(2)}`);
    console.log(`  Difference X (p2.x - p1.x): ${(p1_2.x - p1_1.x).toFixed(2)} (should be negative around -240px for RTL column gap)`);
  } else {
    console.log('  Failed to measure Pattern 1 paragraphs');
  }
  
  // Pattern 2 の座標を測る
  const p2_1 = await page.locator('#content2 p').nth(0).boundingBox();
  const p2_2 = await page.locator('#content2 p').nth(1).boundingBox();
  
  console.log('\n--- Pattern 2 (Direct page-break-direct on element itself) ---');
  if (p2_1 && p2_2) {
    console.log(`  Paragraph 1: x=${p2_1.x.toFixed(2)}, y=${p2_1.y.toFixed(2)}, w=${p2_1.width.toFixed(2)}, h=${p2_1.height.toFixed(2)}`);
    console.log(`  Paragraph 2: x=${p2_2.x.toFixed(2)}, y=${p2_2.y.toFixed(2)}, w=${p2_2.width.toFixed(2)}, h=${p2_2.height.toFixed(2)}`);
    console.log(`  Difference X (p2.x - p1.x): ${(p2_2.x - p2_1.x).toFixed(2)} (should be negative around -240px for RTL column gap)`);
  } else {
    console.log('  Failed to measure Pattern 2 paragraphs');
  }
  
  // スクリーンショット保存
  const screenshotPath = path.resolve(__dirname, 'repro-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nScreenshot saved to ${screenshotPath}`);
  
  await browser.close();
})();
