/**
 * Yuzora - Renderer Module
 */
"use strict";

/**
 * Concrete implementation of the rendering and layout calculation logic for vertical writing mode.
 * @implements {RendererInterface}
 * @property {boolean} isRepairing
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

        /** @type {boolean} */
        this.isRepairing = false;

        /** @type {number} */
        this.currentRepairId = 0;

        /** @type {!Array<!Object>} */
        this.paragraphBoundsCache = [];

        const publisher = /** @type {!PublisherInterface} */ (Yuzora.locator.resolve(Publisher));
        if (publisher) {
            publisher.subscribe(YuzoraEventType.LAYOUT_REPAIR_REQUESTED, () => {
                this.adjustPageBreaksForOverrun();
            });
        }
    }

    /**
     * Renders parsed HTML content to the viewport container with secure sanitization.
     * @override
     * @param {string} htmlContent
     */
    // @ts-expect-error
    render(htmlContent) {
        if (!this.viewContext.readerContent) return;

        this.paragraphBoundsCache = [];

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

        this.paragraphBoundsCache = [];

        // Temporarily reset columns layout width before recalculations to get accurate sizing
        this.viewContext.readerContent.style.width = 'auto';
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Enforce column content size width constraints
                this.viewContext.readerContent.style.width = 'max-content';
                
                // Trigger event-driven layout check instead of direct repair
                const publisher = /** @type {!PublisherInterface} */ (Yuzora.locator.resolve(Publisher));
                if (publisher) {
                    publisher.publish(YuzoraEventType.LAYOUT_CHECK_REQUESTED, { scope: 'all' });
                }

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
     * @return {!Promise<void>}
     */
    // @ts-expect-error
    // eslint-disable-next-line complexity
    async adjustPageBreaksForOverrun() {
        if (!this.viewContext.readerContent || !this.viewContext.readerViewport) return;

        // 新しい修復IDを発行（進行中の修復処理を Abort させる）
        const repairId = ++this.currentRepairId;
        this.isRepairing = true;

        try {
            const readerContent = this.viewContext.readerContent;
            const readerViewport = this.viewContext.readerViewport;

            // 1. Remove all existing dynamic page break elements to start fresh
            const existingBreaks = readerContent.querySelectorAll('.dynamic-page-break');
            existingBreaks.forEach(el => el.remove());

            const startTime = performance.now();

            const childNodes = Array.from(readerContent.children).filter(node => {
                const style = window.getComputedStyle(node);
                return style.display !== 'none';
            });

            let i = 0;
            let batchCounter = 0;
            while (i < childNodes.length) {
                // 中断チェック：新しい修復が割り込んだ場合は即座に実行を終了する
                if (this.currentRepairId !== repairId) {
                    return;
                }

                const child = childNodes[i];
                const repaired = checkAndRepairParagraph(child, readerViewport);
                if (repaired) {
                    this.applyPageBreakSizes();
                }
                i++;
                batchCounter++;
                if (batchCounter >= 600) {
                    batchCounter = 0;
                    // メインスレッドを解放してブロッキングを回避（タイムスライス）
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // 中断チェック
            if (this.currentRepairId !== repairId) {
                return;
            }

            const endTime = performance.now();
            const insertedCount = readerContent.querySelectorAll('.dynamic-page-break').length;
            const durationMs = endTime - startTime;

            this.lastRepairMetrics = {
                passesCount: 1,
                insertedCount: insertedCount,
                durationMs: parseFloat(durationMs.toFixed(1))
            };

            // Clear cached layout dimensions as DOM modifications will affect them
            this.viewContext.cachedScrollWidth = null;
            this.viewContext.cachedClientWidth = null;

            if (window['__DEBUG_PERFORMANCE__']) {
                console.log(`[Layout Repair] adjustPageBreaksForOverrun completed in ${durationMs.toFixed(1)}ms. passesCount: 1, insertedCount: ${insertedCount}`);
            }

            this.cacheParagraphBounds();

            try {
                const bookmarkModel = /** @type {?BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
                if (bookmarkModel) {
                    this.restoreScrollPosition(bookmarkModel.bookmarkProgress, false);
                }
            } catch (e) {
                // Ignore in tests where BookmarkModel is not registered
            }

            const publisher = Yuzora.locator.resolve(Publisher);
            if (publisher) {
                publisher.publish(YuzoraEventType.LAYOUT_REPAIRED, this.lastRepairMetrics);
            }
        } finally {
            this.isRepairing = false;
        }
    }

    /**
     * Calculates and sets the correct width for all .page-break elements 
     * to fill the remaining width of their respective columns.
     * @private
     * @return {void}
     */
    applyPageBreakSizes() {
        const params = resolveLayoutParameters(
            this.viewContext.readerContent,
            this.viewContext.readerViewport
        );
        if (!params) return;

        const children = Array.from(params.parent.children);
        
        // Reset all page break sizes to avoid layout distortion on subsequent measurements (e.g. resize)
        for (let i = 0; i < children.length; i++) {
            const child = /** @type {!HTMLElement} */ (children[i]);
            if (child.classList.contains('page-break')) {
                child.style.width = '';
                child.style.height = '';
                child.style.removeProperty('margin-block-end');
            }
        }
        
        for (let i = 0; i < children.length; i++) {
            const child = /** @type {!HTMLElement} */ (children[i]);
            if (!child.classList.contains('page-break')) {
                continue;
            }

            const prevElement = findPredecessorElement(children, i);
            let remainingWidth = params.columnWidth;
            if (prevElement) {
                const isRtl = this.configModel.direction === 'rtl';
                const rect = prevElement.getBoundingClientRect();
                const parentRect = params.parent.getBoundingClientRect();
                // 5pxの安全バッファを引くことで、端数誤差によるカラムインデックスの誤判定（白紙ページ発生）を防ぐ
                const buffer = 5;
                const relativeLeft = isRtl 
                    ? (parentRect.right - rect.left - buffer)
                    : (rect.right - parentRect.left - buffer);

                // Math.round clientWidth / step gives N (columns per page)
                const clientWidth = this.viewContext.readerViewport.clientWidth;
                const N = Math.max(1, Math.round(clientWidth / params.step));

                const columnIndex = Math.floor(relativeLeft / params.step);
                const nextPageColumnIndex = (Math.floor(columnIndex / N) + 1) * N;

                remainingWidth = nextPageColumnIndex * params.step - relativeLeft - params.columnGap;
            }

            if (remainingWidth <= 0) {
                remainingWidth = params.columnWidth;
            }

            child.style.width = `${remainingWidth}px`;
            child.style.height = '100%';
            child.style.setProperty('margin-block-end', `${params.columnGap}px`);
        }
    }



    /**
     * Computes the document-relative absolute coordinates of all relevant paragraph child nodes
     * and stores them in the paragraphBoundsCache memory cache.
     * @override
     * @return {void}
     */
    // @ts-expect-error
    cacheParagraphBounds() {
        this.applyPageBreakSizes();
        this.paragraphBoundsCache = [];
        const parent = this.viewContext.readerContent;
        const viewport = this.viewContext.readerViewport;
        if (!parent || !viewport) return;

        const rawChildren = Array.from(parent.children);
        const absScroll = Math.abs(viewport.scrollLeft);

        for (const child of rawChildren) {
            if (child.classList.contains('empty-line') || child.classList.contains('page-break')) {
                continue;
            }
            const rect = child.getBoundingClientRect();
            const docLeft = rect.left + absScroll;
            const docRight = rect.right + absScroll;
            this.paragraphBoundsCache.push({
                element: child,
                docLeft: docLeft,
                docRight: docRight
            });
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

        const startTime = performance.now();

        const readerViewport = this.viewContext.readerViewport;
        const clientWidth = readerViewport.clientWidth;
        if (!clientWidth || clientWidth <= 0) return false;
        const scrollWidth = readerViewport.scrollWidth;
        const pageCount = Math.round(scrollWidth / clientWidth) || 0;
        if (pageCount <= 1) return false;

        const absScroll = Math.abs(readerViewport.scrollLeft);
        const currentPage = Math.round(absScroll / clientWidth) + 1;
        const boundaries = this.getBoundariesToCheck(currentPage, pageCount, clientWidth);
        if (boundaries.length === 0) return false;

        const children = Array.from(this.viewContext.readerContent.children).filter(node => {
            const el = /** @type {!Element} */ (node);
            if (el.classList.contains('empty-line')) {
                return false;
            }
            const style = window.getComputedStyle(el);
            return style.display !== 'none';
        });

        const hasOverrun = this.checkBoundariesForChildren(boundaries, children, absScroll, readerViewport.scrollLeft);
        const durationMs = performance.now() - startTime;

        if (window['__DEBUG_PERFORMANCE__']) {
            console.log(`[Layout Check] hasOverrunNearCurrentPage completed in ${durationMs.toFixed(1)}ms. Result: ${hasOverrun}`);
        }

        return hasOverrun;
    }

    /**
     * @private
     * @param {number} currentPage
     * @param {number} pageCount
     * @param {number} clientWidth
     * @return {!Array<number>}
     */
    getBoundariesToCheck(currentPage, pageCount, clientWidth) {
        const boundaries = [];
        if (currentPage > 1) {
            boundaries.push((currentPage - 1) * clientWidth);
        }
        if (currentPage < pageCount) {
            boundaries.push(currentPage * clientWidth);
        }
        return boundaries;
    }

    /**
     * @private
     * @param {!Array<number>} boundaries
     * @param {!Array<!Element>} children
     * @param {number} absScroll
     * @param {number} scrollLeft
     * @return {boolean}
     */
    checkBoundariesForChildren(boundaries, children, absScroll, scrollLeft) {
        const parent = this.viewContext.readerContent;
        if (!parent) return false;

        const rawChildren = Array.from(parent.children);

        for (const boundaryX of boundaries) {
            if (boundaryX <= 0) {
                continue;
            }
            if (this.checkSingleBoundary(boundaryX, rawChildren, absScroll, scrollLeft)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @private
     * @param {number} boundaryX
     * @param {!Array<!Element>} rawChildren
     * @param {number} absScroll
     * @param {number} scrollLeft
     * @return {boolean}
     */
    checkSingleBoundary(boundaryX, rawChildren, absScroll, scrollLeft) {
        if (!this.paragraphBoundsCache || this.paragraphBoundsCache.length === 0) {
            this.cacheParagraphBounds();
        }

        let hasPageBreakSinceLastParagraph = true;
        let cacheIndex = 0;

        for (const child of rawChildren) {
            if (child.classList.contains('page-break')) {
                hasPageBreakSinceLastParagraph = true;
                continue;
            }
            if (child.classList.contains('empty-line')) {
                continue;
            }

            // Normal paragraph element
            const isPreceded = hasPageBreakSinceLastParagraph;
            hasPageBreakSinceLastParagraph = false;

            if (isPreceded) {
                cacheIndex++;
                continue;
            }

            const res = this.checkParagraphOverlap(child, boundaryX, absScroll, scrollLeft, cacheIndex);
            cacheIndex = res.nextIndex;
            if (res.overrun) {
                return true;
            }
        }
        return false;
    }

    /**
     * @private
     * @param {!Element} child
     * @param {number} boundaryX
     * @param {number} absScroll
     * @param {number} scrollLeft
     * @param {number} cacheIndex
     * @return {{overrun: boolean, nextIndex: number}}
     */
    checkParagraphOverlap(child, boundaryX, absScroll, scrollLeft, cacheIndex) {
        const cache = /** @type {{element: !Element, docLeft: number, docRight: number}|undefined} */ (this.paragraphBoundsCache[cacheIndex]);
        const nextIndex = cacheIndex + 1;

        if (cache && cache.element === child) {
            const docLeft = cache.docLeft;
            const docRight = cache.docRight;

            if (docLeft < boundaryX && docRight > boundaryX) {
                if (findCharAtDocumentBoundary(child, boundaryX, scrollLeft)) {
                    return { overrun: true, nextIndex };
                }
            }
        } else {
            const rect = child.getBoundingClientRect();
            const docLeft = rect.left + absScroll;
            const docRight = rect.right + absScroll;
            if (docLeft < boundaryX && docRight > boundaryX) {
                if (findCharAtDocumentBoundary(child, boundaryX, scrollLeft)) {
                    return { overrun: true, nextIndex };
                }
            }
        }
        return { overrun: false, nextIndex };
    }
}



/**
 * Pure helper function to walk text nodes of an element and find if any character slices
 * a document-relative boundary coordinate.
 * @param {!Element} element
 * @param {number} boundaryX
 * @param {number} currentScrollLeft
 * @return {?Object}
 */

/**
 * Helper to check a single paragraph and insert page break if it overruns a page boundary.
 * Returns true if a page break was inserted.
 * @private
 * @param {!Element} child
 * @param {!Element} readerViewport
 * @return {boolean}
 */
/**
 * Safe utility to compute which page boundaries a paragraph absolute span crosses.
 * @private
 * @param {number} docLeft
 * @param {number} docRight
 * @param {number} clientWidth
 * @return {!Array<number>}
 */
function getCrossedBoundaries(docLeft, docRight, clientWidth) {
    const boundaries = [];
    if (isFinite(docLeft) && isFinite(docRight) && docLeft < docRight) {
        let boundary = Math.ceil(docLeft / clientWidth) * clientWidth;
        let safetyCounter = 0;
        while (boundary < docRight && safetyCounter < 50) {
            if (boundary > 0) {
                boundaries.push(boundary);
            }
            boundary += clientWidth;
            safetyCounter++;
        }
    }
    return boundaries;
}

function checkAndRepairParagraph(child, readerViewport) {
    if (child.classList.contains('empty-line') || child.classList.contains('page-break')) {
        return false;
    }

    const clientWidth = readerViewport.clientWidth;
    if (!clientWidth || clientWidth <= 0) {
        return false;
    }
    const scrollLeft = readerViewport.scrollLeft;
    const absScroll = Math.abs(scrollLeft);

    const rect = child.getBoundingClientRect();
    const docLeft = rect.left + absScroll;
    const docRight = rect.right + absScroll;

    const boundaries = getCrossedBoundaries(docLeft, docRight, clientWidth);

    for (const boundaryX of boundaries) {
        if (boundaryX <= docLeft || boundaryX >= docRight) {
            continue;
        }

        // Check if the paragraph is already preceded by a page break to avoid infinite loop
        if (isPrecededByPageBreak(child)) {
            return false;
        }

        // Check if there is a character crossing the boundary
        const charInfo = findCharAtDocumentBoundary(child, boundaryX, scrollLeft);
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
 * Checks if a text node's bounding box crosses the boundary.
 * @private
 * @param {!Node} node
 * @param {number} boundaryX
 * @param {number} absScroll
 * @return {boolean}
 */
function isNodeCrossingBoundary(node, boundaryX, absScroll) {
    const nodeRange = document.createRange();
    try {
        nodeRange.selectNodeContents(node);
    } catch (e) {
        return false;
    }
    const nodeRect = nodeRange.getBoundingClientRect();
    const nodeLeft = nodeRect.left + absScroll;
    const nodeRight = nodeRect.right + absScroll;
    return nodeLeft < boundaryX && nodeRight > boundaryX;
}

/**
 * Helper to perform binary search for a boundary-crossing character inside a text node.
 * @private
 * @param {!Node} node
 * @param {number} boundaryX
 * @param {number} absScroll
 * @param {boolean} isRtl
 * @return {?Object}
 */
function searchCrossingCharInNode(node, boundaryX, absScroll, isRtl) {
    const text = node.textContent;
    if (!text) return null;

    if (!isNodeCrossingBoundary(node, boundaryX, absScroll)) {
        return null; // The entire text node is strictly to the left or right of the boundary
    }

    // 2. Binary search to find crossing character safely with maximum iterations guard
    let low = 0;
    let high = text.length - 1;
    let binarySafetyCounter = 0;

    while (low <= high && binarySafetyCounter < 100) {
        binarySafetyCounter++;
        const mid = Math.floor((low + high) / 2);
        const range = document.createRange();
        try {
            range.setStart(node, mid);
            range.setEnd(node, mid + 1);
        } catch (e) {
            break;
        }
        const rect = range.getBoundingClientRect();
        const docLeft = rect.left + absScroll;
        const docRight = rect.right + absScroll;

        if (docLeft < boundaryX - 0.5 && docRight > boundaryX + 0.5) {
            const before = text.substring(Math.max(0, mid - 10), mid);
            const after = text.substring(mid + 1, Math.min(text.length, mid + 11));
            return {
                char: text[mid],
                rect: rect,
                context: { before, after }
            };
        }

        const nextBounds = updateSearchBounds(isRtl, docLeft, boundaryX, mid, low, high);
        low = nextBounds.low;
        high = nextBounds.high;
    }

    return null;
}

/**
 * Safe helper to update binary search bounds based on text direction and boundary crossing.
 * @private
 * @param {boolean} isRtl
 * @param {number} docLeft
 * @param {number} boundaryX
 * @param {number} mid
 * @param {number} low
 * @param {number} high
 * @return {{low: number, high: number}} Contains updated low and high
 */
function updateSearchBounds(isRtl, docLeft, boundaryX, mid, low, high) {
    if (isRtl) {
        if (docLeft >= boundaryX - 0.5) {
            return { low: mid + 1, high: high };
        } else {
            return { low: low, high: mid - 1 };
        }
    } else {
        if (docLeft >= boundaryX - 0.5) {
            return { low: low, high: mid - 1 };
        } else {
            return { low: mid + 1, high: high };
        }
    }
}

/**
 * Recursively collect all text nodes under a parent element.
 * @private
 * @param {!Node} node
 * @param {!Array<!Node>} outTextNodes
 */
function collectTextNodes(node, outTextNodes) {
    if (node.nodeType === 3) {
        if (node.textContent && node.textContent.trim().length > 0) {
            outTextNodes.push(node);
        }
        return;
    }
    let child = node.firstChild;
    let safetyCounter = 0;
    while (child && safetyCounter < 1000) {
        collectTextNodes(child, outTextNodes);
        child = child.nextSibling;
        safetyCounter++;
    }
}

function findCharAtDocumentBoundary(element, boundaryX, currentScrollLeft) {
    const textNodes = [];
    collectTextNodes(element, textNodes);

    const absScroll = Math.abs(currentScrollLeft);
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    const isRtl = configModel.direction === "rtl";

    for (const node of textNodes) {
        const result = searchCrossingCharInNode(node, boundaryX, absScroll, isRtl);
        if (result) {
            return result;
        }
    }

    return null;
}

/**
 * Checks if a paragraph is preceded by a page break, skipping empty lines.
 * @private
 * @param {!Element} child
 * @return {boolean}
 */
function isPrecededByPageBreak(child) {
    let prev = child.previousElementSibling;
    let steps = 0;
    while (prev && steps < 10) {
        if (prev.classList.contains('page-break')) {
            return true;
        }
        if (!prev.classList.contains('empty-line')) {
            break;
        }
        prev = prev.previousElementSibling;
        steps++;
    }
    return false;
}

/**
 * Finds the predecessor non-empty visual element.
 * @private
 * @param {!Array<!Element>} children
 * @param {number} startIndex
 * @return {?Element}
 */
function findPredecessorElement(children, startIndex) {
    for (let j = startIndex - 1; j >= 0; j--) {
        const sibling = /** @type {!HTMLElement} */ (children[j]);
        if (sibling.classList.contains('page-break') || sibling.classList.contains('empty-line')) {
            continue;
        }
        const style = window.getComputedStyle(sibling);
        if (style.display !== 'none') {
            return sibling;
        }
    }
    return null;
}

/**
 * Calculates the remaining width of the current column.
 * @private
 * @param {!Element} prevElement
 * @param {!Element} parent
 * @param {number} columnWidth
 * @param {number} step
 * @return {number}
 */
function calculateRemainingWidth(prevElement, parent, columnWidth, step) {
    const rect = prevElement.getBoundingClientRect();
    const parentRight = parent.getBoundingClientRect().right;
    const prevLeft = rect.left;
    const relativeLeft = parentRight - prevLeft;

    const columnIndex = Math.floor(relativeLeft / step);
    const boundaryLeft = columnIndex * step + columnWidth;
    
    const remainingWidth = boundaryLeft - relativeLeft;
    
    if (remainingWidth <= 0 || remainingWidth > columnWidth) {
        return columnWidth;
    }
    return remainingWidth;
}

/**
 * Resolves layout parameter configuration safely.
 * Returns null if parameters are invalid.
 * @private
 * @param {?Element} parent
 * @param {?Element} viewport
 * @return {?{parent: !Element, columnWidth: number, columnGap: number, step: number}}
 */
function resolveLayoutParameters(parent, viewport) {
    if (!parent || !viewport) return null;

    const clientWidth = viewport.clientWidth;
    if (!clientWidth || clientWidth <= 0) return null;

    const computedStyle = window.getComputedStyle(parent);
    const columnWidth = parseFloat(computedStyle.columnWidth);
    if (!columnWidth || isNaN(columnWidth)) return null;

    const columnGap = parseFloat(computedStyle.columnGap);
    const parsedGap = isNaN(columnGap) ? 0 : columnGap;
    const step = columnWidth + parsedGap;

    return {
        parent: parent,
        columnWidth: columnWidth,
        columnGap: parsedGap,
        step: step
    };
}


