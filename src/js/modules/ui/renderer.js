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

        /** @private @const {!DOMParser} */
        this.domParser = new DOMParser();

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

        const doc = this.domParser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        if (!body) return;

        // Force white-list based DOM sanitization (Defense in Depth)
        const evaluator = /** @type {!AozoraEvaluatorInterface} */ (Yuzora.locator.resolve(AozoraEvaluator));
        if (evaluator) {
            evaluator.sanitizeDOM(body);
        }

        // Safe DOM Node migration (prevents browser re-parsing innerHTML)
        this.viewContext.readerContent.innerHTML = '';
        while (body.firstChild) {
            this.viewContext.readerContent.appendChild(body.firstChild);
        }
    }

    /**
     * Appends parsed HTML content to the viewport container securely.
     * @override
     * @param {string} htmlContent
     */
    // @ts-expect-error
    appendRender(htmlContent) {
        if (!this.viewContext.readerContent) return;

        const doc = this.domParser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        if (!body) return;

        // Force white-list based DOM sanitization (Defense in Depth)
        const evaluator = /** @type {!AozoraEvaluatorInterface} */ (Yuzora.locator.resolve(AozoraEvaluator));
        if (evaluator) {
            evaluator.sanitizeDOM(body);
        }

        // Safe DOM Node migration (prevents browser re-parsing innerHTML)
        while (body.firstChild) {
            this.viewContext.readerContent.appendChild(body.firstChild);
        }
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

        return AnimationUtils.waitForTransition(this.viewContext.readerViewport, 400);
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
            DOMUtils.afterReflow(() => {
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
            });
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

            const startTime = performance.now();

            // Direct node filtering without window.getComputedStyle to avoid forced synchronous layout
            const rawChildren = Array.from(readerContent.children);
            const childNodes = [];
            for (let k = 0; k < rawChildren.length; k++) {
                const node = /** @type {!HTMLElement} */ (rawChildren[k]);
                if (node.nodeType === 1 && !node.classList.contains('empty-line') && node.style.display !== 'none') {
                    childNodes.push(node);
                }
            }

            const clientWidth = readerViewport.clientWidth || 800;
            const absScroll = Math.abs(readerViewport.scrollLeft);
            
            // Viewport-windowed scanning range: focus on paragraphs near current viewport
            // (within 2 pages before and 4 pages after current position) to prevent blocking large books
            const minX = Math.max(0, absScroll - clientWidth * 2);
            const maxX = absScroll + clientWidth * 4;

            // 1. Remove existing dynamic page breaks ONLY within the active window range
            // to preserve calculated page breaks on other pages when scrolling large books
            const existingBreaks = readerContent.querySelectorAll('.dynamic-page-break');
            existingBreaks.forEach(el => {
                const bRect = el.getBoundingClientRect();
                const bLeft = bRect.left + absScroll;
                if (bLeft >= minX && bLeft <= maxX) {
                    el.remove();
                }
            });

            // Merge any split paragraphs within window back into their original parent paragraphs
            const splitParas = readerContent.querySelectorAll('.dynamic-split-paragraph');
            splitParas.forEach(splitEl => {
                const bRect = splitEl.getBoundingClientRect();
                const bLeft = bRect.left + absScroll;
                if (bLeft >= minX && bLeft <= maxX) {
                    const prevBreak = splitEl.previousElementSibling;
                    const origPara = prevBreak ? prevBreak.previousElementSibling : null;
                    if (origPara && origPara.nodeName === splitEl.nodeName) {
                        origPara.textContent += splitEl.textContent;
                        if (prevBreak) prevBreak.remove();
                        splitEl.remove();
                    }
                }
            });

            let i = 0;
            let lastYieldTime = performance.now();
            let anyRepaired = false;
            let evaluatedCount = 0;

            while (i < childNodes.length) {
                // 中断チェック：新しい修復が割り込んだ場合は即座に実行を終了する
                if (this.currentRepairId !== repairId) {
                    if (window['__DEBUG_PERFORMANCE__']) {
                        console.log(`[Layout Repair Profile] Aborted repairId ${repairId} at node ${i}/${childNodes.length}`);
                    }
                    return;
                }

                const child = childNodes[i];
                const rect = child.getBoundingClientRect();
                const docLeft = rect.left + absScroll;

                if (docLeft >= minX && docLeft <= maxX) {
                    evaluatedCount++;
                    const repaired = checkAndRepairParagraph(child, readerViewport);
                    if (repaired) {
                        anyRepaired = true;
                    }
                }

                i++;

                // メインスレッドを解放してブロッキングを回避（10ms フレーム予算型タイムスライス & ユーザー入力優先判定）
                lastYieldTime = await TaskScheduler.yieldToMainThread(10, lastYieldTime);
                if (this.currentRepairId !== repairId) {
                    return;
                }
            }

            if (anyRepaired) {
                this.applyPageBreakSizes();
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
                evaluatedCount: evaluatedCount,
                scannedCount: childNodes.length,
                durationMs: parseFloat(durationMs.toFixed(1))
            };

            // Clear cached layout dimensions as DOM modifications will affect them
            this.viewContext.cachedScrollWidth = null;
            this.viewContext.cachedClientWidth = null;

            if (window['__DEBUG_PERFORMANCE__']) {
                console.log(`[Layout Repair Profile] Completed in ${durationMs.toFixed(1)}ms. Total nodes: ${childNodes.length}, Window evaluated: ${evaluatedCount}, Breaks inserted: ${insertedCount}`);
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
                const relativeLeft = isRtl 
                    ? (parentRect.right - rect.left)
                    : (rect.right - parentRect.left);

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

// eslint-disable-next-line complexity
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

        // Check if there is a character crossing the boundary
        const charInfo = findCharAtDocumentBoundary(child, boundaryX, scrollLeft);
        if (charInfo) {
            if (!isPrecededByPageBreak(child)) {
                // Insert page break before this paragraph
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break dynamic-page-break';
                child.parentNode.insertBefore(pageBreak, child);
                return true;
            } else if (charInfo.node && charInfo.node.nodeType === 3) {
                // Long paragraph case: paragraph is already preceded by a page break,
                // but still crosses a downstream page boundary. Split paragraph at char.
                return splitParagraphAtChar(child, charInfo.node, charInfo.charIndex);
            }
        }
    }

    return false;
}

/**
 * Splits a long paragraph at a specific character index and inserts a page break between the two halves.
 * @private
 * @param {!Element} paragraph
 * @param {!Node} textNode
 * @param {number} charIndex
 * @return {boolean}
 */
function splitParagraphAtChar(paragraph, textNode, charIndex) {
    if (!textNode || !textNode.textContent || charIndex <= 0) {
        return false;
    }
    const fullText = textNode.textContent;
    const firstPart = fullText.substring(0, charIndex);
    const secondPart = fullText.substring(charIndex);

    textNode.textContent = firstPart;

    const newParagraph = document.createElement('p');
    newParagraph.className = (paragraph.className || '') + ' dynamic-split-paragraph';
    newParagraph.textContent = secondPart;

    const pageBreak = document.createElement('div');
    pageBreak.className = 'page-break dynamic-page-break dynamic-split-break';

    const parent = paragraph.parentNode;
    const nextSib = paragraph.nextSibling;

    parent.insertBefore(pageBreak, nextSib);
    parent.insertBefore(newParagraph, nextSib);

    return true;
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
/**
 * Computes a fallback column width when computedStyle returns NaN or 'auto'.
 * @param {!Element} parent
 * @param {!Element} viewport
 * @param {number} parsedGap
 * @return {number}
 */
function computeFallbackColumnWidth(parent, viewport, parsedGap) {
    const isDesktop = window.innerWidth >= 768;
    const availableBlockSize = parent.clientHeight || viewport.clientHeight || 0;
    if (availableBlockSize <= 0) return 0;
    return isDesktop ? (availableBlockSize - parsedGap) / 2 : availableBlockSize;
}

/**
 * Validates whether column width is a valid positive number.
 * @param {number} width
 * @return {boolean}
 */
function isValidColumnWidth(width) {
    return typeof width === 'number' && !isNaN(width) && width > 0;
}

/**
 * Resolves current multi-column layout parameters (columnWidth, columnGap, step).
 * @param {?Element} parent
 * @param {?Element} viewport
 * @return {?{parent: !Element, columnWidth: number, columnGap: number, step: number}}
 */
function resolveLayoutParameters(parent, viewport) {
    if (!parent || !viewport || !viewport.clientWidth) return null;

    const computedStyle = window.getComputedStyle(parent);
    let columnWidth = parseFloat(computedStyle.columnWidth);
    const columnGap = parseFloat(computedStyle.columnGap);
    const parsedGap = isNaN(columnGap) ? 0 : columnGap;

    if (!isValidColumnWidth(columnWidth)) {
        columnWidth = computeFallbackColumnWidth(parent, viewport, parsedGap);
    }

    if (!isValidColumnWidth(columnWidth)) return null;

    return {
        parent: parent,
        columnWidth: columnWidth,
        columnGap: parsedGap,
        step: columnWidth + parsedGap
    };
}


