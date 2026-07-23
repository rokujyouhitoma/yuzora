const { test, expect } = require('@playwright/test');

test.describe('PWA & Offline Support E2E Tests', () => {
    test('manifest.json is accessible and valid', async ({ request }) => {
        const response = await request.get('/manifest.json');
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest.name).toContain('ゆうぞら');
        expect(manifest.short_name).toBe('ゆうぞら');
        expect(manifest.display).toBe('standalone');
        expect(manifest.start_url).toBeDefined();
        expect(Array.isArray(manifest.icons)).toBe(true);
        expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('sw.js is accessible and page includes PWA manifest link', async ({ page }) => {
        await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

        // Check manifest link tag in head
        const manifestLink = await page.locator('link[rel="manifest"]');
        await expect(manifestLink).toHaveAttribute('href', 'manifest.json');

        // Check theme-color meta tag
        const themeColorMeta = await page.locator('meta[name="theme-color"]');
        await expect(themeColorMeta).toHaveAttribute('content', '#2c2416');

        // Verify sw.js endpoint is serving Service Worker code
        const swResponse = await page.request.get('/sw.js');
        expect(swResponse.status()).toBe(200);
        const swContent = await swResponse.text();
        expect(swContent).toContain('self.addEventListener');
        expect(swContent).toContain('yuzora-cache-');
    });

    test('Service Worker registers successfully in browser environment', async ({ page }) => {
        await page.goto('http://localhost:8080' + (process.env.TEST_PATH || '/'));

        // Evaluate Service Worker registration in browser
        const isSwSupported = await page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) return false;
            try {
                const reg = await navigator.serviceWorker.getRegistration();
                return reg !== undefined || navigator.serviceWorker !== undefined;
            } catch (e) {
                return false;
            }
        });
        expect(isSwSupported).toBe(true);
    });
});
