const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Yuzora Hash Router Unit Tests', () => {
    let window;
    let document;
    let RouterClass;

    test.before(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: "http://localhost",
            runScripts: "dangerously"
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;

        // Load router.js
        const routerJsPath = path.resolve(__dirname, '../../../src/js/frameworks/router.js');
        const routerJsCode = fs.readFileSync(routerJsPath, 'utf8');
        
        const container = {};
        eval(routerJsCode + "\ncontainer.Router = Router;");
        RouterClass = container.Router;
    });

    test.after(() => {
        delete global.window;
        delete global.document;
    });

    test('should register routes and trigger callbacks on resolve()', () => {
        const router = new RouterClass();
        let welcomeCalled = false;
        let readerParams = null;

        router.register("/welcome", () => {
            welcomeCalled = true;
        });

        router.register("/reader", (params) => {
            readerParams = params;
        });

        // 1. Resolve empty/welcome hash path
        router.resolve("#");
        assert.strictEqual(welcomeCalled, true);
        assert.strictEqual(router.currentHash, "#");

        // 2. Resolve reader path with parameters
        router.resolve("#/reader?book=kokoro&type=predefined");
        assert.deepStrictEqual(readerParams, { book: "kokoro", type: "predefined" });
        assert.strictEqual(router.currentHash, "#/reader?book=kokoro&type=predefined");
    });

    test('should prevent double resolution of the same hash', () => {
        const router = new RouterClass();
        let callCount = 0;

        router.register("/welcome", () => {
            callCount++;
        });

        // First resolution
        const firstResult = router.resolve("#/welcome");
        assert.strictEqual(firstResult, true);
        assert.strictEqual(callCount, 1);

        // Second resolution with the same hash
        const secondResult = router.resolve("#/welcome");
        assert.strictEqual(secondResult, false, "Should return false as it is already the current hash");
        assert.strictEqual(callCount, 1, "Callback should not be called again");
    });

    test('should update location.hash on navigate()', () => {
        const router = new RouterClass();
        window.location.hash = "";

        router.navigate("/welcome");
        assert.strictEqual(window.location.hash, "#/welcome");
    });

    test('should trigger route callback on window hashchange event when listen() is active', (t, done) => {
        const router = new RouterClass();
        window.location.hash = "";

        let resolvedParams = null;
        router.register("/reader", (params) => {
            resolvedParams = params;
            
            // Clean up and finish test
            assert.deepStrictEqual(resolvedParams, { book: "sanshiro" });
            done();
        });

        router.listen();
        
        // Trigger hash change
        window.location.hash = "#/reader?book=sanshiro";
    });

    test('should redirect to default route when listen() starts on empty hash', (t, done) => {
        const router = new RouterClass("welcome");
        window.location.hash = "";

        router.register("/welcome", () => {
            assert.strictEqual(window.location.hash, "#/welcome");
            done();
        });

        router.listen();
    });
});
