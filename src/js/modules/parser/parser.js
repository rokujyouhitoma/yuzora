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
        /** @private {!ConfigModelInterface} */
        this.configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
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
        const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
        bookModel.toc = [];
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

        bookModel.title = title;
        bookModel.author = author;

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
}

window['AozoraParser'] = AozoraParser;
