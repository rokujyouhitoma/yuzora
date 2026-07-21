/**
 * Yuzora - Book Loading, Pagination & Viewer Controller Module
 */
"use strict";

function handleFile(file) {
    if (!file) return;

    const resourceDirector = /** @type {!ResourceDirectorInterface} */ (Yuzora.locator.resolve(ResourceDirector));

    const loaderFn = function() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const buffer = /** @type {!ArrayBuffer} */ (e.target.result);
                const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
                try {
                    resolve(utf8Decoder.decode(buffer));
                } catch (err) {
                    const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                    resolve(sjisDecoder.decode(buffer));
                }
            };
            reader.onerror = function() {
                reject(new Error("File reading failed."));
            };
            reader.readAsArrayBuffer(file);
        });
    };

    resourceDirector.loadBook(file.name, file.name, loaderFn)
        .then(bookAsset => {
            CommandManager.execute(new LoadBookCommand(bookAsset.id, bookAsset.content));
        })
        .catch(error => {
            console.error("Failed to load dropped file:", error);
            alert("ファイルの読み込みに失敗しました: " + (/** @type {!Error} */ (error)).message);
        });
}

function loadPredefinedBook(book) {
    const bookData = PREDEFINED_BOOKS.find(b => b.id === book);
    if (!bookData) return;

    const resourceDirector = /** @type {!ResourceDirectorInterface} */ (Yuzora.locator.resolve(ResourceDirector));

    const loaderFn = function() {
        return fetch(bookData.path)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
                try {
                    return utf8Decoder.decode(buffer);
                } catch (err) {
                    console.warn("Shift_JIS decode failed (fatal=true), falling back to UTF-8 for predefined book", err);
                    const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                    return sjisDecoder.decode(buffer);
                }
            });
    };

    resourceDirector.loadBook(bookData.title, bookData.path, loaderFn)
        .then(bookAsset => {
            CommandManager.execute(new LoadBookCommand(bookAsset.id, bookAsset.content));
        })
        .catch(error => {
            console.error("Failed to load predefined book:", error);
            alert("推奨書籍の読み込みに失敗しました: " + (/** @type {!Error} */ (error)).message);
        });
}

let currentLoadId = 0;

async function displayBook() {
    const loadId = ++currentLoadId;
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));

    // Invalidate cached layout dimensions for the new book
    viewContext.cachedScrollWidth = null;
    viewContext.cachedClientWidth = null;

    const parser = /** @type {!AozoraParserInterface} */ (Yuzora.locator.resolve(AozoraParser));

    // eslint-disable-next-line complexity
    const onFirstChunkReady = async (title, author, html) => {
        const currentBookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
        if (!currentBookModel) return;
        currentBookModel.title = title;
        currentBookModel.author = author;

        // Override with predefined book title/author if matched
        const predefinedBook = PREDEFINED_BOOKS.find(b => b.title === title || title.includes(b.cardId.toString()));
        if (predefinedBook) {
            currentBookModel.title = predefinedBook.title;
            currentBookModel.author = predefinedBook.author || '';
        }

        // Apply to viewer
        const currentViewContext = /** @type {?} */ (Yuzora.locator.resolve(ViewContext));
        if (currentViewContext && currentViewContext.bookTitle) {
            currentViewContext.bookTitle.textContent = currentBookModel.title;
        }
        document.title = `${currentBookModel.title} - ゆうぞら`;
        
        const currentRenderer = /** @type {?} */ (Yuzora.locator.resolve(VerticalRenderer));
        if (currentRenderer) {
            currentRenderer.render(html);
        }

        // Transition to reader scene via SceneDirector
        const currentSceneDirector = /** @type {?} */ (Yuzora.locator.resolve(SceneDirector));
        if (currentSceneDirector) {
            currentSceneDirector.transitionTo('reader');
        }

        // Sync URL hash and update router.currentHash to avoid loop
        const currentRouter = /** @type {?} */ (Yuzora.locator.resolve(Router));
        if (currentRouter) {
            if (predefinedBook) {
                const nextHash = "#/reader?book=" + predefinedBook.id;
                currentRouter.currentHash = nextHash;
                window.location.hash = nextHash;
            } else {
                const nextHash = "#/reader?local=" + encodeURIComponent(currentBookModel.title);
                currentRouter.currentHash = nextHash;
                window.location.hash = nextHash;
            }
        }

        // Check if there is a saved bookmark for this file
        const bookmarkRepo = /** @type {?} */ (Yuzora.locator.resolve(BookmarkRepository));
        const currentBookmarkModel = /** @type {?} */ (Yuzora.locator.resolve(BookmarkModel));
        if (bookmarkRepo && currentBookmarkModel) {
            currentBookmarkModel.bookmarkProgress = await bookmarkRepo.load(currentBookModel.title);
        }

        if (currentLoadId !== loadId) {
            return;
        }

        // Restore scroll position immediately for the initial chunk to display first pages
        restoreScrollPosition();
        updateProgress();
    };

    const onChunkParsed = (html) => {
        const currentRenderer = /** @type {?} */ (Yuzora.locator.resolve(VerticalRenderer));
        if (!currentRenderer) return;
        // Safe DOM append
        if (typeof currentRenderer.appendRender === 'function') {
            currentRenderer.appendRender(html);
        }
    };

    const onComplete = () => {
        const currentBookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
        const currentViewContext = /** @type {?} */ (Yuzora.locator.resolve(ViewContext));
        if (!currentBookModel || !currentViewContext) return;

        // Set default activeHeadingId to the first TOC item if available
        currentViewContext.activeHeadingId = (currentBookModel.toc && currentBookModel.toc.length > 0) ? currentBookModel.toc[0].id : null;

        // Wait a tick for rendering to complete before running final self-repair and full TOC check
        currentViewContext.isReflowing = true;
        window['__isReflowing__'] = true;
        
        setTimeout(async () => {
            if (currentLoadId !== loadId) {
                return;
            }

            try {
                const currentRenderer = /** @type {?} */ (Yuzora.locator.resolve(VerticalRenderer));
                if (!currentRenderer) return;

                // Run final page adjustments
                await currentRenderer.adjustPageBreaksForOverrun();

                if (currentLoadId !== loadId) {
                    return;
                }

                try {
                    restoreScrollPosition();
                    updateProgress();
                    yuzora.publisher.publish(YuzoraEventType.BOOK_RENDERED);
                    setTimeout(() => {
                        if (currentLoadId !== loadId) {
                            return;
                        }
                        const finalViewContext = /** @type {?} */ (Yuzora.locator.resolve(ViewContext));
                        if (finalViewContext) {
                            finalViewContext.isReflowing = false;
                        }
                        window['__isReflowing__'] = false;
                    }, 50);
                } catch (err) {
                    document.title = "FATAL_ERROR: " + (err instanceof Error ? err.message : String(err));
                    console.error("FATAL_ERROR: ", err);
                    const finalViewContext = /** @type {?} */ (Yuzora.locator.resolve(ViewContext));
                    if (finalViewContext) {
                        finalViewContext.isReflowing = false;
                    }
                    window['__isReflowing__'] = false;
                }
            } catch (e) {
                console.error("Self repair on complete failed:", e);
                const finalViewContext = /** @type {?} */ (Yuzora.locator.resolve(ViewContext));
                if (finalViewContext) {
                    finalViewContext.isReflowing = false;
                }
                window['__isReflowing__'] = false;
            }
        }, 50);
    };

    const shouldCancel = () => {
        return loadId !== currentLoadId;
    };

    if (bookModel.type === 'txt') {
        // Execute background parsing via Web Worker
        // @ts-expect-error
        await parser.parseAozoraTextIncremental(bookModel.content, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel);
    } else {
        // HTML is fast enough to parse synchronously
        const parsed = parser.parseAozoraHTML(bookModel.content);
        await onFirstChunkReady(parsed.title || bookModel.title.replace(/\.(x?html)/, ''), '', parsed.body);
        onComplete();
    }
}

function handleScroll() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.isReflowing) return;
    updateProgress();
}

function updateProgress() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    if (!viewContext.readerViewport) return;

    const startTime = performance.now();

    // Use cached values if available to avoid layout thrashing
    let scrollWidth = viewContext.cachedScrollWidth;
    let clientWidth = viewContext.cachedClientWidth;
    if (scrollWidth === null || clientWidth === null) {
        scrollWidth = viewContext.readerViewport.scrollWidth;
        clientWidth = viewContext.readerViewport.clientWidth;
        viewContext.cachedScrollWidth = scrollWidth;
        viewContext.cachedClientWidth = clientWidth;
    }

    const sWidth = /** @type {number} */ (scrollWidth);
    const cWidth = /** @type {number} */ (clientWidth);

    const scrollLeft = Math.abs(viewContext.readerViewport.scrollLeft);
    const maxScroll = sWidth - cWidth;

    if (maxScroll <= 0) {
        bookmarkModel.bookmarkProgress = 0;
    } else {
        bookmarkModel.bookmarkProgress = scrollLeft / maxScroll;
    }

    // Progress bar percentage (0 to 100)
    const percentage = Math.min(100, Math.max(0, Math.round(bookmarkModel.bookmarkProgress * 100)));

    // Cancel pending animation frame to throttle writes
    if (viewContext.progressAnimationFrameId !== null) {
        cancelAnimationFrame(viewContext.progressAnimationFrameId);
    }

    // Schedule DOM writes to avoid layout thrashing
    viewContext.progressAnimationFrameId = requestAnimationFrame(() => {
        viewContext.progressAnimationFrameId = null;

        if (viewContext.progressBar) viewContext.progressBar.style.width = `${percentage}%`;
        if (viewContext.readingPercentage) viewContext.readingPercentage.textContent = `${percentage}%`;

        // Calculate pages based on viewport clientWidth
        const pageCount = Math.round(sWidth / cWidth);
        const currentPage = Math.min(pageCount, Math.max(1, Math.round(scrollLeft / cWidth) + 1));
        if (viewContext.readingIndex) viewContext.readingIndex.textContent = `${currentPage} / ${pageCount} ページ`;
    });

    const durationMs = performance.now() - startTime;
    if (window['__DEBUG_PERFORMANCE__'] && durationMs > 1) {
        console.log(`[Progress Update] updateProgress logic took ${durationMs.toFixed(2)}ms (DOM writes deferred via rAF)`);
    }
}

function restoreScrollPosition() {
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));
    renderer.restoreScrollPosition(bookmarkModel.bookmarkProgress, false);
}

function restoreScrollPositionSmooth() {
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));
    renderer.restoreScrollPosition(bookmarkModel.bookmarkProgress, true);
}

async function saveBookmark() {
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    if (bookModel.title) {
        await bookmarkModel.save(bookModel.title, bookmarkModel.bookmarkProgress);
    }
}

function nextPage() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (!viewContext.readerViewport) return;

    let clientWidth = viewContext.cachedClientWidth;
    let scrollWidth = viewContext.cachedScrollWidth;
    if (clientWidth === null || scrollWidth === null) {
        clientWidth = viewContext.readerViewport.clientWidth;
        scrollWidth = viewContext.readerViewport.scrollWidth;
        viewContext.cachedClientWidth = clientWidth;
        viewContext.cachedScrollWidth = scrollWidth;
    }

    const sWidth = /** @type {number} */ (scrollWidth);
    const cWidth = /** @type {number} */ (clientWidth);
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const pageCount = Math.round(sWidth / cWidth);
    const currentPage = Math.round(currentScroll / cWidth) + 1;

    if (currentPage < pageCount) {
        CommandManager.execute(new NavigatePageCommand(currentPage + 1));
    }
}

function prevPage() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (!viewContext.readerViewport) return;

    let clientWidth = viewContext.cachedClientWidth;
    if (clientWidth === null) {
        clientWidth = viewContext.readerViewport.clientWidth;
        viewContext.cachedClientWidth = clientWidth;
    }

    const cWidth = /** @type {number} */ (clientWidth);
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / cWidth) + 1;

    if (currentPage > 1) {
        CommandManager.execute(new NavigatePageCommand(currentPage - 1));
    }
}

function scrollToPage(pageNumber) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));
    
    let clientWidth = viewContext.cachedClientWidth;
    let scrollWidth = viewContext.cachedScrollWidth;
    if (clientWidth === null || scrollWidth === null) {
        clientWidth = viewContext.readerViewport.clientWidth;
        scrollWidth = viewContext.readerViewport.scrollWidth;
        viewContext.cachedClientWidth = clientWidth;
        viewContext.cachedScrollWidth = scrollWidth;
    }

    const sWidth = /** @type {number} */ (scrollWidth);
    const cWidth = /** @type {number} */ (clientWidth);
    const targetScrollLeft = (pageNumber - 1) * cWidth;
    
    const startTime = performance.now();
    viewContext.isReflowing = true;
    renderer.scrollToPage(pageNumber).then(() => {
        viewContext.isReflowing = false;

        const durationMs = performance.now() - startTime;
        if (window['__DEBUG_PERFORMANCE__']) {
            console.log(`[Page Navigation] Scroll to page ${pageNumber} completed in ${durationMs.toFixed(1)}ms`);
        }

        // Publish PAGE_CHANGED event to trigger the asynchronous layout check flow
        yuzora.publisher.publish(YuzoraEventType.PAGE_CHANGED, { page: pageNumber });

        // Keep progress and bar updated in real-time
        const maxScroll = sWidth - cWidth;
        bookmarkModel.bookmarkProgress = maxScroll > 0 ? targetScrollLeft / maxScroll : 0;
        updateProgress();
        saveBookmark();
    });
}

function handleResize() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));
    
    // Avoid double reflow trigger cycles
    if (viewContext.isReflowing) return;
    
    // Invalidate cached dimensions on resize
    viewContext.cachedScrollWidth = null;
    viewContext.cachedClientWidth = null;
    
    viewContext.isReflowing = true;
    window['__isReflowing__'] = true;
    const oldProgress = bookmarkModel.bookmarkProgress;
    
    // 自己修復（非同期タイムスライス）の完了イベントを待ってから最終処理を行う
    const handler = () => {
        yuzora.publisher.unsubscribe(YuzoraEventType.LAYOUT_REPAIRED, handler);
        bookmarkModel.bookmarkProgress = oldProgress;
        updateProgress();
        setTimeout(() => {
            viewContext.isReflowing = false;
            window['__isReflowing__'] = false;
        }, 50);
    };
    yuzora.publisher.subscribe(YuzoraEventType.LAYOUT_REPAIRED, handler);

    renderer.handleResize(oldProgress);
}

async function checkLastSession() {
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const bookmarkRepo = /** @type {!BookmarkRepositoryInterface} */ (Yuzora.locator.resolve(BookmarkRepository));
    bookmarkModel.bookmarkProgress = await bookmarkRepo.load(bookModel.title);
    restoreScrollPosition();
    updateProgress();
}

document.addEventListener("DOMContentLoaded", () => {
    // Listen to book loading requests
    yuzora.publisher.subscribe(YuzoraEventType.BOOK_LOADED, () => {
        displayBook();
    });

    // Listen to page navigation requests
    yuzora.publisher.subscribe(YuzoraEventType.NAVIGATE_PAGE, (detail) => {
        const pageDetail = /** @type {{targetPage: number}} */ (detail);
        scrollToPage(pageDetail.targetPage);
    });
});
