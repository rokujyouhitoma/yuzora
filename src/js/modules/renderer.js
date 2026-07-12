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

        /**
         * @type {!Object}
         */
        this.lastRepairMetrics = {
            passesCount: 0,
            insertedCount: 0,
            durationMs: 0
        };
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
                
                // Adjust page breaks for overrun on the recalculated layout
                this.adjustPageBreaksForOverrun();

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

    /**
     * @override
     */
    // @ts-expect-error
    adjustPageBreaksForOverrun() {
        if (!this.viewContext.readerContent || !this.viewContext.readerViewport) return;

        const readerContent = this.viewContext.readerContent;
        const readerViewport = this.viewContext.readerViewport;

        // 1. Remove all existing dynamic page break elements to start fresh
        const existingBreaks = readerContent.querySelectorAll('.dynamic-page-break');
        existingBreaks.forEach(el => el.remove());

        const startTime = performance.now();
        let passesCount = 0;

        const maxIterations = 30;
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            passesCount++;
            if (!runOverrunCheckPass(readerContent, readerViewport)) {
                break; // Convergence! No page breaks were inserted.
            }
        }

        const endTime = performance.now();
        const insertedCount = readerContent.querySelectorAll('.dynamic-page-break').length;
        const durationMs = endTime - startTime;

        this.lastRepairMetrics = {
            passesCount: passesCount,
            insertedCount: insertedCount,
            durationMs: parseFloat(durationMs.toFixed(1))
        };

        const publisher = Yuzora.locator.resolve(Publisher);
        if (publisher) {
            publisher.publish(YuzoraEventType.LAYOUT_REPAIRED, this.lastRepairMetrics);
        }
    }

    /**
     * Performs a lightweight, read-only check to detect whether any child element
     * straddles a page boundary adjacent to the current scroll position.
     * Does NOT modify the DOM. Returns true only when a character-level overrun
     * is confirmed, avoiding false positives from bounding-box overlaps alone.
     * @override
     * @return {boolean}
     */
    // @ts-expect-error
    hasOverrunNearCurrentPage() {
        if (!this.viewContext.readerContent || !this.viewContext.readerViewport) return false;

        const readerContent = this.viewContext.readerContent;
        const readerViewport = this.viewContext.readerViewport;
        const clientWidth = readerViewport.clientWidth;
        const scrollWidth = readerViewport.scrollWidth;
        const pageCount = Math.round(scrollWidth / clientWidth) || 0;
        if (pageCount <= 1) return false;

        const absScroll = Math.abs(readerViewport.scrollLeft);
        const currentPage = Math.round(absScroll / clientWidth) + 1;

        // Check the two page boundaries that flank the current page.
        // boundary at (currentPage-1)*clientWidth is the left edge of the current page;
        // boundary at currentPage*clientWidth is the right edge (= left edge of next page).
        const boundariesToCheck = [];
        if (currentPage > 1) {
            boundariesToCheck.push((currentPage - 1) * clientWidth);
        }
        if (currentPage < pageCount) {
            boundariesToCheck.push(currentPage * clientWidth);
        }
        if (boundariesToCheck.length === 0) return false;

        const children = Array.from(readerContent.children).filter(node => {
            const el = /** @type {!Element} */ (node);
            return !el.classList.contains('empty-line') && !el.classList.contains('page-break');
        });

        for (const boundaryX of boundariesToCheck) {
            for (const child of children) {
                const rect = child.getBoundingClientRect();
                const docLeft = rect.left + absScroll;
                const docRight = rect.right + absScroll;
                // Bounding-box straddles the boundary: confirm at character level.
                if (docLeft < boundaryX && docRight > boundaryX) {
                    if (findCharAtDocumentBoundary(child, boundaryX, readerViewport.scrollLeft)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

/**
 * Runs a single pass of the overrun check and repairs the first detected overrun.
 * @param {!Element} readerContent
 * @param {!Element} readerViewport
 * @return {boolean} True if a page break was inserted in this pass.
 */
function runOverrunCheckPass(readerContent, readerViewport) {
    const clientWidth = readerViewport.clientWidth;
    const scrollWidth = readerViewport.scrollWidth;
    const pageCount = Math.round(scrollWidth / clientWidth) || 0;
    if (pageCount <= 1) {
        return false;
    }

    const childNodes = Array.from(readerContent.children).filter(node => {
        const style = window.getComputedStyle(node);
        return style.display !== 'none';
    });

    for (let k = 1; k < pageCount; k++) {
        const boundaryX = k * clientWidth;

        for (let i = 0; i < childNodes.length; i++) {
            if (checkAndRepairParagraphOverrun(childNodes[i], boundaryX, readerViewport)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Helper to check a single paragraph for boundary overrun and repair it by inserting a page break.
 * @param {!Element} child
 * @param {number} boundaryX
 * @param {!Element} readerViewport
 * @return {boolean} True if a page break was inserted.
 */
function checkAndRepairParagraphOverrun(child, boundaryX, readerViewport) {
    if (child.classList.contains('empty-line') || child.classList.contains('page-break')) {
        return false;
    }

    const rect = child.getBoundingClientRect();
    const absScroll = Math.abs(readerViewport.scrollLeft);
    const docLeft = rect.left + absScroll;
    const docRight = rect.right + absScroll;

    // Check if paragraph bounding box spans the boundary
    if (docLeft < boundaryX && docRight > boundaryX) {
        // Check if the paragraph is already preceded by a page break to avoid infinite loop
        const prev = child.previousElementSibling;
        if (prev && prev.classList.contains('page-break')) {
            return false;
        }

        // Check if there is a character crossing the boundary
        const charInfo = findCharAtDocumentBoundary(child, boundaryX, readerViewport.scrollLeft);
        if (charInfo) {
            // Insert page break before this paragraph
            const pageBreak = document.createElement('div');
            pageBreak.className = 'page-break dynamic-page-break';
            child.parentNode.insertBefore(pageBreak, child);
            return true;
        }
    }

    return false;
}

/**
 * Pure helper function to walk text nodes of an element and find if any character slices
 * a document-relative boundary coordinate.
 * @param {!Element} element
 * @param {number} boundaryX
 * @param {number} currentScrollLeft
 * @return {?Object}
 */
function findCharAtDocumentBoundary(element, boundaryX, currentScrollLeft) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }

    const absScroll = Math.abs(currentScrollLeft);

    for (const node of textNodes) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
            const range = document.createRange();
            try {
                range.setStart(node, i);
                range.setEnd(node, i + 1);
            } catch (e) {
                continue;
            }
            const rect = range.getBoundingClientRect();
            const docLeft = rect.left + absScroll;
            const docRight = rect.right + absScroll;
            
            if (docLeft < boundaryX - 0.5 && docRight > boundaryX + 0.5) {
                const before = text.substring(Math.max(0, i - 10), i);
                const after = text.substring(i + 1, Math.min(text.length, i + 11));
                return {
                    char: text[i],
                    rect: rect,
                    context: { before, after }
                };
            }
        }
    }

    return null;
}
