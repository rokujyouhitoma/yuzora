/**
 * Yuzora - Aozora Bunko Text/HTML Parser & Sanitizer Module
 */
"use strict";

/**
 * @implements {AozoraParserInterface}
 */
class AozoraParser {
    constructor() {
        /** @private {!AozoraTokenizerInterface} */
        this.tokenizer = /** @type {!AozoraTokenizerInterface} */ (Yuzora.locator.resolve(AozoraTokenizer));
        /** @private {!AozoraSemanticAnalyzerInterface} */
        this.semanticAnalyzer = /** @type {!AozoraSemanticAnalyzerInterface} */ (Yuzora.locator.resolve(AozoraSemanticAnalyzer));
        /** @private {!AozoraEvaluatorInterface} */
        this.evaluator = /** @type {!AozoraEvaluatorInterface} */ (Yuzora.locator.resolve(AozoraEvaluator));
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
            
            if (token.type === 'TEXT') {
                current.children.push(new TextNode(token.value || ''));
            } else if (token.type === 'RUBY') {
                current.children.push(new RubyNode(token.value || '', token.rt || ''));
            } else if (token.type === 'BOLD_START') {
                const node = new BoldNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token.type === 'BOLD_END') {
                if (stack.length > 1 && stack[stack.length - 1].type === 'Bold') {
                    stack.pop();
                }
            } else if (token.type === 'ITALIC_START') {
                const node = new ItalicNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token.type === 'ITALIC_END') {
                if (stack.length > 1 && stack[stack.length - 1].type === 'Italic') {
                    stack.pop();
                }
            } else if (token.type === 'BOUTEN_START') {
                const node = new BoutenNode([]);
                current.children.push(node);
                stack.push(node);
            } else if (token.type === 'BOUTEN_END') {
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
        const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
        bookModel.toc = [];
        let headingIndex = 0;

        let lines = text.split(/\r?\n/);
        let title = '';
        let author = '';
        
        if (lines.length > 0) {
            title = this.cleanAozoraMetadata(lines[0]);
        }
        if (lines.length > 1) {
            author = this.cleanAozoraMetadata(lines[1]);
        }

        bookModel.title = title;
        bookModel.author = author;

        const documentChildren = [];

        // Dynamic cover page generation
        documentChildren.push(new CoverPageNode(title, author));
        documentChildren.push(new PageBreakNode());

        let inHeader = true;
        let inSkipBlock = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (inHeader) {
                if (line.includes('-------------------------------------------------------')) {
                    inHeader = false;
                    // Peek next lines to see if it is indeed the symbol explanation block
                    const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
                    const nextNextLine = lines[i + 2] ? lines[i + 2].trim() : '';
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

            if (line.trim().length === 0) {
                documentChildren.push(new EmptyLineNode());
                continue;
            }

            if (line.trim() === '［＃改ページ］') {
                documentChildren.push(new PageBreakNode());
                continue;
            }

            const { jisageClass, line: lineAfterJisage } = this.parseJisage(line);
            const { alignmentClass, line: lineAfterAlignment } = this.parseAlignment(lineAfterJisage);
            const { isHeading, headingLevel, headingText, line: finalLineText } = this.parseHeading(lineAfterAlignment);

            const inlineAST = this.parseLineToAST(finalLineText);

            if (isHeading) {
                const headingId = `toc-heading-${headingIndex}`;
                const cleanText = headingText
                    .replace(/[｜|]/g, '')
                    .replace(/《[^》]+》/g, '')
                    .trim();
                bookModel.toc.push({ id: headingId, text: cleanText, level: headingLevel });
                headingIndex++;
                documentChildren.push(new HeadingNode(headingLevel, headingId, inlineAST.children || [], jisageClass, alignmentClass));
            } else {
                documentChildren.push(new ParagraphNode(jisageClass, alignmentClass, inlineAST.children || []));
            }
        }

        const documentAST = new DocumentNode(documentChildren);
        const bodyContent = this.evaluator.evaluate(documentAST);

        return {
            title: this.evaluator.escapeHTML(title) + (author ? ` (${this.evaluator.escapeHTML(author)})` : ''),
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
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
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
        const ast = this.parseLineToAST(line);
        return this.evaluator.evaluate(ast);
    }

    /**
     * @private
     * @param {string} line
     * @return {!ASTNodeInterface}
     */
    parseLineToAST(line) {
        const tokens = this.tokenizer.tokenizeInline(line);
        let ast = this.parseTokensToAST(tokens);
        ast = this.semanticAnalyzer.analyze(ast);
        return ast;
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
     * @private
     * @param {string} line
     * @return {{ jisageClass: string, line: string }}
     */
    parseJisage(line) {
        let jisageClass = '';
        const jisageMatch = line.match(/［＃([０-９0-9]+)字下げ］/);
        if (jisageMatch) {
            const rawNum = jisageMatch[1];
            const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            const n = parseInt(cleanNum, 10);
            jisageClass = `jisage${n}`;
            line = line.replace(/［＃[０-９0-9]+字下げ］/, '');
        }
        return { jisageClass, line };
    }

    /**
     * @private
     * @param {string} line
     * @return {{ alignmentClass: string, line: string }}
     */
    parseAlignment(line) {
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
                alignmentClass = `chitage-${n}`;
                line = line.replace(/［＃地から[０-９0-9]+字上げ］/g, '');
            }
        }
        return { alignmentClass, line };
    }

    /**
     * @private
     * @param {string} line
     * @return {{ isHeading: boolean, headingLevel: number, headingText: string, line: string }}
     */
    parseHeading(line) {
        let isHeading = false;
        let headingLevel = 2; // Default to h2 for large heading
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
        return { isHeading, headingLevel, headingText, line };
    }

    /**
     * @private
     * @param {string} line
     * @param {string} jisageClass
     * @param {string} alignmentClass
     * @param {boolean} isHeading
     * @param {number} headingLevel
     * @param {string} headingText
     * @param {number} headingIndex
     * @return {{ html: string, headingIndex: number }}
     */
    buildLineHTML(line, jisageClass, alignmentClass, isHeading, headingLevel, headingText, headingIndex) {
        if (line.trim().length === 0) {
            return { html: '<p class="empty-line">&nbsp;</p>', headingIndex };
        }
        let classes = [];
        if (jisageClass) classes.push(jisageClass);
        if (alignmentClass) classes.push(alignmentClass);
        const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';

        if (isHeading) {
            const headingId = `toc-heading-${headingIndex}`;
            const cleanText = headingText
                .replace(/[｜|]/g, '')
                .replace(/《[^》]+》/g, '')
                .trim();
            Yuzora.locator.resolve(BookModel).toc.push({ id: headingId, text: cleanText, level: headingLevel });
            return {
                html: `<h${headingLevel} id="${headingId}"${classAttr}>${line}</h${headingLevel}>`,
                headingIndex: headingIndex + 1
            };
        }
        if (line.startsWith('<h2>') || line.startsWith('<h3>')) {
            return { html: line, headingIndex };
        }
        return { html: `<p${classAttr}>${line}</p>`, headingIndex };
    }
}

window['AozoraParser'] = AozoraParser;
