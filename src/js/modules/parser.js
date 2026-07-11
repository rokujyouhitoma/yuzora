/**
 * Yuzora - Aozora Bunko Text/HTML Parser & Sanitizer Module
 */
"use strict";

function detectHeaderEnd(line, i) {
    if (line.includes('-------------------------------------------------------')) {
        return true;
    }
    if (line.includes('［＃') && (line.includes('始まり') || line.includes('目次'))) {
        return true;
    }
    if (line.trim().length > 0 && !line.startsWith('［＃') && i > 5) {
        return true;
    }
    return false;
}

function parseJisage(line) {
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

function parseAlignment(line) {
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

function parseHeading(line) {
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

function buildLineHTML(line, jisageClass, alignmentClass, isHeading, headingLevel, headingText, headingIndex) {
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

/**
 * @param {string} str
 * @return {string}
 */
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

/**
 * @typedef {{
 *   type: string,
 *   value: (string|undefined),
 *   rt: (string|undefined),
 *   children: (!Array<!Object>|undefined)
 * }}
 */
let ASTNode;

/**
 * @param {string} text
 * @return {!Array<!ASTNode>}
 */
// eslint-disable-next-line complexity
function tokenizeInline(text) {
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
                    tokens.push({ type: 'RUBY', value: kanji, rt: rt, children: undefined });
                    i = rtEndIdx + 1;
                    continue;
                }
            }
        }
        
        const kanjiMatch = text.substring(i).match(/^((?:[一-龠々仝〆〇ヶ]|※［＃二の字点、面区点番号1-2-22］)+|[A-Za-z]+)《([^》]+)》/);
        if (kanjiMatch) {
            tokens.push({ type: 'RUBY', value: kanjiMatch[1], rt: kanjiMatch[2], children: undefined });
            i += kanjiMatch[0].length;
            continue;
        }
        
        if (text.startsWith('［＃ここから太字］', i)) {
            tokens.push({ type: 'BOLD_START', value: undefined, rt: undefined, children: undefined });
            i += 9;
            continue;
        }
        if (text.startsWith('［＃ここで太字終わり］', i)) {
            tokens.push({ type: 'BOLD_END', value: undefined, rt: undefined, children: undefined });
            i += 11;
            continue;
        }
        if (text.startsWith('［＃ここから斜体］', i)) {
            tokens.push({ type: 'ITALIC_START', value: undefined, rt: undefined, children: undefined });
            i += 9;
            continue;
        }
        if (text.startsWith('［＃ここで斜体終わり］', i)) {
            tokens.push({ type: 'ITALIC_END', value: undefined, rt: undefined, children: undefined });
            i += 11;
            continue;
        }
        if (text.startsWith('［＃傍点］', i)) {
            tokens.push({ type: 'BOUTEN_START', value: undefined, rt: undefined, children: undefined });
            i += 5;
            continue;
        }
        if (text.startsWith('［＃傍点終わり］', i)) {
            tokens.push({ type: 'BOUTEN_END', value: undefined, rt: undefined, children: undefined });
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
            tokens.push({ type: 'TEXT', value: text[i], rt: undefined, children: undefined });
            i++;
        } else {
            tokens.push({ type: 'TEXT', value: text.substring(i, nextSpecial), rt: undefined, children: undefined });
            i = nextSpecial;
        }
    }
    
    return tokens;
}

/**
 * @param {!Array<!ASTNode>} tokens
 * @return {!ASTNode}
 */
// eslint-disable-next-line complexity
function parseTokensToAST(tokens) {
    const root = { type: 'Root', value: undefined, rt: undefined, children: [] };
    const stack = [root];
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const current = stack[stack.length - 1];
        
        if (token.type === 'TEXT') {
            current.children.push({ type: 'Text', value: token.value, rt: undefined, children: undefined });
        } else if (token.type === 'RUBY') {
            current.children.push({
                type: 'Ruby',
                value: token.value,
                rt: token.rt,
                children: undefined
            });
        } else if (token.type === 'BOLD_START') {
            const node = { type: 'Bold', value: undefined, rt: undefined, children: [] };
            current.children.push(node);
            stack.push(node);
        } else if (token.type === 'BOLD_END') {
            if (stack.length > 1 && stack[stack.length - 1].type === 'Bold') {
                stack.pop();
            }
        } else if (token.type === 'ITALIC_START') {
            const node = { type: 'Italic', value: undefined, rt: undefined, children: [] };
            current.children.push(node);
            stack.push(node);
        } else if (token.type === 'ITALIC_END') {
            if (stack.length > 1 && stack[stack.length - 1].type === 'Italic') {
                stack.pop();
            }
        } else if (token.type === 'BOUTEN_START') {
            const node = { type: 'Bouten', value: undefined, rt: undefined, children: [] };
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
 * @param {!ASTNode} node
 * @return {string}
 */
// eslint-disable-next-line complexity
function evaluateAST(node) {
    if (node.type === 'Root') {
        return (node.children || []).map(evaluateAST).join('');
    }
    if (node.type === 'Text') {
        return escapeHTML(node.value || '');
    }
    if (node.type === 'Ruby') {
        return `<ruby>${escapeHTML(node.value || '')}<rt>${escapeHTML(node.rt || '')}</rt></ruby>`;
    }
    if (node.type === 'Bold') {
        return `<strong class="aozora-bold">${(node.children || []).map(evaluateAST).join('')}</strong>`;
    }
    if (node.type === 'Italic') {
        return `<em class="aozora-italic">${(node.children || []).map(evaluateAST).join('')}</em>`;
    }
    if (node.type === 'Bouten') {
        return `<span class="em-sesame">${(node.children || []).map(evaluateAST).join('')}</span>`;
    }
    return '';
}

// eslint-disable-next-line complexity
function parseAozoraText(text) {
    Yuzora.locator.resolve(BookModel).toc = [];
    let headingIndex = 0;

    let lines = text.split(/\r?\n/);
    let parsedLines = [];
    let title = '';
    let author = '';
    let inHeader = true;
    
    if (lines.length > 2) {
        title = escapeHTML(lines[0].trim());
        author = escapeHTML(lines[1].trim());
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (inHeader) {
            if (detectHeaderEnd(line, i)) {
                inHeader = false;
                if (line.includes('-------------------------------------------------------') || 
                    (line.includes('［＃') && (line.includes('始まり') || line.includes('目次')))) {
                    continue;
                }
            } else {
                continue;
            }
        }

        if (line.includes('底本：') || line.includes('青空文庫作成ファイル：')) {
            break;
        }

        if (line.includes('［＃改ページ］')) {
            parsedLines.push('PAGE_BREAK');
            continue;
        }

        let { jisageClass, line: lineAfterJisage } = parseJisage(line);
        line = lineAfterJisage;

        let { alignmentClass, line: lineAfterAlignment } = parseAlignment(line);
        line = lineAfterAlignment;

        let { isHeading, headingLevel, headingText, line: lineAfterHeading } = parseHeading(line);
        line = lineAfterHeading;

        line = formatAozoraMarkup(line);

        const result = buildLineHTML(line, jisageClass, alignmentClass, isHeading, headingLevel, headingText, headingIndex);
        parsedLines.push(result.html);
        headingIndex = result.headingIndex;
    }

    while (parsedLines.length > 0 && parsedLines[parsedLines.length - 1] === '<p class="empty-line">&nbsp;</p>') {
        parsedLines.pop();
    }
    while (parsedLines.length > 0 && parsedLines[0] === '<p class="empty-line">&nbsp;</p>') {
        parsedLines.shift();
    }

    let bodyContent = parsedLines.join('\n');
    bodyContent = bodyContent.replace(/PAGE_BREAK/g, '<div class="page-break"></div>');

    return {
        title: title + (author ? ` (${author})` : ''),
        body: bodyContent
    };
}

/**
 * @param {string} line
 * @return {string}
 */
function formatAozoraMarkup(line) {
    const tokens = tokenizeInline(line);
    const ast = parseTokensToAST(tokens);
    return evaluateAST(ast);
}

function parseAozoraHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const titleEl = doc.querySelector('title');
    let title = titleEl ? titleEl.textContent : '';

    // Extract main body
    let mainBody = doc.querySelector('.main_body');
    if (!mainBody) {
        mainBody = doc.querySelector('body');
    }

    // Clean up metadata section if present in the HTML (usually near bottom or inside wrapper)
    const bibliographicalInfo = mainBody.querySelector('.bibliographical_information');
    if (bibliographicalInfo) bibliographicalInfo.remove();
    
    const cardLink = mainBody.querySelector('.card_link');
    if (cardLink) cardLink.remove();

    // Sanitize DOM to prevent XSS (T-E2)
    sanitizeDOM(mainBody);

    return {
        title: title,
        body: mainBody.innerHTML
    };
}

function sanitizeDOM(rootElement) {
    // Basic whitelist sanitization for client safety
    const allowedTags = new Set([
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'a', 'ruby', 'rt', 'rp', 'br', 'img', 'b', 'i', 'strong', 'em'
    ]);
    const allowedAttrs = new Set(['class', 'id', 'src', 'alt', 'href']);

    function cleanAttributes(element) {
        const attributes = Array.from(element.attributes);
        for (const attr of attributes) {
            const attrName = attr.name.toLowerCase();
            if (attrName.startsWith('on') || !allowedAttrs.has(attrName)) {
                element.removeAttribute(attr.name);
            } else if (attrName === 'href' || attrName === 'src') {
                const val = attr.value.trim().toLowerCase();
                if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
                    element.removeAttribute(attr.name);
                }
            }
        }
    }

    // Sanitize root element attributes
    cleanAttributes(rootElement);

    function sanitize(element) {
        const childNodes = Array.from(element.childNodes);
        for (const child of childNodes) {
            if (child.nodeType === 1) { // Node.ELEMENT_NODE
                const tagName = child.tagName.toLowerCase();
                if (!allowedTags.has(tagName)) {
                    // Strip unsafe elements completely
                    if (["script", "style", "iframe"].includes(tagName)) {
                        child.remove();
                    } else {
                        // Unwrap other tags (pull child nodes up)
                        while (child.firstChild) {
                            child.parentNode.insertBefore(child.firstChild, child);
                        }
                        child.remove();
                    }
                } else {
                    cleanAttributes(child);
                    // Recursive sanitize
                    sanitize(child);
                }
            }
        }
    }

    sanitize(rootElement);
}
