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

async function displayBook() {
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));

    let parsedHTML = '';
    let title = bookModel.title;

    if (bookModel.type === 'txt') {
        // Parse plain text with Aozora annotation
        const parsed = parseAozoraText(bookModel.content);
        parsedHTML = parsed.body;
        title = parsed.title || bookModel.title.replace('.txt', '');
    } else {
        // XHTML/HTML
        const parsed = parseAozoraHTML(bookModel.content);
        parsedHTML = parsed.body;
        title = parsed.title || bookModel.title.replace(/\.(x?html)/, '');
    }

    // Override with predefined book title if matched
    const predefinedBook = PREDEFINED_BOOKS.find(b => b.title === bookModel.title || bookModel.title.includes(b.cardId.toString()));
    if (predefinedBook) {
        title = predefinedBook.title;
    }

    // Apply to viewer
    viewContext.bookTitle.textContent = title;
    document.title = `${title} - ゆうぞら`;
    renderer.render(parsedHTML);

    // Set default activeHeadingId to the first TOC item if available
    viewContext.activeHeadingId = (bookModel.toc && bookModel.toc.length > 0) ? bookModel.toc[0].id : null;

    // Transition to reader scene via SceneDirector
    const sceneDirector = /** @type {!SceneDirectorInterface} */ (Yuzora.locator.resolve(SceneDirector));
    sceneDirector.transitionTo('reader');

    // Sync URL hash and update router.currentHash to avoid loop
    const router = /** @type {!RouterInterface} */ (Yuzora.locator.resolve(Router));
    if (predefinedBook) {
        const nextHash = "#/reader?book=" + predefinedBook.id;
        router.currentHash = nextHash;
        window.location.hash = nextHash;
    } else {
        const nextHash = "#/reader?local=" + encodeURIComponent(bookModel.title);
        router.currentHash = nextHash;
        window.location.hash = nextHash;
    }

    // Check if there is a saved bookmark for this file
    const bookmarkRepo = /** @type {!BookmarkRepositoryInterface} */ (Yuzora.locator.resolve(BookmarkRepository));
    bookmarkModel.bookmarkProgress = await bookmarkRepo.load(bookModel.title);

    // Wait a tick for rendering to complete before restoring scroll position
    viewContext.isReflowing = true;
    setTimeout(() => {
        renderer.adjustPageBreaksForOverrun();
        restoreScrollPosition();
        updateProgress();
        
        yuzora.publisher.publish(YuzoraEventType.BOOK_RENDERED);
        setTimeout(() => {
            viewContext.isReflowing = false;
        }, 50);
    }, 100);
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

    const scrollLeft = Math.abs(viewContext.readerViewport.scrollLeft);
    const scrollWidth = viewContext.readerViewport.scrollWidth;
    const clientWidth = viewContext.readerViewport.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
        bookmarkModel.bookmarkProgress = 0;
    } else {
        bookmarkModel.bookmarkProgress = scrollLeft / maxScroll;
    }

    // Progress bar percentage (0 to 100)
    const percentage = Math.min(100, Math.max(0, Math.round(bookmarkModel.bookmarkProgress * 100)));
    if (viewContext.progressBar) viewContext.progressBar.style.width = `${percentage}%`;
    if (viewContext.readingPercentage) viewContext.readingPercentage.textContent = `${percentage}%`;

    // Calculate pages based on viewport clientWidth
    const pageCount = Math.round(scrollWidth / clientWidth);
    const currentPage = Math.min(pageCount, Math.max(1, Math.round(scrollLeft / clientWidth) + 1));
    if (viewContext.readingIndex) viewContext.readingIndex.textContent = `${currentPage} / ${pageCount} ページ`;
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
    const clientWidth = viewContext.readerViewport.clientWidth;
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const pageCount = Math.round(viewContext.readerViewport.scrollWidth / clientWidth);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage < pageCount) {
        CommandManager.execute(new NavigatePageCommand(currentPage + 1));
    }
}

function prevPage() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const clientWidth = viewContext.readerViewport.clientWidth;
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage > 1) {
        CommandManager.execute(new NavigatePageCommand(currentPage - 1));
    }
}

function scrollToPage(pageNumber) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const renderer = /** @type {!RendererInterface} */ (Yuzora.locator.resolve(VerticalRenderer));
    const clientWidth = viewContext.readerViewport.clientWidth;
    const targetScrollLeft = (pageNumber - 1) * clientWidth;
    
    viewContext.isReflowing = true;
    renderer.scrollToPage(pageNumber).then(() => {
        viewContext.isReflowing = false;

        // After the scroll animation settles, inspect the boundaries flanking the new page.
        // If an overrun is detected at character level, trigger the self-repair engine.
        // The check is read-only and skips the expensive DOM repair when not needed.
        if (renderer.hasOverrunNearCurrentPage()) {
            renderer.adjustPageBreaksForOverrun();
        }

        // Keep progress and bar updated in real-time
        const maxScroll = viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth;
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
    
    viewContext.isReflowing = true;
    const oldProgress = bookmarkModel.bookmarkProgress;
    
    renderer.handleResize(oldProgress).then(() => {
        bookmarkModel.bookmarkProgress = oldProgress;
        updateProgress();
        
        setTimeout(() => {
            viewContext.isReflowing = false;
        }, 50);
    });
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
