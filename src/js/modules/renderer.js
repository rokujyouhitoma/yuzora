/**
 * Yuzora - Renderer Module
 */
"use strict";

/**
 * Concrete implementation of the rendering and layout calculation logic for vertical writing mode.
 * @implements {RendererInterface}
 */
class VerticalRenderer {
    constructor() {
        /**
         * @private
         * @type {!ViewContextInterface}
         */
        this.viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));

        /**
         * @private
         * @type {!ConfigModelInterface}
         */
        this.configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    }

    /**
     * Renders parsed HTML content to the viewport container with secure sanitization.
     * @override
     * @param {string} htmlContent
     */
    // @ts-expect-error
    render(htmlContent) {
        if (!this.viewContext.readerContent) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        if (!body) return;

        // Force white-list based DOM sanitization (Defense in Depth)
        this.sanitizeDOM(body);

        // Safe DOM Node migration (prevents browser re-parsing innerHTML)
        this.viewContext.readerContent.innerHTML = '';
        while (body.firstChild) {
            this.viewContext.readerContent.appendChild(body.firstChild);
        }
    }

    /**
     * Sanitize a DOM tree against XSS attacks using an allowed tags/attrs whitelist.
     * @private
     * @param {!Element} rootElement
     */
    sanitizeDOM(rootElement) {
        const allowedTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'a', 'ruby', 'rt', 'rp', 'br', 'img', 'b', 'i', 'strong', 'em'
        ]);
        const allowedAttrs = new Set(['class', 'id', 'src', 'alt', 'href']);

        /**
         * @param {!Element} element
         */
        const cleanAttributes = (element) => {
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
        };

        // Sanitize root element attributes
        cleanAttributes(rootElement);

        /**
         * @param {!Element} element
         */
        const sanitize = (element) => {
            const childNodes = Array.from(element.childNodes);
            for (const child of childNodes) {
                if (child.nodeType === 1) { // Node.ELEMENT_NODE
                    const childElement = /** @type {!Element} */ (child);
                    const tagName = childElement.tagName.toLowerCase();
                    if (!allowedTags.has(tagName)) {
                        // Strip unsafe elements completely
                        if (["script", "style", "iframe"].includes(tagName)) {
                            childElement.remove();
                        } else {
                            // Unwrap other tags (pull child nodes up)
                            while (childElement.firstChild) {
                                childElement.parentNode.insertBefore(childElement.firstChild, childElement);
                            }
                            childElement.remove();
                        }
                    } else {
                        cleanAttributes(childElement);
                        // Recursive sanitize
                        sanitize(childElement);
                    }
                }
            }
        };

        sanitize(rootElement);
    }

    /**
     * Restores the scroll position coordinates based on reading progress percent.
     * @override
     * @param {number} progress
     * @param {boolean=} smooth
     */
    // @ts-expect-error
    restoreScrollPosition(progress, smooth = false) {
        if (!this.viewContext.readerViewport) return;
        const maxScroll = this.viewContext.readerViewport.scrollWidth - this.viewContext.readerViewport.clientWidth;
        const targetScroll = this.configModel.direction === 'rtl' ? -(progress * maxScroll) : (progress * maxScroll);
        
        if (smooth) {
            this.viewContext.readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
        } else {
            this.viewContext.readerViewport.scrollLeft = targetScroll;
        }
    }

    /**
     * Smooth scrolls to a specific page number.
     * @override
     * @param {number} pageNumber
     * @return {!Promise<void>}
     */
    // @ts-expect-error
    scrollToPage(pageNumber) {
        if (!this.viewContext.readerViewport) return Promise.resolve();
        const clientWidth = this.viewContext.readerViewport.clientWidth;
        const targetScrollLeft = (pageNumber - 1) * clientWidth;
        
        this.viewContext.readerViewport.scrollTo({
            left: this.configModel.direction === 'rtl' ? -targetScrollLeft : targetScrollLeft,
            behavior: 'smooth'
        });

        return new Promise((resolve) => {
            setTimeout(resolve, 400); // Wait for transition animation to complete
        });
    }

    /**
     * Readjusts width properties and scroll left coordinates during resizing.
     * @override
     * @param {number} progress
     * @return {!Promise<void>}
     */
    // @ts-expect-error
    handleResize(progress) {
        if (!this.viewContext.readerContent || !this.viewContext.readerViewport) return Promise.resolve();

        // Temporarily reset columns layout width before recalculations to get accurate sizing
        this.viewContext.readerContent.style.width = 'auto';
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Enforce column content size width constraints
                this.viewContext.readerContent.style.width = 'max-content';
                
                // Restore progress coordinates on new dimensions
                const maxScroll = Math.abs(this.viewContext.readerViewport.scrollWidth - this.viewContext.readerViewport.clientWidth);
                if (this.configModel.direction === 'rtl') {
                    this.viewContext.readerViewport.scrollLeft = -(progress * maxScroll);
                } else {
                    this.viewContext.readerViewport.scrollLeft = progress * maxScroll;
                }
                resolve();
            }, 100);
        });
    }
}
