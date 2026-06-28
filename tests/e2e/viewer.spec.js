const { test, expect } = require('@playwright/test');

test.describe('Yuzora E2E Reader Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Block web fonts to prevent network delays and timeouts in restricted sandbox environments
        await page.route('**/*.{ttf,woff,woff2,otf}', route => route.abort());
        await page.route('https://fonts.googleapis.com/**', route => route.abort());
        await page.route('https://fonts.gstatic.com/**', route => route.abort());

        // Load the page from local server
        await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));
    });

    test('should load welcome screen and show recommendation cards', async ({ page }) => {
        // Assert welcome screen is visible
        const welcomeScreen = page.locator('#welcome-screen');
        await expect(welcomeScreen).toBeVisible();

        // Check if recommendation grid has books
        const developerBooks = page.locator('#developer-books-grid .book-card');
        await expect(developerBooks.first()).toBeVisible();
    });

    test('should open reader screen when clicking a recommended book card', async ({ page }) => {
        // Click on the first book card (e.g. Kokoro)
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();

        // Assert reader screen is visible and welcome screen is hidden
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible();
        
        const welcomeScreen = page.locator('#welcome-screen');
        await expect(welcomeScreen).toHaveClass(/hidden/);
    });

    test('should open setting drawer and change themes', async ({ page }) => {
        // Open a book first
        await page.locator('#developer-books-grid .book-card').first().click();

        // Check reader page is open
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible();

        // Open settings drawer
        const btnSettings = page.locator('#btn-settings');
        const readerHeader = page.locator('.reader-header');
        if (await readerHeader.getAttribute('class').then(c => c.includes('hidden'))) {
            await page.click('#reader-viewport');
        }
        await btnSettings.click();

        // Assert settings drawer is open
        const drawer = page.locator('#settings-drawer');
        await expect(drawer).toHaveClass(/open/);

        // Click "dark" theme button
        const darkThemeBtn = page.locator('.theme-btn[data-theme="dark"]');
        await darkThemeBtn.click();

        // Assert body has theme class "theme-dark"
        const body = page.locator('body');
        await expect(body).toHaveClass(/theme-dark/);
    });

    test('should maintain safety margin for the last line of the last page to prevent clipping', async ({ page }) => {
        // Open the first book card
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();

        // Wait for reader screen
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible();

        // Wait for content to load
        await page.waitForSelector('#reader-content p');

        // Scroll all the way to the left (end of the book)
        await page.evaluate(() => {
            const viewport = document.getElementById('reader-viewport');
            viewport.scrollLeft = -(viewport.scrollWidth - viewport.clientWidth);
        });

        // Wait for smooth scrolling to settle
        await page.waitForFunction(() => {
            const viewport = document.getElementById('reader-viewport');
            const target = -(viewport.scrollWidth - viewport.clientWidth);
            return Math.abs(viewport.scrollLeft - target) < 2;
        }, undefined, { timeout: 5000 }).catch(() => {});

        // Get viewport and last paragraph bounding boxes
        const viewportBox = await page.locator('#reader-viewport').boundingBox();
        const lastParagraph = page.locator('#reader-content p').last();
        const lastParagraphBox = await lastParagraph.boundingBox();

        // The leftmost edge of the last paragraph should be at least 15px inside the viewport
        const leftMargin = lastParagraphBox.x - viewportBox.x;
        console.log(`Last paragraph left margin: ${leftMargin}px`);
        expect(leftMargin).toBeGreaterThanOrEqual(15);
    });

    test('should control debug modal using keyboard shortcuts', async ({ page }) => {
        // Open a book
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');

        // Assert debug modal is hidden initially
        const debugModal = page.locator('#debug-modal');
        await expect(debugModal).toHaveClass(/hidden/);

        // Press 'd' to open debug modal
        await page.keyboard.press('d');
        await expect(debugModal).not.toHaveClass(/hidden/);

        const tabContentMonitor = page.locator('#debug-tab-content-monitor');
        const tabContentDiagnose = page.locator('#debug-tab-content-diagnose');

        // Verify initial state: Monitor visible, Diagnose hidden
        await expect(tabContentMonitor).not.toHaveClass(/hidden/);
        await expect(tabContentDiagnose).toHaveClass(/hidden/);

        // Press '2' to switch to Layout Diagnosis tab
        const tabDiagnose = page.locator('#tab-btn-diagnose');
        await page.keyboard.press('2');
        await expect(tabDiagnose).toHaveClass(/active/);
        // Verify Diagnose is visible and Monitor is hidden
        await expect(tabContentDiagnose).not.toHaveClass(/hidden/);
        await expect(tabContentMonitor).toHaveClass(/hidden/);

        // Press '1' to switch to System Monitor tab
        const tabMonitor = page.locator('#tab-btn-monitor');
        await page.keyboard.press('1');
        await expect(tabMonitor).toHaveClass(/active/);
        // Verify Monitor is visible and Diagnose is hidden
        await expect(tabContentMonitor).not.toHaveClass(/hidden/);
        await expect(tabContentDiagnose).toHaveClass(/hidden/);

        // Press 'Escape' to close debug modal
        await page.keyboard.press('Escape');
        await expect(debugModal).toHaveClass(/hidden/);
    });

    test('should toggle reader header/footer visibility using ArrowUp/ArrowDown keys', async ({ page }) => {
        // Open a book
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');

        const readerHeader = page.locator('.reader-header');

        // Capture initial class list
        const initialClass = await readerHeader.getAttribute('class');
        const initiallyHidden = initialClass.includes('hidden');

        // Press 'ArrowDown' key
        await page.keyboard.press('ArrowDown');

        // Verify the class has toggled
        if (initiallyHidden) {
            await expect(readerHeader).not.toHaveClass(/hidden/);
        } else {
            await expect(readerHeader).toHaveClass(/hidden/);
        }

        // Press 'ArrowUp' key
        await page.keyboard.press('ArrowUp');

        // Verify it toggles back
        if (initiallyHidden) {
            await expect(readerHeader).toHaveClass(/hidden/);
        } else {
            await expect(readerHeader).not.toHaveClass(/hidden/);
        }
    });

    test('should record and replay UI operation commands', async ({ page }) => {
        // 1. Open a book
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');

        // 2. Open Settings drawer
        const btnSettings = page.locator('#btn-settings');
        const settingsDrawer = page.locator('#settings-drawer');
        await expect(settingsDrawer).not.toHaveClass(/open/);
        await btnSettings.click();
        await expect(settingsDrawer).toHaveClass(/open/);

        // Close Settings drawer
        const btnCloseSettings = page.locator('#btn-close-settings');
        await btnCloseSettings.click();
        await expect(settingsDrawer).not.toHaveClass(/open/);

        // 3. Open Debug modal
        await page.keyboard.press('d');
        const debugModal = page.locator('#debug-modal');
        await expect(debugModal).not.toHaveClass(/hidden/);

        // 4. Extract serialized operations JSON
        const historyTextarea = page.locator('#debug-history-json');
        const historyJSON = await historyTextarea.inputValue();
        expect(historyJSON).toContain('ToggleDrawer');
        expect(historyJSON).toContain('ToggleDebugModal');

        // 5. Close Debug modal
        const btnCloseDebug = page.locator('#btn-close-debug');
        await btnCloseDebug.click();
        await expect(debugModal).toHaveClass(/hidden/);

        // 6. Click Back to Welcome Screen
        const btnBack = page.locator('#btn-back');
        await btnBack.click();
        const welcomeScreen = page.locator('#welcome-screen');
        await expect(welcomeScreen).not.toHaveClass(/hidden/);

        // 7. Load book again to test replay
        await bookCard.click();
        await page.waitForSelector('#reader-content p');

        // 8. Open Debug modal again to import history
        await page.keyboard.press('d');
        await expect(debugModal).not.toHaveClass(/hidden/);

        // 9. Input and import operations history
        await historyTextarea.fill(historyJSON);
        const btnImportHistory = page.locator('#btn-import-history');
        await btnImportHistory.click();

        // 10. Wait for replay to complete and verify states
        // Replay runs at 300ms intervals. Wait enough time (e.g. 2.5s) for the sequence to complete
        await page.waitForTimeout(2500);

        // Verify drawers and modal are in the end state recorded in the history
        await expect(settingsDrawer).not.toHaveClass(/open/);
        await expect(debugModal).not.toHaveClass(/hidden/);
    });
});
