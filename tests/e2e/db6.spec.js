const { test, expect } = require('@playwright/test');
test('db click', async ({ page }) => {
    await page.route('**/*.{ttf,woff,woff2,otf}', r => r.abort());
    await page.goto('http://localhost:8080/');
    await page.locator('#developer-books-grid .book-card').first().click();
    await page.waitForSelector('#reader-content p');
    await page.waitForTimeout(500);
    const b = await page.evaluate(() => ({ sl: document.getElementById('reader-viewport').scrollLeft, ri: document.getElementById('reading-index')?.textContent, ovx: window.getComputedStyle(document.getElementById('reader-viewport')).overflowX }));
    await page.locator('#page-nav-left').click();
    await page.waitForTimeout(700);
    const a = await page.evaluate(() => ({ sl: document.getElementById('reader-viewport').scrollLeft, ri: document.getElementById('reading-index')?.textContent }));
    // Write to title to capture output
    await page.evaluate(({ b, a }) => { document.title = `BEFORE:${JSON.stringify(b)}|AFTER:${JSON.stringify(a)}`; }, { b, a });
    const title = await page.title();
    expect(title).toContain('BEFORE');
    console.log('TITLE:', title);
});
