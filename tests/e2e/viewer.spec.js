const { test, expect } = require('@playwright/test');

test.describe('Yuzora E2E Reader Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        // Block web fonts to prevent network delays and timeouts in restricted sandbox environments
        await page.route('**/*.{ttf,woff,woff2,otf}', route => route.fulfill({ status: 200, body: '' }));
        await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
        await page.route('https://fonts.gstatic.com/**', route => route.fulfill({ status: 200, body: '' }));

        // Load the page from local server
        await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));
    });

    test('should load welcome screen and show recommendation cards', async ({ page }) => {
        // Assert URL redirects to the default route (ID: 039)
        await expect(page).toHaveURL(/#\/welcome/);

        // Assert welcome screen is visible
        const welcomeScreen = page.locator('#welcome-screen');
        await expect(welcomeScreen).toBeVisible();

        // Check if recommendation grid has books
        const developerBooks = page.locator('#developer-books-grid .book-card');
        await expect(developerBooks.first()).toBeVisible();
    });

    test('should open reader screen when clicking a recommended book card', async ({ page }) => {
        // Click on the first book card (e.g. Kokoro)
        await page.waitForSelector('#developer-books-grid .book-card');
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
        await page.waitForSelector('#developer-books-grid .book-card');
        await page.locator('#developer-books-grid .book-card').first().click();

        // Check reader page is open
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible();

        const btnSettings = page.locator('#btn-settings');
        const readerHeader = page.locator('.reader-header');
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });
        await expect(readerHeader).toHaveClass(/hidden/, { timeout: 8000 });
        await page.click('#reader-viewport');
        await expect(readerHeader).not.toHaveClass(/hidden/);
        await btnSettings.click();

        // Assert settings drawer is open
        const drawer = page.locator('#settings-drawer');
        await expect(drawer).toHaveClass(/open/);

        // Click "dark" theme button
        const darkThemeBtn = page.locator('.theme-btn[data-theme="dark"]');
        await darkThemeBtn.click();

        // Assert body has theme attribute "dark"
        const body = page.locator('body');
        await expect(body).toHaveAttribute('data-theme', 'dark');
    });

    test('should maintain safety margin for the last line of the last page to prevent clipping', async ({ page }) => {
        // Open the first book card
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();

        // Wait for reader screen
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible();

        // Wait for content to load
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

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
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

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
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

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

    test('should toggle reader header/footer visibility by tapping/clicking the viewport', async ({ page }) => {
        // Open a book
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

        const readerHeader = page.locator('.reader-header');
        const readerViewport = page.locator('#reader-viewport');

        const initialClass = await readerHeader.getAttribute('class');
        const initiallyHidden = initialClass.includes('hidden');

        // Click reader viewport (body area)
        await readerViewport.click({ position: { x: 200, y: 200 } });

        if (initiallyHidden) {
            await expect(readerHeader).not.toHaveClass(/hidden/);
        } else {
            await expect(readerHeader).toHaveClass(/hidden/);
        }

        // Click again
        await readerViewport.click({ position: { x: 200, y: 200 } });

        if (initiallyHidden) {
            await expect(readerHeader).toHaveClass(/hidden/);
        } else {
            await expect(readerHeader).not.toHaveClass(/hidden/);
        }
    });

    test('should record and replay UI operation commands', async ({ page }) => {
        // Open a book
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

        // 2. Open Settings drawer
        const btnSettings = page.locator('#btn-settings');
        const settingsDrawer = page.locator('#settings-drawer');
        await expect(settingsDrawer).not.toHaveClass(/open/);

        const readerHeader = page.locator('.reader-header');
        await expect(readerHeader).toHaveClass(/hidden/, { timeout: 8000 });
        await page.click('#reader-viewport');
        await expect(readerHeader).not.toHaveClass(/hidden/);
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

        // Wait for recommendation book card to be visible
        await expect(bookCard).toBeVisible({ timeout: 15000 });

        // 7. Load book again to test replay
        await bookCard.click();
        
        // Assert reader screen is visible (loading started)
        const readerScreen = page.locator('#reader-screen');
        await expect(readerScreen).toBeVisible({ timeout: 15000 });
        
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

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

    test('should observe headings and render TOC chunked progressive list', async ({ page }) => {
        // Open a book
        await page.waitForSelector('#developer-books-grid .book-card');
        const bookCard = page.locator('#developer-books-grid .book-card').first();
        await bookCard.click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

        // 2. Click TOC button to open drawer
        const btnTOC = page.locator('#btn-toc');
        const tocDrawer = page.locator('#toc-drawer');
        await expect(tocDrawer).not.toHaveClass(/open/);

        const readerHeader = page.locator('.reader-header');
        await expect(readerHeader).toHaveClass(/hidden/, { timeout: 8000 });
        await page.click('#reader-viewport');
        await expect(readerHeader).not.toHaveClass(/hidden/);
        await btnTOC.click();
        await expect(tocDrawer).toHaveClass(/open/);

        // 3. Verify TOC items are progressive rendered
        const tocList = page.locator('#toc-list');
        const firstTOCItem = tocList.locator('.toc-item').first();
        await expect(firstTOCItem).toBeVisible();

        // Initially, the first heading should be active (highlighted)
        await expect(firstTOCItem).toHaveClass(/active/);

        // 4. Click a different heading to jump
        const secondTOCItem = tocList.locator('.toc-item').nth(1);
        await secondTOCItem.click();

        // Drawer should close automatically on click
        await expect(tocDrawer).not.toHaveClass(/open/);

        // Wait for smooth scroll and IntersectionObserver to settle
        await page.waitForTimeout(3000);

        // 5. Open TOC drawer again
        await page.click('#reader-viewport');
        await expect(readerHeader).not.toHaveClass(/hidden/);
        await btnTOC.click();
        await expect(tocDrawer).toHaveClass(/open/);

        // Verify the second heading is now active
        const updatedSecondTOCItem = tocList.locator('.toc-item').nth(1);
        await expect(updatedSecondTOCItem).toHaveClass(/active/);
    });

    test('should navigate backward and forward using left/right overlay clicks in RTL mode', async ({ page }) => {
        // Open a book
        await page.waitForSelector('#developer-books-grid .book-card');
        await page.locator('#developer-books-grid .book-card').first().click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

        // Verify we start at Page 1
        const readingIndex = page.locator('#reading-index');
        await expect(readingIndex).toHaveText(/1 \/ \d+ ページ/);

        // In RTL, clicking left side (page-nav-left) goes to Next page (Page 2)
        const btnLeft = page.locator('#page-nav-left');
        await btnLeft.click();
        await page.waitForTimeout(600); // Wait for transition
        await expect(readingIndex).toHaveText(/2 \/ \d+ ページ/);

        // Click again to go to Page 3
        await btnLeft.click();
        await page.waitForTimeout(600);
        await expect(readingIndex).toHaveText(/3 \/ \d+ ページ/);

        // In RTL, clicking right side (page-nav-right) goes to Previous page (Page 2)
        const btnRight = page.locator('#page-nav-right');
        await btnRight.click();
        await page.waitForTimeout(600);
        await expect(readingIndex).toHaveText(/2 \/ \d+ ページ/);

        // Click again to go to Page 1
        await btnRight.click();
        await page.waitForTimeout(600);
        await expect(readingIndex).toHaveText(/1 \/ \d+ ページ/);
    });

    test('should navigate forward and backward using touch swipe gestures in RTL mode', async ({ browser }) => {
        // CDP-level touch simulation requires a hasTouch:true browser context.
        // page.dispatchEvent() serializes touch points as plain objects, so
        // TouchEvent.touches[0].clientX is undefined in ui.js. Using
        // Input.dispatchTouchEvent sends real TouchEvents via the CDP protocol.
        const context = await browser.newContext({ hasTouch: true });
        const page = await context.newPage();

        // Block web fonts to prevent network delays
        await page.route('**/*.{ttf,woff,woff2,otf}', route => route.fulfill({ status: 200, body: '' }));
        await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
        await page.route('https://fonts.gstatic.com/**', route => route.fulfill({ status: 200, body: '' }));

        await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

        // 1. Open a book (Kokoro by default is RTL)
        await page.waitForSelector('#developer-books-grid .book-card');
        await page.locator('#developer-books-grid .book-card').first().click();
        await page.waitForSelector('#reader-content p');
        await page.waitForFunction(() => !window.__isReflowing__, undefined, { timeout: 15000 });

        const readingIndex = page.locator('#reading-index');
        await expect(readingIndex).toHaveText(/1 \/ \d+ ページ/);

        // Use CDP Input.dispatchTouchEvent for correct TouchEvent simulation.
        // This correctly populates changedTouches[0].clientX that ui.js reads.
        const cdpSession = await context.newCDPSession(page);

        // In RTL, Right Swipe (finger moves left to right: startX=200 to endX=400) goes to Next page (Page 2)
        await cdpSession.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x: 200, y: 300, id: 0 }],
        });
        await cdpSession.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [{ x: 400, y: 300, id: 0 }],
        });
        await page.waitForTimeout(600); // Wait for scroll transition
        await expect(readingIndex).toHaveText(/2 \/ \d+ ページ/);

        // In RTL, Left Swipe (finger moves right to left: startX=400 to endX=200) goes to Previous page (Page 1)
        await cdpSession.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x: 400, y: 300, id: 0 }],
        });
        await cdpSession.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [{ x: 200, y: 300, id: 0 }],
        });
        await page.waitForTimeout(600); // Wait for scroll transition
        await expect(readingIndex).toHaveText(/1 \/ \d+ ページ/);

        await context.close();
    });
});
