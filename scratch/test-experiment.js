const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = 'file://' + path.resolve(__dirname, 'experiment.html');
  console.log(`Navigating to ${filePath}`);
  await page.goto(filePath);
  
  await page.waitForTimeout(500);

  const patterns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i'];
  
  for (const pat of patterns) {
    const vpId = `#viewport-${pat}`;
    const pBefore = await page.locator(`${vpId} .before-text`).boundingBox();
    const pAfter = await page.locator(`${vpId} .after-text`).boundingBox();
    
    console.log(`\n--- Pattern ${pat.toUpperCase()} ---`);
    if (pBefore && pAfter) {
      const diffX = pAfter.x - pBefore.x;
      console.log(`  Before: x=${pBefore.x.toFixed(2)}, y=${pBefore.y.toFixed(2)}, w=${pBefore.width.toFixed(2)}, h=${pBefore.height.toFixed(2)}`);
      console.log(`  After : x=${pAfter.x.toFixed(2)}, y=${pAfter.y.toFixed(2)}, w=${pAfter.width.toFixed(2)}, h=${pAfter.height.toFixed(2)}`);
      console.log(`  Diff X: ${diffX.toFixed(2)}px (Column change: ${diffX < -150 ? 'SUCCESS' : 'FAILED'})`);
    } else {
      console.log('  Failed to get elements bounding boxes');
    }
  }
  
  const screenshotPath = path.resolve(__dirname, 'experiment-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nScreenshot saved to ${screenshotPath}`);
  
  await browser.close();
})();
