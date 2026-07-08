const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Welcome Loading Placeholders (Skeleton) Unit Tests', () => {
    let window;
    let document;
    let uiModuleCode;

    test.before(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="developer-books-grid"></div><div id="reader-books-grid"></div></body></html>', {
            url: "http://localhost",
            runScripts: "dangerously"
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;

        class ViewContext {}
        class SceneDirector {}
        global.ViewContext = ViewContext;
        global.SceneDirector = SceneDirector;

        // Mock PREDEFINED_BOOKS globals
        global.PREDEFINED_BOOKS = [
            { id: "kokoro", title: "こころ", shortTitle: "こころ", author: "夏目漱石", category: "developer", path: "books/kokoro.txt" },
            { id: "rashomon", title: "羅生門", shortTitle: "羅生門", author: "芥川龍之介", category: "reader", path: "books/rashomon.txt" }
        ];

        // Mock Locator, ViewContext, SceneDirector and Yuzora objects
        const mockLocator = {
            resolve: (Class) => {
                if (Class.name === 'ViewContext') {
                    return {
                        developerBooksGrid: document.getElementById('developer-books-grid'),
                        readerBooksGrid: document.getElementById('reader-books-grid')
                    };
                }
                if (Class.name === 'SceneDirector') {
                    return {
                        currentSceneName: 'welcome'
                    };
                }
                return {};
            }
        };

        global.Yuzora = {
            locator: mockLocator
        };

        // Mock welcome bind utility in global scope
        global.bindWelcomeEvent_ = () => {};

        // Load ui.js to get setupPredefinedBooksGrids
        const uiJsPath = path.resolve(__dirname, '../../src/js/modules/ui.js');
        const uiJsCode = fs.readFileSync(uiJsPath, 'utf8');
        
        // Eval and bind to global context
        eval(uiJsCode + "\nglobal.setupPredefinedBooksGrids = setupPredefinedBooksGrids;");
    });

    test.after(() => {
        delete global.window;
        delete global.document;
        delete global.ViewContext;
        delete global.SceneDirector;
        delete global.PREDEFINED_BOOKS;
        delete global.Yuzora;
        delete global.bindWelcomeEvent_;
        delete global.setupPredefinedBooksGrids;
    });

    test('should render skeleton cards initially, then replace them with actual cards after delay', async () => {
        const devGrid = document.getElementById('developer-books-grid');
        const readerGrid = document.getElementById('reader-books-grid');

        // 1. Trigger grids setup
        global.setupPredefinedBooksGrids();

        // Wait for deferred initialization (1 frame + timeout)
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Check initial state (should show skeletons)
        const devSkeletons = devGrid.querySelectorAll('.book-card-skeleton');
        const readerSkeletons = readerGrid.querySelectorAll('.book-card-skeleton');
        assert.strictEqual(devSkeletons.length, 3);
        assert.strictEqual(readerSkeletons.length, 3);

        const devCardsBefore = devGrid.querySelectorAll('.book-card');
        assert.strictEqual(devCardsBefore.length, 0);

        // 3. Wait for timer delay (600ms + margin, minus previous 50ms wait)
        await new Promise(resolve => setTimeout(resolve, 600));

        // 4. Verify skeletons are replaced with actual card list
        const devSkeletonsAfter = devGrid.querySelectorAll('.book-card-skeleton');
        assert.strictEqual(devSkeletonsAfter.length, 0);

        const devCardsAfter = devGrid.querySelectorAll('.book-card');
        const readerCardsAfter = readerGrid.querySelectorAll('.book-card');
        
        assert.strictEqual(devCardsAfter.length, 1);
        assert.strictEqual(devCardsAfter[0].querySelector('.book-card-title').textContent, 'こころ');
        assert.strictEqual(devCardsAfter[0].classList.contains('fade-in'), true);

        assert.strictEqual(readerCardsAfter.length, 1);
        assert.strictEqual(readerCardsAfter[0].querySelector('.book-card-title').textContent, '羅生門');
        assert.strictEqual(readerCardsAfter[0].classList.contains('fade-in'), true);
    });
});
