const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Resource Management (Asset & ResourceDirector) Unit Tests', () => {
    let window;
    let document;
    let AssetClass;
    let BookAssetClass;
    let ResourceDirectorClass;

    test.before(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: "http://localhost",
            runScripts: "dangerously"
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;

        // Load asset.js
        const assetJsPath = path.resolve(__dirname, '../../../src/js/modules/storage/asset.js');
        const assetJsCode = fs.readFileSync(assetJsPath, 'utf8');
        const assetContainer = {};
        eval(assetJsCode + "\nassetContainer.Asset = Asset; assetContainer.BookAsset = BookAsset;");
        AssetClass = assetContainer.Asset;
        BookAssetClass = assetContainer.BookAsset;
        global.Asset = AssetClass;
        global.BookAsset = BookAssetClass;

        // Load resource-director.js
        const resourceJsPath = path.resolve(__dirname, '../../../src/js/modules/storage/resource-director.js');
        const resourceJsCode = fs.readFileSync(resourceJsPath, 'utf8');
        const resourceContainer = {};
        eval(resourceJsCode + "\nresourceContainer.ResourceDirector = ResourceDirector;");
        ResourceDirectorClass = resourceContainer.ResourceDirector;
        global.ResourceDirector = ResourceDirectorClass;
    });

    test.after(() => {
        delete global.window;
        delete global.document;
        delete global.Asset;
        delete global.BookAsset;
        delete global.ResourceDirector;
    });

    test('Asset/BookAsset should initialize with correct status and be disposesable', () => {
        const bookAsset = new BookAssetClass('test-id', 'test-content');
        assert.strictEqual(bookAsset.id, 'test-id');
        assert.strictEqual(bookAsset.type, 'book');
        assert.strictEqual(bookAsset.status, 'loading');
        assert.strictEqual(bookAsset.content, 'test-content');

        bookAsset.dispose();
        assert.strictEqual(bookAsset.content, '');
        assert.strictEqual(bookAsset.status, 'failed');
    });

    test('ResourceDirector should load, cache, and unload books', async () => {
        const director = new ResourceDirectorClass();
        let loaderCalledCount = 0;
        const loaderFn = () => {
            loaderCalledCount++;
            return Promise.resolve('Book contents');
        };

        // 1. First Load
        const asset = await director.loadBook('book-1', 'book-1', loaderFn);
        assert.strictEqual(asset.status, 'ready');
        assert.strictEqual(asset.content, 'Book contents');
        assert.strictEqual(loaderCalledCount, 1);

        // 2. Load cached book (loader should not be called again)
        const cachedAsset = await director.loadBook('book-1', 'book-1', loaderFn);
        assert.strictEqual(cachedAsset.content, 'Book contents');
        assert.strictEqual(loaderCalledCount, 1);

        // 3. Unload book
        director.unload('book-1');
        assert.strictEqual(director.assets.has('book-1'), false);
    });

    test('T-S2 (Spoofing Mitigation): ResourceDirector should block loading from external origins', async () => {
        const director = new ResourceDirectorClass();
        const loaderFn = () => Promise.resolve('Untrusted external contents');

        try {
            await director.loadBook('malicious-id', 'https://untrusted-external-domain.com/book.txt', loaderFn);
            assert.fail('Expected Spoofing Validation to throw an error');
        } catch (err) {
            assert.match(err.message, /external origin is blocked/);
            const asset = director.assets.get('malicious-id');
            assert.strictEqual(asset.status, 'failed');
            assert.ok(asset.error);
        }
    });

    test('T-D2 (DoS Mitigation): ResourceDirector should reject files larger than 2MB safety limit', async () => {
        const director = new ResourceDirectorClass();
        // Generate raw text content larger than 2MB limit (2 * 1024 * 1024 + 1 characters)
        const hugeContent = 'a'.repeat(2 * 1024 * 1024 + 1);
        const loaderFn = () => Promise.resolve(hugeContent);

        try {
            await director.loadBook('huge-book', 'huge-book', loaderFn);
            assert.fail('Expected DoS limit check to throw an error');
        } catch (err) {
            assert.match(err.message, /exceeds the 2MB safety limit/);
            const asset = director.assets.get('huge-book');
            assert.strictEqual(asset.status, 'failed');
        }
    });
});
