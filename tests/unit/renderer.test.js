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
});
