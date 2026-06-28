/**
 * Yuzora - Aozora Bunko Text/HTML Parser & Sanitizer Module
 */

function detectHeaderEnd(line, i) {
    if (i < 50 && (line.includes("-------------------------------------------------------") || line.includes("＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝"))) {
        return true;
    }
    return false;
}

function parseJisage(line) {
    const jisageMatch = line.match(/^［＃（(.+?)）下げ］/);
    if (jisageMatch) {
        const numMap = { "一": "jisage-1", "二": "jisage-2", "三": "jisage-3", "四": "jisage-4", "五": "jisage-5" };
        const key = jisageMatch[1].charAt(0);
        return numMap[key] || "jisage-1";
    }
    return null;
}

function parseHeading(line) {
    const headingMatch = line.match(/^［＃(.+?)］/);
    if (headingMatch && headingMatch[1].includes("見出し")) {
        let headingLevel = "heading-3";
        if (headingMatch[1].includes("大見出し")) {
            headingLevel = "heading-1";
        } else if (headingMatch[1].includes("中見出し")) {
            headingLevel = "heading-2";
        }
        
        // Return structured heading text (strip markdown wrapper if possible)
        const nextLineText = line.replace(/^［＃.+?］/, "").trim();
        return {
            isHeading: true,
            headingLevel,
            headingText: nextLineText
        };
    }
    return { isHeading: false };
}

function buildLineHTML(line, jisageClass, isHeading, headingLevel, headingText, headingIndex) {
    // Strip layout tags from raw lines
    let text = line.replace(/^［＃.+?］/, "").trim();
    if (!text) return '<p class="blank-line"><br></p>';

    text = formatAozoraMarkup(text);

    if (isHeading) {
        const idAttr = `heading-ref-${headingIndex}`;
        return `<h3 id="${idAttr}" class="${headingLevel} ${jisageClass || ""}" >${text}</h3>`;
    } else {
        return `<p class="${jisageClass || ""}">${text}</p>`;
    }
}

function parseAozoraText(text) {
    const lines = text.split(/\r?\n/);
    let html = "";
    let inHeader = true;
    let headerLinesCount = 0;
    
    currentTOC = [];
    let headingIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // 1. Skip front-matter headers (Metadata before delimiter)
        if (inHeader) {
            headerLinesCount++;
            if (detectHeaderEnd(line, i)) {
                inHeader = false;
            }
            continue;
        }

        // 2. Parse special markers and layouts
        let jisageClass = parseJisage(line);
        let { isHeading, headingLevel, headingText } = parseHeading(line);

        if (isHeading) {
            const headingId = `heading-ref-${headingIndex}`;
            currentTOC.push({
                id: headingId,
                text: headingText || line.replace(/^［＃.+?］/, "").trim(),
                level: headingLevel === "heading-1" ? 1 : (headingLevel === "heading-2" ? 2 : 3)
            });
            html += buildLineHTML(line, jisageClass, true, headingLevel, headingText, headingIndex);
            headingIndex++;
        } else {
            html += buildLineHTML(line, jisageClass, false);
        }
    }

    return html;
}

function formatAozoraMarkup(line) {
    // 1. Ruby tags: ｜漢字《かんじ》 -> <ruby>漢字<rt>かんじ</rt></ruby>
    // or plain 漢字《かんじ》
    let formatted = line.replace(/｜([^《\r\n]+?)《([^》\r\n]+?)》/g, '<ruby>$1<rt>$2</rt></ruby>');
    formatted = formatted.replace(/([\p{Unified_Ideograph}\u3005-\u3007]+?)《([^》\r\n]+?)》/gu, '<ruby>$1<rt>$2</rt></ruby>');

    // 2. Emphasis dots: ［＃傍点］漢［＃傍点終わり］ -> <span class="em-sesame">漢</span>
    formatted = formatted.replace(/［＃傍点］(.+?)［＃傍点終わり］/g, '<span class="em-sesame">$1</span>');

    // 3. Keep other tags stripped or safe
    formatted = formatted.replace(/［＃.+?］/g, "");

    return formatted;
}

function sanitizeDOM(rootElement) {
    // Basic whitelist sanitization for client safety
    const allowedTags = ["P", "RUBY", "RT", "SPAN", "H1", "H2", "H3", "BR"];
    const allowedAttrs = ["id", "class"];

    function cleanAttributes(element) {
        const attribs = [...element.attributes];
        attribs.forEach(attr => {
            if (!allowedAttrs.includes(attr.name)) {
                element.removeAttribute(attr.name);
            }
        });
    }

    function sanitize(element) {
        const children = [...element.childNodes];
        children.forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!allowedTags.includes(child.tagName)) {
                    // Replace element with its text content if not whitelisted
                    const textNode = document.createTextNode(child.textContent);
                    element.replaceChild(textNode, child);
                } else {
                    cleanAttributes(child);
                    sanitize(child);
                }
            } else if (child.nodeType === Node.TEXT_NODE) {
                // Escape text content slightly to prevent HTML tags insertion (except inside whitelisted nodes)
            } else {
                // Remove comment nodes or other structures
                element.removeChild(child);
            }
        });
    }

    sanitize(rootElement);
}

function parseAozoraHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract main text node or use body
    const mainBody = doc.querySelector(".main_html") || doc.body;

    // Find and register Headings for TOC Drawer before sanitization strip
    currentTOC = [];
    const headings = mainBody.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading, index) => {
        const headingId = `heading-html-ref-${index}`;
        heading.setAttribute("id", headingId);
        
        let level = 3;
        if (heading.tagName === "H1") level = 1;
        else if (heading.tagName === "H2") level = 2;

        currentTOC.push({
            id: headingId,
            text: heading.textContent.trim(),
            level: level
        });
    });

    // Strip scripts and risky attributes
    sanitizeDOM(mainBody);

    return mainBody.innerHTML;
}
