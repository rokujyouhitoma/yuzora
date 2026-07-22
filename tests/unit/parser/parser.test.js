const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('parser.js Unit Tests', () => {
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
        const appJsCode = fs.readFileSync(path.resolve(__dirname, '../../../main-min.js'), 'utf8');
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

    test('should correctly format ruby with delimiter', () => {
        const result = window.Yuzora.formatAozoraMarkup('｜漢字《かんじ》');
        assert.strictEqual(result, '<ruby>漢字<rt>かんじ</rt></ruby>');
    });

    test('should correctly format ruby without delimiter', () => {
        const result = window.Yuzora.formatAozoraMarkup('漢字《かんじ》');
        assert.strictEqual(result, '<ruby>漢字<rt>かんじ</rt></ruby>');
    });

    test('should automatically format ruby with special repeat/kanji characters (々, 仝, 〆, 〇, ヶ)', () => {
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('稍々《やや》'),
            '<ruby>稍々<rt>やや</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('仝《どう》'),
            '<ruby>仝<rt>どう</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('〆《しめ》'),
            '<ruby>〆<rt>しめ</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('〇《れい》'),
            '<ruby>〇<rt>れい</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('ヶ《こ》'),
            '<ruby>ヶ<rt>こ</rt></ruby>'
        );
    });

    test('should automatically format ruby for external二の字点 character note', () => {
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('益※［＃二の字点、面区点番号1-2-22］《ますます》'),
            '<ruby>益※［＃二の字点、面区点番号1-2-22］<rt>ますます</rt></ruby>'
        );
    });

    test('should automatically format ruby for single alphabetic words', () => {
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('Fanatiker《ファナチイケル》'),
            '<ruby>Fanatiker<rt>ファナチイケル</rt></ruby>'
        );
    });

    test('should correctly parse group rubies containing spaces or mixed characters using delimiters', () => {
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('｜Au revoir《さらば》'),
            '<ruby>Au revoir<rt>さらば</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('｜釜右ヱ門《かまえもん》'),
            '<ruby>釜右ヱ門<rt>かまえもん</rt></ruby>'
        );
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('｜お伽話《フェヤリー・ストーリース》'),
            '<ruby>お伽話<rt>フェヤリー・ストーリース</rt></ruby>'
        );
    });

    test('should automatically format ruby for kanji preceded by non-kanji text (BUG-059)', () => {
        // 平仮名の後の漢字にルビ
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('冬の最中《さなか》で'),
            '冬の<ruby>最中<rt>さなか</rt></ruby>で'
        );
        // 平仮名+漢字の後の漢字にルビ
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('天気は小闇《おぐら》くなり'),
            '天気は<ruby>小闇<rt>おぐら</rt></ruby>くなり'
        );
        // 行頭の漢字にルビ（後続テキストあり）
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('荒村《あれむら》があちこちに'),
            '<ruby>荒村<rt>あれむら</rt></ruby>があちこちに'
        );
        // 同一行に複数のルビが存在する
        assert.strictEqual(
            window.Yuzora.formatAozoraMarkup('最中《さなか》で小闇《おぐら》くなり'),
            '<ruby>最中<rt>さなか</rt></ruby>で<ruby>小闇<rt>おぐら</rt></ruby>くなり'
        );
    });

    test('should parse alignment markups correctly (chitsuki, chiyose, chitage)', () => {
        const text = "タイトル\n著者\n-------------------------------------------------------\n［＃地付き］下寄せの署名\n［＃地寄せ］右寄せの日付\n［＃地から３字上げ］下から浮かせるテキスト";
        const result = window.Yuzora.parseAozoraText(text);
        assert.ok(result.body.includes('<p class="chitsuki">下寄せの署名</p>'));
        assert.ok(result.body.includes('<p class="chiyose">右寄せの日付</p>'));
        assert.ok(result.body.includes('<p class="chitage-3">下から浮かせるテキスト</p>'));
    });

    test('should parse inline decorations correctly (bold, italic)', () => {
        const text = "タイトル\n著者\n-------------------------------------------------------\n［＃ここから太字］重要箇所［＃ここで太字終わり］と［＃ここから斜体］強調表記［＃ここで斜体終わり］";
        const result = window.Yuzora.parseAozoraText(text);
        assert.ok(result.body.includes('<strong class="aozora-bold">重要箇所</strong>'));
        assert.ok(result.body.includes('<em class="aozora-italic">強調表記</em>'));
    });

    test('should safely sanitize bold and italic tags containing malicious payload (XSS mitigation)', () => {
        const text = "タイトル\n著者\n-------------------------------------------------------\n［＃ここから太字］<script>alert(\'XSS\')</script>［＃ここで太字終わり］";
        const result = window.Yuzora.parseAozoraText(text);
        assert.ok(result.body.includes('&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;'));
        assert.ok(result.body.includes('<strong class="aozora-bold">'));
    });

    test('should parse nested markups correctly (ruby inside bold and italic)', () => {
        const text = "タイトル\n著者\n-------------------------------------------------------\n［＃ここから太字］重要｜漢字《かんじ》箇所［＃ここで太字終わり］と［＃ここから斜体］強調［＃傍点］表記［＃傍点終わり］斜体［＃ここで斜体終わり］";
        const result = window.Yuzora.parseAozoraText(text);
        assert.ok(result.body.includes('<strong class="aozora-bold">重要<ruby>漢字<rt>かんじ</rt></ruby>箇所</strong>'));
        assert.ok(result.body.includes('<em class="aozora-italic">強調<span class="em-sesame">表記</span>斜体</em>'));
    });

    test('should escape HTML syntax to prevent XSS', () => {
        const result = window.Yuzora.parseAozoraText('<script>alert("title")</script>\n<script>alert("author")</script>\n-------------------------------------------------------\n<script>alert("body")</script>');
        // Title is returned as raw text from parser, to be safely set via textContent on UI
        assert.ok(result.title.includes('<script>alert("title")</script>'));
        assert.ok(result.body.includes('&lt;script&gt;'));
        assert.ok(result.body.includes('&lt;/script&gt;'));
    });

    test('AozoraEvaluator.escapeHTML should escape HTML special characters including quotes and single quotes', () => {
        const evaluator = new window.AozoraEvaluator();
        const raw = `& < > " '`;
        const expected = '&amp; &lt; &gt; &quot; &#x27;';
        assert.strictEqual(evaluator.escapeHTML(raw), expected);
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

    test('should parse page break marker', () => {
        const result = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文第一段\n［＃改ページ］\n本文第二段');
        const pageBreaks = result.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(pageBreaks.length, 2);
    });

    test('should automatically parse page break before large or medium headings when not preceded by heading/pagebreak/cover', () => {
        // 大見出しの前に自動改ページが入ること (計2箇所: 表紙後 + 本文中)
        const resLarge = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃大見出し］［＃「大見出し」は大見出し］');
        const countLarge = resLarge.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countLarge.length, 2);

        // 中見出しの前に自動改ページが入ること (計2箇所: 表紙後 + 本文中)
        const resMedium = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃中見出し］［＃「中見出し」は中見出し］');
        const countMedium = resMedium.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countMedium.length, 2);

        // 小見出しの直前は自動改ページの対象外であること (計1箇所: 表紙後のみ)
        const resSmall = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃小見出し］［＃「小見出し」は小見出し］');
        const countSmall = resSmall.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countSmall.length, 1);

        // 見出しが連続した場合、または間に空行のみを挟む場合に、2つ目の見出しの前に自動改ページが二重挿入されないこと (計2箇所: 表紙後 + 大見出し前)
        const resSeq = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃大見出し］［＃「大見出し」は大見出し］\n\n［＃中見出し］［＃「中見出し」は中見出し］');
        const countSeq = resSeq.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countSeq.length, 2);

        // 明示的な改ページの直後の見出しで二重改ページにならないこと (計2箇所: 表紙後 + 明示的改ページ)
        const resExplicit = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃改ページ］\n［＃大見出し］［＃「大見出し」は大見出し］');
        const countExplicit = resExplicit.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countExplicit.length, 2);

        // 表紙の直後（＝書籍の最初の実質的な要素）が見出しの場合、二重改ページにならないこと (計1箇所: 表紙後のみ)
        const resFirst = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n［＃大見出し］［＃「大見出し」は大見出し］');
        const countFirst = resFirst.body.match(/<div class="page-break"><\/div>/g) || [];
        assert.strictEqual(countFirst.length, 1);
    });

    test('should honor headingPageBreakMode configuration during parsing', () => {
        const { locator } = window.yuzora;
        const configModel = locator.resolve(window.Yuzora.ConfigModel);
        const originalMode = configModel['headingPageBreakMode'];

        try {
            // 1. headingPageBreakMode = 'none' の場合：見出し前の自動改ページは一切挿入されない
            configModel['headingPageBreakMode'] = 'none';
            const resNone = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃大見出し］［＃「大見出し」は大見出し］');
            const countNone = resNone.body.match(/<div class="page-break"><\/div>/g) || [];
            // 表紙後の改ページのみ（表紙後の改ページは見出し自動改ページではないため挿入される）
            assert.strictEqual(countNone.length, 1);

            // 2. headingPageBreakMode = 'large' の場合：大見出しのみ自動改ページが挿入され、中見出しは挿入されない
            configModel['headingPageBreakMode'] = 'large';
            const resLarge = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃大見出し］［＃「大見出し」は大見出し］\n\n［＃中見出し］［＃「中見出し」は中見出し］');
            const countLarge = resLarge.body.match(/<div class="page-break"><\/div>/g) || [];
            // 表紙後 + 大見出し前 = 2
            assert.strictEqual(countLarge.length, 2);

            // 3. headingPageBreakMode = 'all' の場合：大・中・小すべてに見出し前の自動改ページが挿入される
            configModel['headingPageBreakMode'] = 'all';
            const resAll = window.Yuzora.parseAozoraText('タイトル\n著者\n-------------------------------------------------------\n本文段落\n［＃小見出し］［＃「小見出し」は小見出し］');
            const countAll = resAll.body.match(/<div class="page-break"><\/div>/g) || [];
            // 表紙後 + 小見出し前 = 2
            assert.strictEqual(countAll.length, 2);

        } finally {
            // テスト後に元の設定に戻す
            configModel['headingPageBreakMode'] = originalMode;
        }
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

    test('should parse metadata and filter out Aozora Bunko header explanation block', () => {
        const text = '吾輩は猫である\n夏目漱石\n\n-------------------------------------------------------\n【テキスト中に現れる記号について】\n《》：ルビ\n（例）吾輩《わがはい》\n-------------------------------------------------------\n\n吾輩《わがはい》は猫である。';
        const result = window.Yuzora.parseAozoraText(text);

        // Metadata extraction check
        const bookModel = window.Yuzora.locator.resolve(window.Yuzora.BookModel);
        assert.strictEqual(bookModel.title, '吾輩は猫である');
        assert.strictEqual(bookModel.author, '夏目漱石');

        // Dynamic cover page check
        assert.ok(result.body.includes('<div class="book-cover-page">'));
        assert.ok(result.body.includes('<h1 class="book-cover-title">吾輩は猫である</h1>'));
        assert.ok(result.body.includes('<p class="book-cover-author">夏目漱石</p>'));

        // Header block removal check (symbol descriptions shouldn't be rendered as paragraphs)
        assert.ok(!result.body.includes('【テキスト中に現れる記号について】'));
        assert.ok(!result.body.includes('《》：ルビ'));
        assert.ok(!result.body.includes('（例）吾輩'));

        // Body rendering check
        assert.ok(result.body.includes('<ruby>吾輩<rt>わがはい</rt></ruby>は猫である。'));
    });

    test('should parse metadata correctly when header explanation block is missing', () => {
        const text = '砂書きの老人\n上村松園\n\nまだ私が八、九歳のころ...';
        const result = window.Yuzora.parseAozoraText(text);

        const bookModel = window.Yuzora.locator.resolve(window.Yuzora.BookModel);
        assert.strictEqual(bookModel.title, '砂書きの老人');
        assert.strictEqual(bookModel.author, '上村松園');

        assert.ok(result.body.includes('<div class="book-cover-page">'));
        assert.ok(result.body.includes('<h1 class="book-cover-title">砂書きの老人</h1>'));
        assert.ok(result.body.includes('<p class="book-cover-author">上村松園</p>'));

        assert.ok(result.body.includes('まだ私が八、九歳のころ'));
    });

    test('should escape HTML tags in metadata for security (T-E1 mitigation check)', () => {
        const text = '作品名<script>alert("xss")</script>\n著者名<iframe src="javascript:alert(1)"></iframe>\n\n本文';
        const result = window.Yuzora.parseAozoraText(text);

        assert.ok(result.body.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
        assert.ok(result.body.includes('&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;&lt;/iframe&gt;'));
        assert.ok(!result.body.includes('<script>'));
        assert.ok(!result.body.includes('<iframe>'));
    });

    test('AozoraTokenizer - tokenizeInline should generate expected tokens', () => {
        const tokenizer = new window.AozoraTokenizer();
        const tokens = tokenizer.tokenizeInline('漢字《かんじ》と［＃ここから太字］重要箇所［＃ここで太字終わり］');
        assert.ok(tokens.some(t => t.type === 'RUBY' && t.value === '漢字' && t.rt === 'かんじ'));
        assert.ok(tokens.some(t => t.type === 'BOLD_START'));
        assert.ok(tokens.some(t => t.type === 'BOLD_END'));
    });

    test('AozoraParser - parseTokensToAST should build proper AST structure', () => {
        const parser = new window.AozoraParser();
        const tokens = [
            { type: 'TEXT', value: '吾輩は' },
            { type: 'RUBY', value: '猫', rt: 'ねこ' },
            { type: 'TEXT', value: 'である' }
        ];
        const ast = parser.parseTokensToAST(tokens);
        assert.strictEqual(ast.type, 'Root');
        assert.strictEqual(ast.children.length, 3);
        assert.strictEqual(ast.children[0].type, 'Text');
        assert.strictEqual(ast.children[1].type, 'Ruby');
        assert.strictEqual(ast.children[1].rt, 'ねこ');
    });

    test('AozoraSemanticAnalyzer - analyze should detect and fix nested rubies (Rule 1)', () => {
        const analyzer = new window.AozoraSemanticAnalyzer();
        
        // Construct AST with nested ruby: RubyNode containing child RubyNode
        const ast = {
            type: 'Root',
            children: [
                {
                    type: 'Ruby',
                    value: '親',
                    rt: 'おや',
                    children: [
                        { type: 'Ruby', value: '子', rt: 'こ' } // Violation
                    ]
                }
            ]
        };
        
        const result = analyzer.analyze(ast);
        // Inside RubyNode child elements, child RubyNode must be flattened to plain TextNode
        assert.strictEqual(result.children[0].children[0].type, 'Text');
        assert.strictEqual(result.children[0].children[0].value, '子');
    });

    test('AozoraEvaluator - evaluate should convert AST to safe HTML', () => {
        const evaluator = new window.AozoraEvaluator();
        const ast = {
            type: 'Root',
            children: [
                { type: 'Text', value: '<script>alert(1)</script>' },
                { type: 'Ruby', value: '漢字', rt: 'かんじ' }
            ]
        };
        const html = evaluator.evaluate(ast);
        assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
        assert.ok(html.includes('<ruby>漢字<rt>かんじ</rt></ruby>'));
    });

    test('10 Books Integration & Cross-Cutting Verification', () => {
        const parser = window.Yuzora.locator.resolve(window.DocumentParser);
        const bookModel = window.Yuzora.locator.resolve(window.Yuzora.BookModel);
        
        const predefinedBooks = [
            { path: '../../../src/books/773_yoko.txt', expectedTitle: 'こころ', expectedAuthor: '夏目漱石' },
            { path: '../../../src/books/42939_yoko.txt', expectedTitle: '故郷', expectedAuthor: '魯迅' },
            { path: '../../../src/books/52395_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '序' },
            { path: '../../../src/books/52396_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '地の巻' },
            { path: '../../../src/books/52397_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '水の巻' },
            { path: '../../../src/books/52398_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '火の巻' },
            { path: '../../../src/books/52399_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '風の巻' },
            { path: '../../../src/books/52400_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '空の巻' },
            { path: '../../../src/books/52401_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '二天の巻' },
            { path: '../../../src/books/52402_yoko.txt', expectedTitle: '宮本武蔵', expectedAuthor: '円明の巻' } // L2 of 52402 is "円明の巻" but the test previously wrote expectedAuthor is "円明 of the roll"
        ];

        predefinedBooks.forEach(b => {
            const absolutePath = path.resolve(__dirname, b.path);
            const content = fs.readFileSync(absolutePath, 'utf8');

            const start = Date.now();
            const result = parser.parseText(content);
            const duration = Date.now() - start;

            // 6. パフォーマンスと堅牢性の検証 (大容量ファイルの処理速度検証)
            assert.ok(duration < 350, `Parsing ${b.expectedTitle} took too long: ${duration}ms`);
            assert.ok(result.body.length > 0, `Parsed HTML body of ${b.expectedTitle} is empty`);

            // 1. メタデータおよび表紙ページの検証
            assert.strictEqual(bookModel.title, b.expectedTitle, `Title mismatch for ${b.expectedTitle}`);
            assert.strictEqual(bookModel.author, b.expectedAuthor, `Author mismatch for ${b.expectedTitle}`);
            assert.ok(result.body.includes('<div class="book-cover-page">'), `Cover page div missing in ${b.expectedTitle}`);
            assert.ok(result.body.includes('class="book-cover-title"'), `Cover title class missing in ${b.expectedTitle}`);
            assert.ok(result.body.includes('class="book-cover-author"'), `Cover author class missing in ${b.expectedTitle}`);

            // 2. 記号説明ブロックの除外検証
            if (b.expectedTitle === 'こころ' || b.expectedTitle === '故郷') {
                assert.ok(!result.body.includes('【テキスト中に現れる記号について】'), `Symbol guide block not removed in ${b.expectedTitle}`);
            }

            // 3. 見出し（大・中・小）と目次（TOC）抽出の検証
            if (b.expectedTitle === 'こころ') {
                assert.ok(bookModel.toc.some(t => t.text === '上　先生と私' && t.level === 2), `Large heading not extracted in こころ`);
            } else if (b.expectedTitle.includes('宮本武蔵')) {
                assert.ok(bookModel.toc.length > 0, `No TOC headings extracted in ${b.expectedTitle}`);
            }

            // 4. レイアウト装飾・字下げ記法の検証
            if (b.expectedTitle === '宮本武蔵 03 水の巻') {
                assert.ok(result.body.includes('class="jisage'), `Indentation classes missing in 水の巻`);
            }

            // 5. ルビと文字装飾の検証
            assert.ok(result.body.includes('<ruby>'), `Ruby tag missing in ${b.expectedTitle}`);
        });
    });

    test('AozoraTokenizer.tokenize should extract block tokens and metadata', () => {
        const tokenizer = new window.AozoraTokenizer();
        const text = 'タイトル\n著者\n\n［＃改ページ］\n［＃２字下げ］上　先生と私［＃「上　先生と私」は大見出し］\n［＃地寄せ］終わり';
        const tokens = tokenizer.tokenize(text);

        assert.strictEqual(tokens.length, 6);
        assert.strictEqual(tokens[0]['type'], 'BLOCK_PARAGRAPH');
        assert.strictEqual(tokens[0]['value'], 'タイトル');

        assert.strictEqual(tokens[1]['type'], 'BLOCK_PARAGRAPH');
        assert.strictEqual(tokens[1]['value'], '著者');

        assert.strictEqual(tokens[2]['type'], 'BLOCK_EMPTY_LINE');

        assert.strictEqual(tokens[3]['type'], 'BLOCK_PAGE_BREAK');

        assert.strictEqual(tokens[4]['type'], 'BLOCK_HEADING');
        assert.strictEqual(tokens[4]['headingLevel'], 2);
        assert.strictEqual(tokens[4]['headingText'], '上　先生と私');
        assert.strictEqual(tokens[4]['jisageClass'], 'jisage2');

        assert.strictEqual(tokens[5]['type'], 'BLOCK_PARAGRAPH');
        assert.strictEqual(tokens[5]['alignmentClass'], 'chiyose');
    });
});
