const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('Capture screenshots of reader pages', async ({ page }) => {
    // Block web fonts to prevent network delays and timeouts in restricted sandbox environments
    await page.route('**/*.{ttf,woff,woff2,otf}', route => route.abort());
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());

    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

    // Open first book
    const bookCard = page.locator('#developer-books-grid .book-card').first();
    await bookCard.click();
    await page.waitForSelector('#reader-content p');

    // Wait for layout to settle
    await page.waitForTimeout(1000);

    // Resolve artifacts directory dynamically and ensure it exists
    const artifactsDir = process.env.ARTIFACTS_DIR || path.join(__dirname, '../../test-results');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    // Save screenshot of Page 1
    const artifactPath1 = path.join(artifactsDir, 'page1.png');
    await page.screenshot({ path: artifactPath1 });
    console.log(`Page 1 screenshot saved to ${artifactPath1}`);

    // Go to next page (page 2) by clicking the left nav overlay
    const pageNavLeft = page.locator('#page-nav-left');
    await pageNavLeft.click();
    await page.waitForTimeout(1000); // Wait for smooth scroll to finish

    // Save screenshot of Page 2
    const artifactPath2 = path.join(artifactsDir, 'page2.png');
    await page.screenshot({ path: artifactPath2 });
    console.log(`Page 2 screenshot saved to ${artifactPath2}`);
});
