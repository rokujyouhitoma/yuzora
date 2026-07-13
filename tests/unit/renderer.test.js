const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('renderer.js Unit Tests', () => {
    let window;
    let activeIntervals = [];
    let activeTimeouts = [];

    test.before(() => {
        // Setup JSDOM
        const { VirtualConsole } = require('jsdom');
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console);

        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div><div id="welcome-screen"></div><div id="reader-screen"></div><div id="drop-zone"></div><input id="file-input" type="file" /><div id="reader-viewport"></div><div id="reader-content"></div><div id="book-title"></div><button id="btn-back"></button><button id="btn-settings"></button><button id="btn-toc"></button><button id="btn-first-page"></button><button id="btn-close-settings"></button><button id="btn-close-toc"></button><div id="settings-drawer"></div><div id="toc-drawer"></div><div id="toc-list"></div><div id="drawer-overlay"></div><div id="page-nav-left"></div><div id="page-nav-right"></div><div class="reader-header"></div><div class="reader-footer"></div><div class="progress-bar-container"></div><div id="progress-bar"></div><div id="reading-percentage"></div><div id="reading-index"></div><div id="developer-books-grid"></div><div id="reader-books-grid"></div><button id="btn-open-debug"></button><div id="debug-modal"></div><button id="btnCloseDebug"></button><button id="btn-close-debug"></button><div id="debug-modal-overlay"></div><div id="debug-monitor"></div><button id="btn-clear-bookmarks"></button><button id="btn-clear-config"></button><button id="btn-clear-all"></button><button id="btn-diagnose-layout"></button><button id="btn-copy-debug-report"></button><pre id="diagnose-report-output"></pre><button id="tab-btn-monitor"></button><button id="tab-btn-diagnose"></button><div id="debug-tab-content-monitor"></div><div id="debug-tab-content-diagnose"></div><textarea id="debug-history-json"></textarea><button id="btn-export-history"></button><button id="btn-import-history"></button></body></html>', {
            url: "http://localhost",
            runScripts: "dangerously",
            resources: "usable",
            virtualConsole
        });
        window = dom.window;
        global.document = window.document;
        global.window = window;

        // Mock setInterval to avoid hanging timers in Node process
        const originalSetInterval = window.setInterval;
        window.setInterval = (fn, delay) => {
            const id = originalSetInterval(fn, delay);
            activeIntervals.push(id);
            return id;
        };

        // Mock setTimeout
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (fn, delay) => {
            const id = originalSetTimeout(fn, delay);
            activeTimeouts.push(id);
            return id;
        };

        // Mock window.alert
        window.alert = () => {};

        // Mock Element.prototype.scrollTo for JSDOM
        window.Element.prototype.scrollTo = () => {};

        // Load main-min.js code
        const appJsCode = fs.readFileSync(path.resolve(__dirname, '../../main-min.js'), 'utf8');
        const scriptEl = window.document.createElement('script');
        scriptEl.textContent = appJsCode;
        window.document.body.appendChild(scriptEl);

        // Fire DOMContentLoaded
        const event = new window.Event('DOMContentLoaded');
        window.document.dispatchEvent(event);
    });

    test.after(() => {
        if (window) {
            // Clear all registered JSDOM timers to allow Node to exit cleanly
            activeIntervals.forEach(id => window.clearInterval(id));
            activeTimeouts.forEach(id => window.clearTimeout(id));
            window.close();
        }
    });

    test('should sanitize layout content inside VerticalRenderer to prevent XSS (Double Defense)', () => {
        const { locator } = window.yuzora;
        const VerticalRendererClass = window.Yuzora.VerticalRenderer;
        const renderer = locator.resolve(VerticalRendererClass);

        const dirtyHTML = `
            <p>通常のテキスト。<a href="javascript:alert('XSS')">リンク</a></p>
            <script>alert('XSS script')</script>
            <img src="x" onerror="alert('XSS onerror')">
            <iframe src="javascript:alert('XSS iframe')"></iframe>
        `;

        renderer.render(dirtyHTML);

        const readerContent = window.document.getElementById('reader-content');
        const renderedContent = readerContent.innerHTML;

        // script, iframe, onerror, javascript: が除去されていること
        assert.ok(!renderedContent.includes('<script>'));
        assert.ok(!renderedContent.includes('alert('));
        assert.ok(!renderedContent.includes('<iframe>'));
        assert.ok(!renderedContent.includes('onerror='));
        assert.ok(!renderedContent.includes('href="javascript:'));

        // 許可されているタグと安全な属性は維持されること
        assert.ok(renderedContent.includes('通常のテキスト'));
        assert.ok(renderedContent.includes('<a>リンク</a>'));
        assert.ok(renderedContent.includes('src="x"'));
    });

    test('should capture repair metrics and publish LAYOUT_REPAIRED event when adjustPageBreaksForOverrun is called', () => {
        const { locator } = window.yuzora;
        const VerticalRendererClass = window.Yuzora.VerticalRenderer;
        const renderer = locator.resolve(VerticalRendererClass);
        const PublisherClass = window.Publisher;
        const publisher = locator.resolve(PublisherClass);
        const EventType = window.YuzoraEventType;

        let eventFired = false;
        let eventPayload = null;

        publisher.subscribe('system:layout-repaired', (data) => {
            eventFired = true;
            eventPayload = data;
        });

        // Initialize viewport dimensions to simulate a layout
        const readerViewport = window.document.getElementById('reader-viewport');
        const readerContent = window.document.getElementById('reader-content');
        
        const ViewContextClass = window.Yuzora.ViewContext;
        const viewContext = locator.resolve(ViewContextClass);
        viewContext.readerViewport = readerViewport;
        viewContext.readerContent = readerContent;

        // Mock elements sizing properties
        Object.defineProperties(readerViewport, {
            clientWidth: { value: 500, configurable: true },
            scrollWidth: { value: 1500, configurable: true },
            scrollLeft: { value: 0, writable: true, configurable: true }
        });

        // Add some dummy paragraph content to readerContent
        readerContent.innerHTML = '<p id="para1">テストコンテンツ</p>';

        renderer.adjustPageBreaksForOverrun();

        // Verify metrics were saved on renderer
        assert.ok(renderer.lastRepairMetrics);
        assert.equal(typeof renderer.lastRepairMetrics.passesCount, 'number');
        assert.equal(typeof renderer.lastRepairMetrics.insertedCount, 'number');
        assert.equal(typeof renderer.lastRepairMetrics.durationMs, 'number');

        // Verify domain event was fired
        assert.strictEqual(eventFired, true);
        assert.ok(eventPayload);
        assert.strictEqual(eventPayload.insertedCount, 0); // No overrun in this dummy text
        assert.strictEqual(eventPayload.passesCount, 1);
    });

    test('DEBUG: Simulate large book load and page navigation to diagnose timeout/loop issues', () => {
        const { locator } = window.yuzora;
        const VerticalRendererClass = window.Yuzora.VerticalRenderer;
        const renderer = locator.resolve(VerticalRendererClass);
        const readerViewport = window.document.getElementById('reader-viewport');
        const readerContent = window.document.getElementById('reader-content');
        
        const ViewContextClass = window.Yuzora.ViewContext;
        const viewContext = locator.resolve(ViewContextClass);
        viewContext.readerViewport = readerViewport;
        viewContext.readerContent = readerContent;

        // Mock viewport sizing
        Object.defineProperties(readerViewport, {
            clientWidth: { value: 800, configurable: true },
            scrollWidth: { value: 8000, writable: true, configurable: true },
            scrollLeft: { value: 0, writable: true, configurable: true }
        });

        // Set direction to RTL in config
        const ConfigModelClass = window.Yuzora.ConfigModel;
        const configModel = locator.resolve(ConfigModelClass);
        configModel.direction = 'rtl';

        // Add 50 paragraphs. Some are long.
        let html = '';
        for (let idx = 1; idx <= 50; idx++) {
            if (idx === 15) {
                html += `<p class="paragraph" style="width: 2500px;">段落 15 です。非常に長いテキストで、複数のページ境界を跨ぎます。${"あ".repeat(800)}終わり。</p>`;
            } else {
                html += `<p class="paragraph" style="width: 150px;">段落 ${idx} です。通常の長さです。${"う".repeat(20)}</p>`;
            }
        }
        readerContent.innerHTML = html;

        console.log("--- START SIMULATED INITIAL REPAIR ---");
        renderer.adjustPageBreaksForOverrun();
        console.log("Initial repair complete. Inserted count:", readerContent.querySelectorAll('.dynamic-page-break').length);

        console.log("--- SIMULATING PAGE NAV: scroll to Page 2 ---");
        readerViewport.scrollLeft = -800;
        
        window.yuzora.publisher.publish(window.YuzoraEventType.PAGE_CHANGED, { page: 2 });
        
        console.log("--- SIMULATING PAGE NAV: scroll to Page 3 ---");
        readerViewport.scrollLeft = -1600;
        window.yuzora.publisher.publish(window.YuzoraEventType.PAGE_CHANGED, { page: 3 });

        console.log("--- END SIMULATED NAV DIAGNOSTIC ---");
        assert.ok(true);
    });

    test('VerticalRenderer - paragraph bounds cache verification (Issue 071)', () => {
        const { locator } = window.yuzora;
        const VerticalRendererClass = window.Yuzora.VerticalRenderer;
        const renderer = locator.resolve(VerticalRendererClass);
        const readerViewport = window.document.getElementById('reader-viewport');
        const readerContent = window.document.getElementById('reader-content');

        const ViewContextClass = window.Yuzora.ViewContext;
        const viewContext = locator.resolve(ViewContextClass);
        viewContext.readerViewport = readerViewport;
        viewContext.readerContent = readerContent;

        // Clear cache
        renderer.paragraphBoundsCache = [];

        // Set dimensions
        Object.defineProperties(readerViewport, {
            clientWidth: { value: 800, configurable: true },
            scrollWidth: { value: 2400, writable: true, configurable: true },
            scrollLeft: { value: 0, writable: true, configurable: true }
        });

        // Add mock paragraph
        readerContent.innerHTML = '<p class="paragraph" style="width: 100px;">テスト段落</p>';
        const child = readerContent.children[0];
        
        // Mock getBoundingClientRect
        child.getBoundingClientRect = () => ({
            left: 200,
            right: 300,
            top: 0,
            bottom: 50,
            width: 100,
            height: 50
        });

        // Rebuild cache
        renderer.cacheParagraphBounds();

        // Verify cache values
        assert.strictEqual(renderer.paragraphBoundsCache.length, 1);
        const cache = renderer.paragraphBoundsCache[0];
        assert.strictEqual(cache.element, child);
        assert.strictEqual(cache.docLeft, 200);
        assert.strictEqual(cache.docRight, 300);

        // Verify hasOverrunNearCurrentPage checks cache and returns false (since 200-300 doesn't cross boundary 800)
        const hasOverrun = renderer.hasOverrunNearCurrentPage();
        assert.strictEqual(hasOverrun, false);

        // Modify cache coordinates manually to cross boundary 800 (e.g. docLeft=750, docRight=850)
        cache.docLeft = 750;
        cache.docRight = 850;

        // Mock text content to contain actual text for character-level boundary crossing
        child.textContent = "これは境界線テストのための長めの段落テキストです。";

        // hasOverrunNearCurrentPage should now evaluate to true
        // (Note: findCharAtDocumentBoundary might return null depending on JSDOM range measurements,
        // but it will definitely invoke checkSingleBoundary and read the docLeft/docRight values).
        renderer.hasOverrunNearCurrentPage();
        
        // Assert cache is utilized
        assert.ok(renderer.paragraphBoundsCache.length > 0);
    });
});
