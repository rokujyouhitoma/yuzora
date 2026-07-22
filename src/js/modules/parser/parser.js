/**
 * Yuzora - Aozora Bunko Text/HTML Parser & Sanitizer Module
 */
"use strict";


/**
 * @interface
 */
class DocumentParser {
    /**
     * @param {string} text
     * @return {!ParsedDocument}
     */
    parseText(text) {
        throw new Error('Interface method not implemented');
    }

    /**
     * @param {string} htmlString
     * @return {!ParsedDocument}
     */
    parseHTML(htmlString) {
        throw new Error('Interface method not implemented');
    }

    /**
     * @param {string} markupLine
     * @return {string}
     */
    formatMarkup(markupLine) {
        throw new Error('Interface method not implemented');
    }

    /**
     * @param {string} text
     * @param {function(string, string, string):(!Promise<void>|void)} onFirstChunkReady
     * @param {function(string):void} onChunkParsed
     * @param {function():void} onComplete
     * @param {function():boolean} shouldCancel
     * @return {!Promise<void>}
     */
    parseTextIncremental(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel) {
        throw new Error('Interface method not implemented');
    }
}
window['DocumentParser'] = DocumentParser;

/**
 * @implements {AozoraParserInterface}
 * @implements {DocumentParser}
 */
class AozoraParser {
    constructor() {
        /** @private {!AozoraTokenizerInterface} */
        this.tokenizer = /** @type {!AozoraTokenizerInterface} */ (Yuzora.locator.resolve(AozoraTokenizer));
        /** @private {!AozoraSemanticAnalyzerInterface} */
        this.semanticAnalyzer = /** @type {!AozoraSemanticAnalyzerInterface} */ (Yuzora.locator.resolve(AozoraSemanticAnalyzer));
        /** @private {!AozoraEvaluatorInterface} */
        this.evaluator = /** @type {!AozoraEvaluatorInterface} */ (Yuzora.locator.resolve(AozoraEvaluator));
        /** @private {!ConfigModelInterface} */
        this.configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
        /** @private @const {!DOMParser} */
        this.domParser = new DOMParser();
    }

    /**
     * @param {string} text
     * @return {!ParsedDocument}
     * @override
     */
    // @ts-expect-error
    parseText(text) {
        return this.parseAozoraText(text);
    }

    /**
     * @param {string} htmlString
     * @return {!ParsedDocument}
     * @override
     */
    // @ts-expect-error
    parseHTML(htmlString) {
        return this.parseAozoraHTML(htmlString);
    }

    /**
     * @param {string} markupLine
     * @return {string}
     * @override
     */
    // @ts-expect-error
    formatMarkup(markupLine) {
        return this.formatAozoraMarkup(markupLine);
    }

    /**
     * @param {string} text
     * @param {function(string, string, string):(!Promise<void>|void)} onFirstChunkReady
     * @param {function(string):void} onChunkParsed
     * @param {function():void} onComplete
     * @param {function():boolean} shouldCancel
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    parseTextIncremental(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel) {
        return this.parseAozoraTextIncremental(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel);
    }

    /**
     * @param {!Array} tokens
     * @return {!ASTNodeInterface}
     * @override
     */
    // @ts-expect-error
    // eslint-disable-next-line complexity
    parseTokensToAST(tokens) {
        const root = new RootNode([]);
        const stack = [root];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const current = stack[stack.length - 1];
            
            if (token['type'] === 'TEXT') {
                current.children.push(new TextNode(token['value'] || ''));
            } else if (token['type'] === 'RUBY') {
                current.children.push(new RubyNode(token['value'] || '', token['rt'] || ''));
            } else if (token['type'] === 'BOLD_START') {
                const node = new BoldNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token['type'] === 'BOLD_END') {
                if (stack.length > 1 && stack[stack.length - 1].type === 'Bold') {
                    stack.pop();
                }
            } else if (token['type'] === 'ITALIC_START') {
                const node = new ItalicNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token['type'] === 'ITALIC_END') {
                if (stack.length > 1 && stack[stack.length - 1].type === 'Italic') {
                    stack.pop();
                }
            } else if (token['type'] === 'BOUTEN_START') {
                const node = new BoutenNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token['type'] === 'BOUTEN_END') {
                if (stack.length > 1 && stack[stack.length - 1].type === 'Bouten') {
                    stack.pop();
                }
            }
        }
        
        return root;
    }

    /**
     * @param {string} text
     * @return {{ title: string, body: string }}
     * @override
     */
    // @ts-expect-error
    // eslint-disable-next-line complexity
    parseAozoraText(text) {
        const bookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
        if (bookModel) {
            bookModel.toc = [];
        }
        let headingIndex = 0;

        // Tokenizer を呼び出し、ブロックトークン配列を取得
        const blocks = this.tokenizer.tokenize(text);
        
        let title = '';
        let author = '';
        let textBlocksCount = 0;
        
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block['type'] !== 'BLOCK_EMPTY_LINE' && block['type'] !== 'BLOCK_PAGE_BREAK') {
                if (textBlocksCount === 0) {
                    title = this.cleanAozoraMetadata(block['value'] || '');
                    textBlocksCount++;
                } else if (textBlocksCount === 1) {
                    author = this.cleanAozoraMetadata(block['value'] || '');
                    textBlocksCount++;
                    break;
                }
            }
        }

        if (bookModel) {
            bookModel.title = title;
            bookModel.author = author;
        }

        const documentChildren = [];

        // Dynamic cover page generation
        documentChildren.push(new CoverPageNode(title, author));
        documentChildren.push(new PageBreakNode());

        let inHeader = true;
        let inSkipBlock = false;

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const line = block['value'] || '';

            if (inHeader) {
                if (line.includes('-------------------------------------------------------')) {
                    inHeader = false;
                    // Peek next blocks to see if it is indeed the symbol explanation block
                    const nextBlock = blocks[i + 1];
                    const nextLine = nextBlock ? (nextBlock['value'] || '').trim() : '';
                    const nextNextBlock = blocks[i + 2];
                    const nextNextLine = nextNextBlock ? (nextNextBlock['value'] || '').trim() : '';
                    if (nextLine.includes('【テキスト中に現れる記号について】') || nextNextLine.includes('【テキスト中に現れる記号について】')) {
                        inSkipBlock = true;
                    }
                    continue;
                }
                if (this.detectHeaderEnd(line, i)) {
                    inHeader = false;
                } else {
                    continue;
                }
            }

            if (inSkipBlock) {
                if (line.includes('-------------------------------------------------------')) {
                    inSkipBlock = false;
                }
                continue;
            }

            if (block['type'] === 'BLOCK_EMPTY_LINE') {
                documentChildren.push(new EmptyLineNode());
                continue;
            }

            if (block['type'] === 'BLOCK_PAGE_BREAK') {
                documentChildren.push(new PageBreakNode());
                continue;
            }

            // トークンからすでに解析済みの地下げ、揃え、見出しクラス/プロパティを取得
            const jisageClass = block['jisageClass'] || '';
            const alignmentClass = block['alignmentClass'] || '';
            
            // インラインASTの構築
            const inlineAST = this.parseTokensToAST(block['inlineTokens'] || []);
            const inlineChildren = inlineAST.children || [];

            if (block['type'] === 'BLOCK_HEADING') {
                const headingLevel = block['headingLevel'] || 2;
                const headingText = block['headingText'] || '';
                
                // 自動改ページの挿入判定 (headingPageBreakModeの設定値に応じた動的適用)
                const headingMode = this.configModel['headingPageBreakMode'] || 'large-medium';
                let isTarget = false;
                if (headingMode === 'large' && headingLevel === 2) {
                    isTarget = true;
                } else if (headingMode === 'large-medium' && (headingLevel === 2 || headingLevel === 3)) {
                    isTarget = true;
                } else if (headingMode === 'all' && (headingLevel === 2 || headingLevel === 3 || headingLevel === 4)) {
                    isTarget = true;
                }

                if (isTarget) {
                    let prevNode = null;
                    for (let j = documentChildren.length - 1; j >= 0; j--) {
                        if (documentChildren[j].type !== 'EmptyLine') {
                            prevNode = documentChildren[j];
                            break;
                        }
                    }
                    if (prevNode && 
                        prevNode.type !== 'Heading' && 
                        prevNode.type !== 'PageBreak' && 
                        prevNode.type !== 'CoverPage') {
                        documentChildren.push(new PageBreakNode());
                    }
                }

                const headingId = `toc-heading-${headingIndex}`;
                const cleanText = headingText
                    .replace(/[｜|]/g, '')
                    .replace(/《[^》]+》/g, '')
                    .trim();
                bookModel.toc.push({ id: headingId, text: cleanText, level: headingLevel });
                headingIndex++;
                documentChildren.push(new HeadingNode(headingLevel, headingId, inlineChildren, jisageClass, alignmentClass));
            } else {
                documentChildren.push(new ParagraphNode(jisageClass, alignmentClass, inlineChildren));
            }
        }

        const documentAST = new DocumentNode(documentChildren);
        const bodyContent = this.evaluator.evaluate(documentAST);

        return {
            title: title + (author ? ` (${author})` : ''),
            body: bodyContent
        };
    }

    /**
     * @param {string} htmlString
     * @return {{ title: string, body: string }}
     * @override
     */
    // @ts-expect-error
    parseAozoraHTML(htmlString) {
        const doc = this.domParser.parseFromString(htmlString, 'text/html');
        
        const titleEl = doc.querySelector('title');
        let title = titleEl ? titleEl.textContent : '';

        // Extract main body
        let mainBody = doc.querySelector('.main_body');
        if (!mainBody) {
            mainBody = doc.querySelector('body');
        }

        // Clean up metadata section if present in the HTML
        const bibliographicalInfo = mainBody.querySelector('.bibliographical_information');
        if (bibliographicalInfo) bibliographicalInfo.remove();
        
        const cardLink = mainBody.querySelector('.card_link');
        if (cardLink) cardLink.remove();

        // Sanitize DOM to prevent XSS (T-E2)
        this.evaluator.sanitizeDOM(mainBody);

        return {
            title: title || '',
            body: mainBody.innerHTML
        };
    }

    /**
     * @param {string} line
     * @return {string}
     * @override
     */
    // @ts-expect-error
    formatAozoraMarkup(line) {
        const tokens = this.tokenizer.tokenizeInline(line);
        let ast = this.parseTokensToAST(tokens);
        ast = this.semanticAnalyzer.analyze(ast);
        return this.evaluator.evaluate(ast);
    }

    /**
     * @private
     * @param {string} text
     * @return {string}
     */
    cleanAozoraMetadata(text) {
        if (!text) return '';
        return text.replace(/[｜|]/g, '')
                   .replace(/《[^》]+》/g, '')
                   .trim();
    }

    /**
     * @private
     * @param {string} line
     * @param {number} i
     * @return {boolean}
     */
    detectHeaderEnd(line, i) {
        if (line.includes('-------------------------------------------------------')) {
            return true;
        }
        if (line.includes('［＃') && (line.includes('始まり') || line.includes('目次'))) {
            return true;
        }
        if (line.trim().length > 0 && !line.startsWith('［＃') && i > 2) {
            return true;
        }
        return false;
    }

    /**
     * Parses plain text incrementally via a background Web Worker.
     * @override
     * @param {string} text
     * @param {function(string, string, string): (void|!Promise<void>)} onFirstChunkReady
     * @param {function(string): void} onChunkParsed
     * @param {function(): void} onComplete
     * @param {function(): boolean} shouldCancel
     * @return {!Promise<void>}
     */
    // @ts-expect-error
    async parseAozoraTextIncremental(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel) {
        // Inline Web Worker source code (contains static tokenizer implementation to completely avoid importScripts)
        const workerBlobCode = `
            class AozoraTokenizer {
                constructor() {}

                tokenize(text) {
                    const blocks = [];
                    const lines = text.split(/\\r?\\n/);
                    
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i];
                        
                        if (line.trim().length === 0) {
                            blocks.push({
                                'type': 'BLOCK_EMPTY_LINE',
                                'value': line
                            });
                            continue;
                        }
                        
                        if (line.trim() === '［＃改ページ］') {
                            blocks.push({
                                'type': 'BLOCK_PAGE_BREAK',
                                'value': line
                            });
                            continue;
                        }
                        
                        let jisageClass = '';
                        const numMatch = line.match(/［＃([０-９0-9]+)字下げ］/);
                        if (numMatch) {
                            const rawNum = numMatch[1];
                            const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                            const n = parseInt(cleanNum, 10);
                            jisageClass = 'jisage' + n;
                            line = line.replace(/［＃[０-９0-9]+字下げ］/, '');
                        }
                        
                        let alignmentClass = '';
                        if (line.includes('［＃地付き］')) {
                            alignmentClass = 'chitsuki';
                            line = line.replace(/［＃地付き］/g, '');
                        } else if (line.includes('［＃地寄せ］')) {
                            alignmentClass = 'chiyose';
                            line = line.replace(/［＃地寄せ］/g, '');
                        } else {
                            const chitageMatch = line.match(/［＃地から([０-９0-9]+)字上げ］/);
                            if (chitageMatch) {
                                const rawNum = chitageMatch[1];
                                const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                                const n = parseInt(cleanNum, 10);
                                alignmentClass = 'chitage-' + n;
                                line = line.replace(/［＃地から[０-９0-9]+字上げ］/g, '');
                            }
                        }
                        
                        let isHeading = false;
                        let headingLevel = 2;
                        let headingText = '';
                        const headingMatch = line.match(/［＃「([^」]+)」は(大|中|小)見出し］/);
                        if (headingMatch) {
                            isHeading = true;
                            headingText = headingMatch[1];
                            const levelChar = headingMatch[2];
                            if (levelChar === '大') headingLevel = 2;
                            else if (levelChar === '中') headingLevel = 3;
                            else if (levelChar === '小') headingLevel = 4;
                            line = line.replace(/［＃「[^」]+」は(?:大|中|小)見出し］/, '');
                        }
                        
                        const inlineTokens = this.tokenizeInline(line);
                        
                        if (isHeading) {
                            blocks.push({
                                'type': 'BLOCK_HEADING',
                                'value': line,
                                'headingLevel': headingLevel,
                                'headingText': headingText,
                                'jisageClass': jisageClass,
                                'alignmentClass': alignmentClass,
                                'inlineTokens': inlineTokens
                            });
                        } else {
                            blocks.push({
                                'type': 'BLOCK_PARAGRAPH',
                                'value': line,
                                'jisageClass': jisageClass,
                                'alignmentClass': alignmentClass,
                                'inlineTokens': inlineTokens
                            });
                        }
                    }
                    
                    return blocks;
                }

                tokenizeInline(text) {
                    const tokens = [];
                    let i = 0;
                    
                    while (i < text.length) {
                        if (text[i] === '｜' || text[i] === '|') {
                            const rubyEndIdx = text.indexOf('《', i);
                            if (rubyEndIdx !== -1) {
                                const rtEndIdx = text.indexOf('》', rubyEndIdx);
                                if (rtEndIdx !== -1) {
                                    const kanji = text.substring(i + 1, rubyEndIdx);
                                    const rt = text.substring(rubyEndIdx + 1, rtEndIdx);
                                    tokens.push({
                                        'type': 'RUBY',
                                        'value': kanji,
                                        'rt': rt
                                    });
                                    i = rtEndIdx + 1;
                                    continue;
                                }
                            }
                        }
                        
                        const kanjiMatch = text.substring(i).match(/^((?:[一-龠々仝〆〇ヶ]|※［＃二の字点、面区点番号1-2-22］)+|[A-Za-z]+)《([^》]+)》/);
                        if (kanjiMatch) {
                            tokens.push({
                                'type': 'RUBY',
                                'value': kanjiMatch[1],
                                'rt': kanjiMatch[2]
                            });
                            i += kanjiMatch[0].length;
                            continue;
                        }
                        
                        if (text.startsWith('［＃ここから太字］', i)) {
                            tokens.push({ 'type': 'BOLD_START' });
                            i += 9;
                            continue;
                        }
                        if (text.startsWith('［＃ここで太字終わり］', i)) {
                            tokens.push({ 'type': 'BOLD_END' });
                            i += 11;
                            continue;
                        }
                        if (text.startsWith('［＃ここから斜体］', i)) {
                            tokens.push({ 'type': 'ITALIC_START' });
                            i += 9;
                            continue;
                        }
                        if (text.startsWith('［＃ここで斜体終わり］', i)) {
                            tokens.push({ 'type': 'ITALIC_END' });
                            i += 11;
                            continue;
                        }
                        if (text.startsWith('［＃傍点］', i)) {
                            tokens.push({ 'type': 'BOUTEN_START' });
                            i += 5;
                            continue;
                        }
                        if (text.startsWith('［＃傍点終わり］', i)) {
                            tokens.push({ 'type': 'BOUTEN_END' });
                            i += 8;
                            continue;
                        }
                        if (text.startsWith('［＃', i)) {
                            const endIdx = text.indexOf('］', i);
                            if (endIdx !== -1) {
                                i = endIdx + 1;
                                continue;
                            }
                        }
                        
                        let nextSpecial = text.length;
                        const specials = ['｜', '|', '［＃', '《'];
                        for (let j = 0; j < specials.length; j++) {
                            const idx = text.indexOf(specials[j], i);
                            if (idx !== -1 && idx < nextSpecial) {
                                nextSpecial = idx;
                            }
                        }
                        
                        const textChunk = text.substring(i, nextSpecial);
                        if (text[nextSpecial] === '《') {
                            const nestedKanjiMatch = textChunk.match(/([一-龠々仝〆〇ヶ]+|[A-Za-z]+)$/);
                            if (nestedKanjiMatch) {
                                nextSpecial = i + nestedKanjiMatch.index;
                            }
                        }
                        
                        if (nextSpecial === i) {
                            tokens.push({
                                'type': 'TEXT',
                                'value': text[i]
                            });
                            i++;
                        } else {
                            tokens.push({
                                'type': 'TEXT',
                                'value': text.substring(i, nextSpecial)
                            });
                            i = nextSpecial;
                        }
                    }
                    
                    return tokens;
                }
            }

            self.onmessage = function(e) {
                const data = e.data;
                const type = data['type'];

                if (type === 'PARSE') {
                    const text = data['text'];
                    const chunkSize = data['chunkSize'] || 500;
                    try {
                        const tokenizerInstance = new AozoraTokenizer();
                        runTokenization(tokenizerInstance, text, chunkSize);
                    } catch (err) {
                        self.postMessage({ 'type': 'ERROR', 'error': err.message });
                    }
                }
            };

            function runTokenization(tokenizer, text, chunkSize) {
                const blocks = tokenizer.tokenize(text);
                
                let index = 0;
                let isFirst = true;

                function sendNextChunk() {
                    const limit = Math.min(index + chunkSize, blocks.length);
                    const chunkBlocks = blocks.slice(index, limit);
                    index = limit;

                    const isLast = (index >= blocks.length);
                    self.postMessage({
                        'type': 'BLOCKS_CHUNK',
                        'blocks': chunkBlocks,
                        'isFirst': isFirst,
                        'isLast': isLast
                    });
                    
                    isFirst = false;

                    if (!isLast) {
                        setTimeout(sendNextChunk, 0);
                    }
                }

                sendNextChunk();
            }
        `;

        const blob = new Blob([workerBlobCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        // State tracking on the main thread
        let headingIndex = 0;
        let inHeader = true;
        let inSkipBlock = false;
        const bookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
        if (bookModel) {
            bookModel.toc = [];
        }

        return new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
                const data = e.data;
                const type = data['type'];

                if (shouldCancel()) {
                    worker.terminate();
                    URL.revokeObjectURL(workerUrl);
                    resolve();
                    return;
                }

                if (type === 'BLOCKS_CHUNK') {
                    const chunkBlocks = data['blocks'];
                    const isFirst = data['isFirst'];
                    const isLast = data['isLast'];

                    // Convert tokenized blocks chunk into AST/HTML on the main thread safely
                    const parsedData = this.parseBlocksToHTMLIncremental(chunkBlocks, isFirst, headingIndex, inHeader, inSkipBlock);
                    headingIndex = parsedData.headingIndex;
                    inHeader = parsedData.inHeader;
                    inSkipBlock = parsedData.inSkipBlock;

                    if (isFirst) {
                        onFirstChunkReady(parsedData.title, parsedData.author, parsedData.html);
                    } else {
                        onChunkParsed(parsedData.html);
                    }

                    if (isLast) {
                        onComplete();
                        worker.terminate();
                        URL.revokeObjectURL(workerUrl);
                        resolve();
                    }
                } else if (type === 'ERROR') {
                    worker.terminate();
                    URL.revokeObjectURL(workerUrl);
                    reject(new Error(data['error']));
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
                reject(err);
            };

            // Trigger parsing directly
            worker.postMessage({
                'type': 'PARSE',
                'text': text,
                'chunkSize': 500
            });
        });
    }

    /**
     * Converts a chunk of blocks into HTML on the main thread.
     * @private
     * @param {!Array<!Object>} blocks
     * @param {boolean} isFirst
     * @param {number} headingIdx
     * @param {boolean} headerState
     * @param {boolean} skipState
     * @return {{ title: string, author: string, html: string, headingIndex: number, inHeader: boolean, inSkipBlock: boolean }}
     */
    // eslint-disable-next-line complexity
    parseBlocksToHTMLIncremental(blocks, isFirst, headingIdx, headerState, skipState) {
        const bookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
        if (!bookModel) {
            return { title: '', author: '', html: '', headingIndex: headingIdx, inHeader: headerState, inSkipBlock: skipState };
        }
        let title = '';
        let author = '';
        let textBlocksCount = 0;

        if (isFirst) {
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                if (block['type'] !== 'BLOCK_EMPTY_LINE' && block['type'] !== 'BLOCK_PAGE_BREAK') {
                    if (textBlocksCount === 0) {
                        title = this.cleanAozoraMetadata(block['value'] || '');
                        textBlocksCount++;
                    } else if (textBlocksCount === 1) {
                        author = this.cleanAozoraMetadata(block['value'] || '');
                        textBlocksCount++;
                        break;
                    }
                }
            }
        }

        const documentChildren = [];
        if (isFirst) {
            documentChildren.push(new CoverPageNode(title, author));
            documentChildren.push(new PageBreakNode());
        }

        let inHeader = headerState;
        let inSkipBlock = skipState;
        let headingIndex = headingIdx;

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const line = block['value'] || '';

            if (inHeader) {
                if (line.includes('-------------------------------------------------------')) {
                    inHeader = false;
                    const nextBlock = blocks[i + 1];
                    const nextLine = nextBlock ? (nextBlock['value'] || '').trim() : '';
                    const nextNextBlock = blocks[i + 2];
                    const nextNextLine = nextNextBlock ? (nextNextBlock['value'] || '').trim() : '';
                    if (nextLine.includes('【テキスト中に現れる記号について】') || nextNextLine.includes('【テキスト中に現れる記号について】')) {
                        inSkipBlock = true;
                    }
                    continue;
                }
                if (this.detectHeaderEnd(line, i)) {
                    inHeader = false;
                } else {
                    continue;
                }
            }

            if (inSkipBlock) {
                if (line.includes('-------------------------------------------------------')) {
                    inSkipBlock = false;
                }
                continue;
            }

            if (block['type'] === 'BLOCK_EMPTY_LINE') {
                documentChildren.push(new EmptyLineNode());
                continue;
            }

            if (block['type'] === 'BLOCK_PAGE_BREAK') {
                documentChildren.push(new PageBreakNode());
                continue;
            }

            const jisageClass = block['jisageClass'] || '';
            const alignmentClass = block['alignmentClass'] || '';
            
            const inlineAST = this.parseTokensToAST(block['inlineTokens'] || []);
            const inlineChildren = inlineAST.children || [];

            if (block['type'] === 'BLOCK_HEADING') {
                const headingLevel = block['headingLevel'] || 2;
                const headingText = block['headingText'] || '';
                
                const headingMode = this.configModel['headingPageBreakMode'] || 'large-medium';
                let isTarget = false;
                if (headingMode === 'large' && headingLevel === 2) {
                    isTarget = true;
                } else if (headingMode === 'large-medium' && (headingLevel === 2 || headingLevel === 3)) {
                    isTarget = true;
                } else if (headingMode === 'all' && (headingLevel === 2 || headingLevel === 3 || headingLevel === 4)) {
                    isTarget = true;
                }

                if (isTarget) {
                    let prevNode = null;
                    for (let j = documentChildren.length - 1; j >= 0; j--) {
                        if (documentChildren[j].type !== 'EmptyLine') {
                            prevNode = documentChildren[j];
                            break;
                        }
                    }
                    if (prevNode && 
                        prevNode.type !== 'Heading' && 
                        prevNode.type !== 'PageBreak' && 
                        prevNode.type !== 'CoverPage') {
                        documentChildren.push(new PageBreakNode());
                    }
                }

                const headingId = `toc-heading-${headingIndex}`;
                const cleanText = headingText
                    .replace(/[｜|]/g, '')
                    .replace(/《[^》]+》/g, '')
                    .trim();
                bookModel.toc.push({ id: headingId, text: cleanText, level: headingLevel });
                headingIndex++;
                documentChildren.push(new HeadingNode(headingLevel, headingId, inlineChildren, jisageClass, alignmentClass));
            } else {
                documentChildren.push(new ParagraphNode(jisageClass, alignmentClass, inlineChildren));
            }
        }

        const documentAST = new DocumentNode(documentChildren);
        const bodyContent = this.evaluator.evaluate(documentAST);

        return {
            title: title,
            author: author,
            html: bodyContent,
            headingIndex: headingIndex,
            inHeader: inHeader,
            inSkipBlock: inSkipBlock
        };
    }
}

window['AozoraParser'] = AozoraParser;
