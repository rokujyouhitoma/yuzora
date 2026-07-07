const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Yuzora Parser Unit Tests', () => {
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

    test('should expose Yuzora object on window', () => {
        assert.ok(window.Yuzora);
        assert.strictEqual(typeof window.Yuzora.parseAozoraText, 'function');
        assert.strictEqual(typeof window.Yuzora.formatAozoraMarkup, 'function');
    });

    test('should correctly format ruby with delimiter', () => {
        const result = window.Yuzora.formatAozoraMarkup('｜漢字《かんじ》');
        assert.strictEqual(result, '<ruby>漢字<rt>かんじ</rt></ruby>');
    });

    test('should correctly format ruby without delimiter', () => {
        const result = window.Yuzora.formatAozoraMarkup('漢字《かんじ》');
        assert.strictEqual(result, '<ruby>漢字<rt>かんじ</rt></ruby>');
    });

    test('should escape HTML syntax to prevent XSS', () => {
        const result = window.Yuzora.parseAozoraText('<script>alert("title")</script>\n<script>alert("author")</script>\n-------------------------------------------------------\n<script>alert("body")</script>');
        assert.ok(result.title.includes('&lt;script&gt;'));
        assert.ok(result.title.includes('&lt;/script&gt;'));
        assert.ok(result.body.includes('&lt;script&gt;'));
        assert.ok(result.body.includes('&lt;/script&gt;'));
    });

    test('should sanitize HTML structure to prevent XSS (T-E2)', () => {
        const dirtyHTML = `
            <html>
            <head><title>悪意ある本</title></head>
            <body class="main_body" onload="alert('XSS root')">
                <h1>第一章</h1>
                <p>安全なテキスト。<a href="javascript:alert('XSS href')">リンク</a></p>
                <script>alert('XSS script')</script>
                <iframe src="javascript:alert('XSS iframe')"></iframe>
                <img src="valid.png" onerror="alert('XSS onerror')" alt="画像">
                <div style="color: red;" data-custom="unsafe">スタイルとカスタム属性</div>
            </body>
            </html>
        `;
        const result = window.Yuzora.parseAozoraHTML(dirtyHTML);
        
        assert.strictEqual(result.title, '悪意ある本');
        
        // script や iframe が削除されていること
        assert.ok(!result.body.includes('<script>'));
        assert.ok(!result.body.includes('alert('));
        assert.ok(!result.body.includes('<iframe>'));
        
        // onload や onerror、href="javascript:..." が削除されていること
        assert.ok(!result.body.includes('onload='));
        assert.ok(!result.body.includes('onerror='));
        assert.ok(!result.body.includes('href="javascript:'));
        
        // 許可されていない style や data-custom 属性が削除されていること
        assert.ok(!result.body.includes('style='));
        assert.ok(!result.body.includes('data-custom='));
        
        // 許可されているタグと安全な属性は維持されること
        assert.ok(result.body.includes('<h1>第一章</h1>'));
        assert.ok(result.body.includes('<a>リンク</a>'));
        assert.ok(result.body.includes('src="valid.png"'));
        assert.ok(result.body.includes('alt="画像"'));
        assert.ok(result.body.includes('<div>スタイルとカスタム属性</div>'));
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

    test('should parse page break marker', () => {
        const result = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文第一段\n［＃改ページ］\n本文第二段');
        assert.ok(result.body.includes('<div class="page-break"></div>'));
    });

    test('should parse headings (large, medium, small) and preserve rubies inside', () => {
        const resultLarge = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n［＃２字下げ］上　先生と私［＃「上　先生と私」は大見出し］');
        assert.ok(resultLarge.body.includes('<h2 id="toc-heading-0" class="jisage2">上　先生と私</h2>'));
        const tocLarge = window.Yuzora.getCurrentTOC();
        assert.equal(tocLarge.length, 1);
        assert.equal(tocLarge[0].id, 'toc-heading-0');
        assert.equal(tocLarge[0].text, '上　先生と私');
        assert.equal(tocLarge[0].level, 2);

        const resultMedium = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n［＃５字下げ］一［＃「一」は中見出し］');
        assert.ok(resultMedium.body.includes('<h3 id="toc-heading-0" class="jisage5">一</h3>'));
        const tocMedium = window.Yuzora.getCurrentTOC();
        assert.equal(tocMedium.length, 1);
        assert.equal(tocMedium[0].text, '一');
        assert.equal(tocMedium[0].level, 3);

        const resultWithRuby = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n［＃３字下げ］衆口《しゅうこう》［＃「衆口」は大見出し］');
        assert.ok(resultWithRuby.body.includes('<h2 id="toc-heading-0" class="jisage3"><ruby>衆口<rt>しゅうこう</rt></ruby></h2>'));
        const tocWithRuby = window.Yuzora.getCurrentTOC();
        assert.equal(tocWithRuby.length, 1);
        assert.equal(tocWithRuby[0].text, '衆口');
        assert.equal(tocWithRuby[0].level, 2);
    });

    test('should expose runLayoutDiagnosis on Yuzora and run it successfully', () => {
        assert.ok(window.Yuzora.runLayoutDiagnosis);
        const report = window.Yuzora.runLayoutDiagnosis();
        assert.ok(report.includes('レイアウト診断レポート'));
        assert.ok(report.includes('アライメント検証'));
    });

    test.describe('Command Pattern & History Manager', () => {
        test('should execute commands and track history within 100 limit (with LoadBook protection)', () => {
            const { CommandManager, LoadBookCommand, NavigatePageCommand } = window.Yuzora;
            assert.ok(CommandManager);

            // Reset history
            CommandManager.commandHistory = [];

            // 1. Initial LoadBookCommand
            const loadCmd = new LoadBookCommand("test.txt", "content");
            CommandManager.execute(loadCmd);
            assert.equal(CommandManager.commandHistory.length, 1);
            assert.equal(CommandManager.commandHistory[0].type, "LoadBook");

            // 2. Push 105 more commands to verify 100 limit FIFO behavior
            for (let i = 0; i < 105; i++) {
                CommandManager.execute(new NavigatePageCommand(i + 2));
            }

            // History length should clip to 100
            assert.equal(CommandManager.commandHistory.length, 100);

            // Index 0 must remain LoadBookCommand (fixed protection)
            assert.equal(CommandManager.commandHistory[0].type, "LoadBook");
            assert.equal(CommandManager.commandHistory[0].fileName, "test.txt");

            // Index 1 must be NavigatePageCommand (the oldest remaining after FIFO)
            assert.equal(CommandManager.commandHistory[1].type, "NavigatePage");
        });

        test('should serialize and deserialize command history to JSON', () => {
            const { CommandManager, LoadBookCommand, NavigatePageCommand, UpdateConfigCommand } = window.Yuzora;
            
            CommandManager.commandHistory = [];
            CommandManager.execute(new LoadBookCommand("novel.txt", "Once upon a time..."));
            CommandManager.execute(new UpdateConfigCommand("theme", "dark"));
            CommandManager.execute(new NavigatePageCommand(5));

            const json = CommandManager.exportJSON();
            assert.ok(json.includes("LoadBook"));
            assert.ok(json.includes("UpdateConfig"));
            assert.ok(json.includes("NavigatePage"));

            // Parse and restore
            const restored = CommandManager.importJSON(json);
            assert.equal(restored.length, 3);
            assert.equal(restored[0].type, "LoadBook");
            assert.equal(restored[0].fileName, "novel.txt");
            assert.equal(restored[1].type, "UpdateConfig");
            assert.equal(restored[1].configKey, "theme");
            assert.equal(restored[1].configValue, "dark");
            assert.equal(restored[2].type, "NavigatePage");
            assert.equal(restored[2].targetPage, 5);
        });

        test('should catch invalid JSON input and return null', () => {
            const { CommandManager } = window.Yuzora;
            const invalidJson = "{ invalid: json }";
            const result = CommandManager.importJSON(invalidJson);
            assert.equal(result, null);
        });

        test('should filter out and skip prototype pollution payloads', () => {
            const { CommandManager } = window.Yuzora;
            const maliciousJson = JSON.stringify([
                {
                    type: "UpdateConfig",
                    params: {
                        configKey: "__proto__",
                        configValue: "polluted"
                    }
                },
                {
                    type: "UpdateConfig",
                    params: {
                        configKey: "constructor",
                        configValue: "polluted"
                    }
                },
                {
                    type: "UpdateConfig",
                    params: {
                        configKey: "theme",
                        configValue: "dark"
                    }
                }
            ]);
            const restored = CommandManager.importJSON(maliciousJson);
            assert.equal(restored.length, 1);
            assert.equal(restored[0].type, "UpdateConfig");
            assert.equal(restored[0].configKey, "theme");
            assert.equal(restored[0].configValue, "dark");
            assert.equal(Object.prototype["theme"], undefined);
        });

        test('should filter out and skip invalid command properties or unknown types', () => {
            const { CommandManager } = window.Yuzora;
            const invalidCommandsJson = JSON.stringify([
                {
                    type: "UpdateConfig",
                    params: {
                        configKey: "theme",
                        configValue: "malicious-theme-hack"
                    }
                },
                {
                    type: "NavigatePage",
                    params: {
                        targetPage: -5
                    }
                },
                {
                    type: "FakeCommandType",
                    params: {
                        open: true
                    }
                },
                {
                    type: "SyncBookmark",
                    params: {
                        progress: 0.5
                    }
                }
            ]);
            const restored = CommandManager.importJSON(invalidCommandsJson);
            assert.equal(restored.length, 1);
            assert.equal(restored[0].type, "SyncBookmark");
            assert.equal(restored[0].progress, 0.5);
        });
    });

    test.describe('Locator Pattern', () => {
        test('should resolve registered instances correctly', () => {
            const { locator } = window;
            class DummyService {}
            const dummy = new DummyService();
            locator.register(DummyService, dummy);
            assert.strictEqual(locator.resolve(DummyService), dummy);
        });

        test('should throw error for unregistered classes in resolve()', () => {
            const { locator } = window;
            class UnregisteredService {}
            assert.throws(() => {
                locator.resolve(UnregisteredService);
            }, /is not registered in Locator/);
        });

        test('should auto-instantiate unregistered classes in locate()', () => {
            const { locator } = window;
            class AutoService {
                constructor() {
                    this.value = 42;
                }
            }
            const instance = locator.locate(AutoService);
            assert.ok(instance instanceof AutoService);
            assert.equal(instance.value, 42);
            assert.strictEqual(locator.locate(AutoService), instance); // Returns the same cached instance
        });
    });
});
