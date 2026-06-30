/**
 * Yuzora - Book Loading, Pagination & Viewer Controller Module
 */
"use strict";

function handleFile(file) {
    if (!file) return;

    const state = window.locator.resolve(AppState);
    state.currentFileName = file.name;
    const reader = new FileReader();

    if (file.name.endsWith(".txt")) {
        state.currentFileType = "txt";
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
        state.currentFileType = "html";
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
    const state = window.locator.resolve(AppState);
    let parsedHTML = '';
    let title = state.currentFileName;

    if (state.currentFileType === 'txt') {
        // Parse plain text with Aozora annotation
        const parsed = parseAozoraText(state.currentFileContent);
        parsedHTML = parsed.body;
        title = parsed.title || state.currentFileName.replace('.txt', '');
    } else {
        // XHTML/HTML
        const parsed = parseAozoraHTML(state.currentFileContent);
        parsedHTML = parsed.body;
        title = parsed.title || state.currentFileName.replace(/\.(x?html)/, '');
    }

    // Override with predefined book title if matched
    const predefinedBook = PREDEFINED_BOOKS.find(b => state.currentFileName.includes(b.cardId.toString()));
    if (predefinedBook) {
        title = predefinedBook.title;
    }

    // Apply to viewer
    state.bookTitle.textContent = title;
    document.title = `${title} - ゆうぞら`;
    state.readerContent.innerHTML = parsedHTML;

    // Set default activeHeadingId to the first TOC item if available
    state.activeHeadingId = (state.currentTOC && state.currentTOC.length > 0) ? state.currentTOC[0].id : null;

    // Display Reader, Hide Welcome Screen
    state.welcomeScreen.classList.add('hidden');
    state.readerScreen.classList.remove('hidden');

    // Check if there is a saved bookmark for this file
    const savedProgress = localStorage.getItem(`bookmark_${state.currentFileName}`);
    if (savedProgress) {
        state.bookmarkProgress = parseFloat(savedProgress);
    } else {
        state.bookmarkProgress = 0;
    }

    // Wait a tick for rendering to complete before restoring scroll position
    state.isReflowing = true;
    setTimeout(() => {
        restoreScrollPosition();
        updateProgress();
        
        const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
        eventBus.dispatchEvent(new YuzoraEvent("book-rendered"));
        setTimeout(() => {
            state.isReflowing = false;
        }, 50);
    }, 100);
}

function handleScroll() {
    const state = window.locator.resolve(AppState);
    if (state.isReflowing) return;
    updateProgress();
}

function updateProgress() {
    const state = window.locator.resolve(AppState);
    if (!state.readerViewport) return;

    const scrollLeft = Math.abs(state.readerViewport.scrollLeft);
    const scrollWidth = state.readerViewport.scrollWidth;
    const clientWidth = state.readerViewport.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
        state.bookmarkProgress = 0;
    } else {
        state.bookmarkProgress = scrollLeft / maxScroll;
    }

    // Progress bar percentage (0 to 100)
    const percentage = Math.min(100, Math.max(0, Math.round(state.bookmarkProgress * 100)));
    state.progressBar.style.width = `${percentage}%`;
    state.readingPercentage.textContent = `${percentage}%`;

    // Calculate pages based on viewport clientWidth
    const pageCount = Math.round(scrollWidth / clientWidth);
    const currentPage = Math.min(pageCount, Math.max(1, Math.round(scrollLeft / clientWidth) + 1));
    state.readingIndex.textContent = `${currentPage} / ${pageCount} ページ`;
}

function restoreScrollPosition() {
    const state = window.locator.resolve(AppState);
    const maxScroll = state.readerViewport.scrollWidth - state.readerViewport.clientWidth;
    if (state.config.direction === 'rtl') {
        // In vertical-rl, scrolling forward is in the negative direction.
        state.readerViewport.scrollLeft = -(state.bookmarkProgress * maxScroll);
    } else {
        // In vertical-lr, scrolling forward is in the positive direction.
        state.readerViewport.scrollLeft = state.bookmarkProgress * maxScroll;
    }
}

function restoreScrollPositionSmooth() {
    const state = window.locator.resolve(AppState);
    const maxScroll = state.readerViewport.scrollWidth - state.readerViewport.clientWidth;
    const targetScroll = state.config.direction === 'rtl' ? -(state.bookmarkProgress * maxScroll) : (state.bookmarkProgress * maxScroll);
    state.readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

function saveBookmark() {
    const state = window.locator.resolve(AppState);
    if (state.currentFileName) {
        try {
            localStorage.setItem(`bookmark_${state.currentFileName}`, state.bookmarkProgress);
        } catch (e) {
            console.warn("Failed to save bookmark position to localStorage:", e);
        }
    }
}

function nextPage() {
    const state = window.locator.resolve(AppState);
    const clientWidth = state.readerViewport.clientWidth;
    const currentScroll = Math.abs(state.readerViewport.scrollLeft);
    const pageCount = Math.round(state.readerViewport.scrollWidth / clientWidth);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage < pageCount) {
        CommandManager.execute(new NavigatePageCommand(currentPage + 1));
    }
}

function prevPage() {
    const state = window.locator.resolve(AppState);
    const clientWidth = state.readerViewport.clientWidth;
    const currentScroll = Math.abs(state.readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage > 1) {
        CommandManager.execute(new NavigatePageCommand(currentPage - 1));
    }
}

function scrollToPage(pageNumber) {
    const state = window.locator.resolve(AppState);
    const clientWidth = state.readerViewport.clientWidth;
    const targetScrollLeft = (pageNumber - 1) * clientWidth;
    
    state.isReflowing = true;
    state.readerViewport.scrollTo({
        left: state.config.direction === 'rtl' ? -targetScrollLeft : targetScrollLeft,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        state.isReflowing = false;
        // Keep progress and bar updated in real-time
        const maxScroll = state.readerViewport.scrollWidth - state.readerViewport.clientWidth;
        state.bookmarkProgress = maxScroll > 0 ? targetScrollLeft / maxScroll : 0;
        updateProgress();
        saveBookmark();
    }, 400); // Wait for transition animation to complete
}

function handleResize() {
    const state = window.locator.resolve(AppState);
    // Avoid double reflow trigger cycles
    if (state.isReflowing) return;
    
    state.isReflowing = true;
    const oldProgress = state.bookmarkProgress;
    
    // Temporarily reset columns layout width before recalculations to get accurate sizing
    state.readerContent.style.width = 'auto';
    
    setTimeout(() => {
        // Enforce column content size width constraints
        state.readerContent.style.width = 'max-content';
        
        // Restore progress coordinates on new dimensions
        const maxScroll = Math.abs(state.readerViewport.scrollWidth - state.readerViewport.clientWidth);
        if (state.config.direction === 'rtl') {
            state.readerViewport.scrollLeft = -(oldProgress * maxScroll);
        } else {
            state.readerViewport.scrollLeft = oldProgress * maxScroll;
        }
        
        state.bookmarkProgress = oldProgress;
        updateProgress();
        
        setTimeout(() => {
            state.isReflowing = false;
        }, 50);
    }, 100);
}

function checkLastSession() {
    const state = window.locator.resolve(AppState);
    const lastProgress = localStorage.getItem(`bookmark_${state.currentFileName}`);
    if (lastProgress) {
        state.bookmarkProgress = parseFloat(lastProgress);
    } else {
        state.bookmarkProgress = 0;
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

