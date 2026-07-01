const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Yuzora Event Driven Architecture Unit Tests', () => {
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

        // Mock setInterval
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

        window.alert = () => {};
        window.Element.prototype.scrollTo = () => {};

        // Load main-min.js code
        const appJsCode = fs.readFileSync(path.resolve(__dirname, '../../main-min.js'), 'utf8');
        const scriptEl = window.document.createElement('script');
        scriptEl.textContent = appJsCode;
        window.document.body.appendChild(scriptEl);

        const event = new window.Event('DOMContentLoaded');
        window.document.dispatchEvent(event);
    });

    test.after(() => {
        if (window) {
            activeIntervals.forEach(id => window.clearInterval(id));
            activeTimeouts.forEach(id => window.clearTimeout(id));
            window.close();
        }
    });

    test('should expose YuzoraEventTarget in locator', () => {
        const { locator, YuzoraEventTarget } = window;
        assert.ok(YuzoraEventTarget);
        const eventBus = locator.resolve(YuzoraEventTarget);
        assert.ok(eventBus instanceof YuzoraEventTarget);
    });

    test('should register and dispatch event successfully with details payload', () => {
        const { locator, YuzoraEventTarget, YuzoraEvent } = window;
        const eventBus = locator.resolve(YuzoraEventTarget);

        let receivedEvent = null;
        const listener = (e) => {
            receivedEvent = e;
        };

        eventBus.addEventListener('test-event', listener);
        
        const payload = { val: 123, str: 'hello' };
        const event = new YuzoraEvent('test-event', payload);
        eventBus.dispatchEvent(event);

        assert.ok(receivedEvent);
        assert.strictEqual(receivedEvent.type, 'test-event');
        assert.deepStrictEqual(receivedEvent.detail, payload);
        assert.strictEqual(receivedEvent.target, eventBus);

        // Cleanup
        eventBus.removeEventListener('test-event', listener);
    });

    test('should stop notifying listeners after removeEventListener is called', () => {
        const { locator, YuzoraEventTarget, YuzoraEvent } = window;
        const eventBus = locator.resolve(YuzoraEventTarget);

        let count = 0;
        const listener = () => {
            count++;
        };

        eventBus.addEventListener('remove-test', listener);
        eventBus.dispatchEvent(new YuzoraEvent('remove-test'));
        assert.strictEqual(count, 1);

        eventBus.removeEventListener('remove-test', listener);
        eventBus.dispatchEvent(new YuzoraEvent('remove-test'));
        assert.strictEqual(count, 1); // Should remain 1
    });

    test('should resolve Publisher in locator and support subscribe/publish', () => {
        const { locator, Publisher } = window;
        assert.ok(Publisher);
        const publisher = locator.resolve(Publisher);
        assert.ok(publisher instanceof Publisher);

        let receivedData = null;
        const callback = (data) => {
            receivedData = data;
        };

        publisher.subscribe('pubsub-test', callback);
        publisher.publish('pubsub-test', { val: 456 });
        assert.deepStrictEqual(receivedData, { val: 456 });

        // Cleanup
        publisher.unsubscribe('pubsub-test', callback);
    });

    test('should stop notifying subscriber after unsubscribe is called', () => {
        const { locator, Publisher } = window;
        const publisher = locator.resolve(Publisher);

        let count = 0;
        const callback = () => {
            count++;
        };

        publisher.subscribe('unsubscribe-test', callback);
        publisher.publish('unsubscribe-test');
        assert.strictEqual(count, 1);

        publisher.unsubscribe('unsubscribe-test', callback);
        publisher.publish('unsubscribe-test');
        assert.strictEqual(count, 1); // Should remain 1
    });

    test('should support same callback registered on multiple topics independently', () => {
        const { locator, Publisher } = window;
        const publisher = locator.resolve(Publisher);

        let lastTopic = null;
        let count = 0;
        const callback = (data) => {
            count++;
            lastTopic = data;
        };

        publisher.subscribe('topic-a', callback);
        publisher.subscribe('topic-b', callback);

        publisher.publish('topic-a', 'A');
        assert.strictEqual(count, 1);
        assert.strictEqual(lastTopic, 'A');

        publisher.publish('topic-b', 'B');
        assert.strictEqual(count, 2);
        assert.strictEqual(lastTopic, 'B');

        // Unsubscribe one topic
        publisher.unsubscribe('topic-a', callback);

        publisher.publish('topic-a', 'A');
        assert.strictEqual(count, 2); // No change

        publisher.publish('topic-b', 'B2');
        assert.strictEqual(count, 3); // Incremented
        assert.strictEqual(lastTopic, 'B2');

        // Cleanup
        publisher.unsubscribe('topic-b', callback);
    });
});
