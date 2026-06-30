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

function buildLineHTML(line, jisageClass, isHeading, headingLevel, headingText, headingIndex) {
    if (line.trim().length === 0) {
        return { html: '<p class="empty-line">&nbsp;</p>', headingIndex };
    }
    if (isHeading) {
        const headingId = `toc-heading-${headingIndex}`;
        const cleanText = headingText
            .replace(/[｜|]/g, '')
            .replace(/《[^》]+》/g, '')
            .trim();
        window.locator.resolve(BookModel).toc.push({ id: headingId, text: cleanText, level: headingLevel });
        return {
            html: `<h${headingLevel} id="${headingId}"${jisageClass ? ` class="${jisageClass}"` : ''}>${line}</h${headingLevel}>`,
            headingIndex: headingIndex + 1
        };
    }
    if (line.startsWith('<h2>') || line.startsWith('<h3>')) {
        return { html: line, headingIndex };
    }
    return { html: `<p${jisageClass ? ` class="${jisageClass}"` : ''}>${line}</p>`, headingIndex };
}

// eslint-disable-next-line complexity
function parseAozoraText(text) {
    // XSS対策 (T-E1): 文字列処理の最優先ステップとして特殊文字を一括エスケープ
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    window.locator.resolve(BookModel).toc = [];
    let headingIndex = 0;

    let lines = text.split(/\r?\n/);
    let parsedLines = [];
    let title = '';
    let author = '';
    let inHeader = true;
    
    if (lines.length > 2) {
        title = lines[0].trim();
        author = lines[1].trim();
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

        let { isHeading, headingLevel, headingText, line: lineAfterHeading } = parseHeading(line);
        line = lineAfterHeading;

        line = formatAozoraMarkup(line);

        const result = buildLineHTML(line, jisageClass, isHeading, headingLevel, headingText, headingIndex);
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

function formatAozoraMarkup(line) {
    // 1. Ruby with explicit delimiter: ｜漢字《かんじ》 or |漢字《かんじ》
    // Match both full-width ｜ and half-width |
    line = line.replace(/[｜|]([^《\r\n]+)《([^》]+)》/g, '<ruby>$1<rt>$2</rt></ruby>');

    // 2. Ruby without explicit delimiter: 漢字《かんじ》
    // Match Chinese characters (Kanji, including iteration marks like 々)
    line = line.replace(/([一-龠々〆ヶ]+)《([^》]+)》/g, '<ruby>$1<rt>$2</rt></ruby>');

    // 3. Emphasis dots: ［＃傍点］漢［＃傍点終わり］ -> <span class="em-sesame">漢</span>
    line = line.replace(/［＃傍点］(.+?)［＃傍点終わり］/g, '<span class="em-sesame">$1</span>');

    // 4. Keep other tags stripped or safe
    line = line.replace(/［＃.+?］/g, "");

    return line;
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
