const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Testing (VRT)', () => {
  test.beforeEach(async ({ page }) => {
    // Abort external WebFont requests to ensure deterministic local font rendering
    await page.route('**/*.{ttf,woff,woff2,otf}', route => route.abort());
  });

  test('Welcome screen visual snapshot', async ({ page }) => {
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));
    await page.waitForSelector('#welcome-screen');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('welcome-screen.png', {
      maxDiffPixelRatio: 0.15,
      animations: 'disabled'
    });
  });

  test('Reader screen visual snapshot across themes', async ({ page }) => {
    await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));
    await page.waitForSelector('#developer-books-grid .book-card');
    await page.locator('#developer-books-grid .book-card').first().click();
    await page.waitForSelector('#reader-content p');
    await page.waitForTimeout(500);

    // Capture default theme snapshot
    await expect(page).toHaveScreenshot('reader-default-theme.png', {
      maxDiffPixelRatio: 0.15,
      animations: 'disabled'
    });
  });
});
