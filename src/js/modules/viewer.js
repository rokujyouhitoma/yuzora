/**
 * Yuzora - Book Loading, Pagination & Viewer Controller Module
 */
"use strict";

function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith(".txt")) {
        reader.onload = function(e) {
            // Text files (Aozora Shift_JIS/UTF-8 format)
            const buffer = e.target.result;
            
            // Auto detect utf-8 vs shift-jis
            const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                const text = utf8Decoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, text));
            } catch (err) {
                // Fallback to Shift_JIS on UTF-8 decode failure for user uploaded files
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const text = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, text));
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
        reader.onload = function(e) {
            const buffer = e.target.result;
            // Decode HTML with utf-8 first, fallback to shift-jis
            const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                const htmlText = utf8Decoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, htmlText));
            } catch (err) {
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const htmlText = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, htmlText));
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("サポートされていないファイル形式です。青空文庫の .txt または .html ファイルを選択してください。");
    }
}

function loadPredefinedBook(book) {
    const bookData = PREDEFINED_BOOKS.find(b => b.id === book);
    if (!bookData) return;

    fetch(bookData.path)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            // For predefined recommended books, try UTF-8 decoding first as they are UTF-8 encoded in this repository
            const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                const text = utf8Decoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(bookData.title, text));
            } catch (err) {
                console.warn("Shift_JIS decode failed (fatal=true), falling back to UTF-8 for predefined book", err);
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const text = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(bookData.title, text));
            }
        })
        .catch(error => {
            console.error("Failed to load predefined book:", error);
            alert("推奨書籍の読み込みに失敗しました。");
        });
}

function displayBook() {
    const bookModel = /** @type {!BookModelInterface} */ (window.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));

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
    const predefinedBook = PREDEFINED_BOOKS.find(b => bookModel.title.includes(b.cardId.toString()));
    if (predefinedBook) {
        title = predefinedBook.title;
    }

    // Apply to viewer
    viewContext.bookTitle.textContent = title;
    document.title = `${title} - ゆうぞら`;
    viewContext.readerContent.innerHTML = parsedHTML;

    // Set default activeHeadingId to the first TOC item if available
    viewContext.activeHeadingId = (bookModel.toc && bookModel.toc.length > 0) ? bookModel.toc[0].id : null;

    // Display Reader, Hide Welcome Screen
    viewContext.welcomeScreen.classList.add('hidden');
    viewContext.readerScreen.classList.remove('hidden');

    // Check if there is a saved bookmark for this file
    const savedProgress = localStorage.getItem(`bookmark_${bookModel.title}`);
    if (savedProgress) {
        bookmarkModel.bookmarkProgress = parseFloat(savedProgress);
    } else {
        bookmarkModel.bookmarkProgress = 0;
    }

    // Wait a tick for rendering to complete before restoring scroll position
    viewContext.isReflowing = true;
    setTimeout(() => {
        restoreScrollPosition();
        updateProgress();
        
        const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
        eventBus.dispatchEvent(new YuzoraEvent("book-rendered"));
        setTimeout(() => {
            viewContext.isReflowing = false;
        }, 50);
    }, 100);
}

function handleScroll() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    if (viewContext.isReflowing) return;
    updateProgress();
}

function updateProgress() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
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
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (window.locator.resolve(ConfigModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    const maxScroll = viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth;
    if (configModel.direction === 'rtl') {
        // In vertical-rl, scrolling forward is in the negative direction.
        viewContext.readerViewport.scrollLeft = -(bookmarkModel.bookmarkProgress * maxScroll);
    } else {
        // In vertical-lr, scrolling forward is in the positive direction.
        viewContext.readerViewport.scrollLeft = bookmarkModel.bookmarkProgress * maxScroll;
    }
}

function restoreScrollPositionSmooth() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (window.locator.resolve(ConfigModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    const maxScroll = viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth;
    const targetScroll = configModel.direction === 'rtl' ? -(bookmarkModel.bookmarkProgress * maxScroll) : (bookmarkModel.bookmarkProgress * maxScroll);
    viewContext.readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

function saveBookmark() {
    const bookModel = /** @type {!BookModelInterface} */ (window.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    if (bookModel.title) {
        bookmarkModel.save(bookModel.title, bookmarkModel.bookmarkProgress);
    }
}

function nextPage() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const clientWidth = viewContext.readerViewport.clientWidth;
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const pageCount = Math.round(viewContext.readerViewport.scrollWidth / clientWidth);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage < pageCount) {
        CommandManager.execute(new NavigatePageCommand(currentPage + 1));
    }
}

function prevPage() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const clientWidth = viewContext.readerViewport.clientWidth;
    const currentScroll = Math.abs(viewContext.readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage > 1) {
        CommandManager.execute(new NavigatePageCommand(currentPage - 1));
    }
}

function scrollToPage(pageNumber) {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (window.locator.resolve(ConfigModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    const clientWidth = viewContext.readerViewport.clientWidth;
    const targetScrollLeft = (pageNumber - 1) * clientWidth;
    
    viewContext.isReflowing = true;
    viewContext.readerViewport.scrollTo({
        left: configModel.direction === 'rtl' ? -targetScrollLeft : targetScrollLeft,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        viewContext.isReflowing = false;
        // Keep progress and bar updated in real-time
        const maxScroll = viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth;
        bookmarkModel.bookmarkProgress = maxScroll > 0 ? targetScrollLeft / maxScroll : 0;
        updateProgress();
        saveBookmark();
    }, 400); // Wait for transition animation to complete
}

function handleResize() {
    const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (window.locator.resolve(ConfigModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    // Avoid double reflow trigger cycles
    if (viewContext.isReflowing) return;
    
    viewContext.isReflowing = true;
    const oldProgress = bookmarkModel.bookmarkProgress;
    
    // Temporarily reset columns layout width before recalculations to get accurate sizing
    viewContext.readerContent.style.width = 'auto';
    
    setTimeout(() => {
        // Enforce column content size width constraints
        viewContext.readerContent.style.width = 'max-content';
        
        // Restore progress coordinates on new dimensions
        const maxScroll = Math.abs(viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth);
        if (configModel.direction === 'rtl') {
            viewContext.readerViewport.scrollLeft = -(oldProgress * maxScroll);
        } else {
            viewContext.readerViewport.scrollLeft = oldProgress * maxScroll;
        }
        
        bookmarkModel.bookmarkProgress = oldProgress;
        updateProgress();
        
        setTimeout(() => {
            viewContext.isReflowing = false;
        }, 50);
    }, 100);
}

function checkLastSession() {
    const bookModel = /** @type {!BookModelInterface} */ (window.locator.resolve(BookModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
    const lastProgress = localStorage.getItem(`bookmark_${bookModel.title}`);
    if (lastProgress) {
        bookmarkModel.bookmarkProgress = parseFloat(lastProgress);
    } else {
        bookmarkModel.bookmarkProgress = 0;
    }
    restoreScrollPosition();
    updateProgress();
}

document.addEventListener("DOMContentLoaded", () => {
    const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));

    // Listen to book loading requests
    eventBus.addEventListener("book-loaded", (e) => {
        displayBook();
    });

    // Listen to page navigation requests
    eventBus.addEventListener("navigate-page", (e) => {
        const detail = /** @type {{targetPage: number}} */ (e.detail);
        scrollToPage(detail.targetPage);
    });
});
