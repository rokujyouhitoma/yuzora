const { test, expect } = require('@playwright/test');
const path = require('path');

test('Capture screenshots of reader pages', async ({ page }) => {
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

    // Open first book
    const bookCard = page.locator('#developer-books-grid .book-card').first();
    await bookCard.click();
    await page.waitForSelector('#reader-content p');

    // Wait for layout to settle
    await page.waitForTimeout(1000);

    // Save screenshot of Page 1
    const artifactPath1 = '/root/.gemini/antigravity-ide/brain/6924368e-3ebf-4fff-abbf-f141657e7754/page1.png';
    await page.screenshot({ path: artifactPath1 });
    console.log(`Page 1 screenshot saved to ${artifactPath1}`);

    // Go to next page (page 2) by clicking the left nav overlay
    const pageNavLeft = page.locator('#page-nav-left');
    await pageNavLeft.click();
    await page.waitForTimeout(1000); // Wait for smooth scroll to finish

    // Save screenshot of Page 2
    const artifactPath2 = '/root/.gemini/antigravity-ide/brain/6924368e-3ebf-4fff-abbf-f141657e7754/page2.png';
    await page.screenshot({ path: artifactPath2 });
    console.log(`Page 2 screenshot saved to ${artifactPath2}`);
});
