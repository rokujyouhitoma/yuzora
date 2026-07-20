/**
 * Aozora Bunko Evaluator
 */
"use strict";

/**
 * @implements {AozoraEvaluatorInterface}
 */
class AozoraEvaluator {
    constructor() {}

    /**
     * @param {!ASTNodeInterface} astRoot
     * @return {string}
     * @override
     */
    // @ts-expect-error
    evaluate(astRoot) {
        return this.evaluateNode(astRoot);
    }

    /**
     * @private
     * @param {!ASTNodeInterface} node
     * @return {string}
     */
    // eslint-disable-next-line complexity
    evaluateNode(node) {
        if (node.type === 'Document') {
            return (node.children || []).map(child => this.evaluateNode(child)).join('\n');
        }
        if (node.type === 'CoverPage') {
            const escapedTitle = this.escapeHTML(node.title || '');
            const escapedAuthor = this.escapeHTML(node.author || '');
            return `<div class="book-cover-page">\n    <h1 class="book-cover-title">${escapedTitle}</h1>\n    <p class="book-cover-author">${escapedAuthor}</p>\n</div>`;
        }
        if (node.type === 'PageBreak') {
            return '<div class="page-break"></div>';
        }
        if (node.type === 'EmptyLine') {
            return '<p class="empty-line">&nbsp;</p>';
        }
        if (node.type === 'Heading') {
            const level = node.level || 2;
            const headingId = node.headingId || '';
            let classes = [];
            if (node.jisageClass) classes.push(node.jisageClass);
            if (node.alignmentClass) classes.push(node.alignmentClass);
            const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
            const evaluatedChildren = (node.children || []).map(child => this.evaluateNode(child)).join('');
            return `<h${level} id="${headingId}"${classAttr}>${evaluatedChildren}</h${level}>`;
        }
        if (node.type === 'Paragraph') {
            let classes = [];
            if (node.jisageClass) classes.push(node.jisageClass);
            if (node.alignmentClass) classes.push(node.alignmentClass);
            const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
            const evaluatedChildren = (node.children || []).map(child => this.evaluateNode(child)).join('');
            return `<p${classAttr}>${evaluatedChildren}</p>`;
        }
        if (node.type === 'Root') {
            return (node.children || []).map(child => this.evaluateNode(child)).join('');
        }
        if (node.type === 'Text') {
            return this.escapeHTML(node.value || '');
        }
        if (node.type === 'Ruby') {
            return `<ruby>${this.escapeHTML(node.value || '')}<rt>${this.escapeHTML(node.rt || '')}</rt></ruby>`;
        }
        if (node.type === 'Bold') {
            return `<strong class="aozora-bold">${(node.children || []).map(child => this.evaluateNode(child)).join('')}</strong>`;
        }
        if (node.type === 'Italic') {
            return `<em class="aozora-italic">${(node.children || []).map(child => this.evaluateNode(child)).join('')}</em>`;
        }
        if (node.type === 'Bouten') {
            return `<span class="em-sesame">${(node.children || []).map(child => this.evaluateNode(child)).join('')}</span>`;
        }
        return '';
    }

    /**
     * @param {string} str
     * @return {string}
     * @override
     */
    // @ts-expect-error
    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#x27;');
    }

    /**
     * @param {!Element} rootElement
     * @override
     */
    // @ts-expect-error
    sanitizeDOM(rootElement) {
        // Basic whitelist sanitization for client safety
        const allowedTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'a', 'ruby', 'rt', 'rp', 'br', 'img', 'b', 'i', 'strong', 'em'
        ]);
        const allowedAttrs = new Set(['class', 'id', 'src', 'alt', 'href']);

        /**
         * @param {!Element} element
         */
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

        /**
         * @param {!Element} element
         */
        function sanitize(element) {
            const childNodes = Array.from(element.childNodes);
            for (const child of childNodes) {
                if (child.nodeType === 1) { // Node.ELEMENT_NODE
                    const elem = /** @type {!Element} */ (child);
                    const tagName = elem.tagName.toLowerCase();
                    if (!allowedTags.has(tagName)) {
                        // Strip unsafe elements completely
                        if (["script", "style", "iframe"].includes(tagName)) {
                            elem.remove();
                        } else {
                            // Unwrap other tags (pull child nodes up)
                            while (elem.firstChild) {
                                elem.parentNode.insertBefore(elem.firstChild, elem);
                            }
                            elem.remove();
                        }
                    } else {
                        cleanAttributes(elem);
                        // Recursive sanitize
                        sanitize(elem);
                    }
                }
            }
        }

        sanitize(rootElement);
    }
}

window['AozoraEvaluator'] = AozoraEvaluator;
