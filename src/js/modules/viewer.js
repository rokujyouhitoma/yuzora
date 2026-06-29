/**
 * Yuzora - Book Loading, Pagination & Viewer Controller Module
 */

function handleFile(file) {
    if (!file) return;

    currentFileName = file.name;
    const reader = new FileReader();

    if (file.name.endsWith(".txt")) {
        currentFileType = "txt";
        reader.onload = function(e) {
            // Text files (Aozora Shift_JIS/UTF-8 format)
            const buffer = e.target.result;
            
            // Auto detect utf-8 vs shift-jis
            const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                const text = utf8Decoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, text, "txt"));
            } catch (err) {
                // Fallback to Shift_JIS on UTF-8 decode failure for user uploaded files
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const text = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, text, "txt"));
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
        currentFileType = "html";
        reader.onload = function(e) {
            const buffer = e.target.result;
            // Decode HTML with utf-8 first, fallback to shift-jis
            const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                const htmlText = utf8Decoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, htmlText, "html"));
            } catch (err) {
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const htmlText = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(file.name, htmlText, "html"));
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
                CommandManager.execute(new LoadBookCommand(bookData.title, text, "txt"));
            } catch (err) {
                console.warn("Shift_JIS decode failed (fatal=true), falling back to UTF-8 for predefined book", err);
                const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
                const text = sjisDecoder.decode(buffer);
                CommandManager.execute(new LoadBookCommand(bookData.title, text, "txt"));
            }
        })
        .catch(error => {
            console.error("Failed to load predefined book:", error);
            alert("推奨書籍の読み込みに失敗しました。");
        });
}

function displayBook() {
    let parsedHTML = '';
    let title = currentFileName;

    if (currentFileType === 'txt') {
        // Parse plain text with Aozora annotation
        const parsed = parseAozoraText(currentFileContent);
        parsedHTML = parsed.body;
        title = parsed.title || currentFileName.replace('.txt', '');
    } else {
        // XHTML/HTML
        const parsed = parseAozoraHTML(currentFileContent);
        parsedHTML = parsed.body;
        title = parsed.title || currentFileName.replace(/\.(x?html)/, '');
    }

    // Override with predefined book title if matched
    const predefinedBook = PREDEFINED_BOOKS.find(b => currentFileName.includes(b.cardId.toString()));
    if (predefinedBook) {
        title = predefinedBook.title;
    }

    // Apply to viewer
    bookTitle.textContent = title;
    document.title = `${title} - ゆうぞら`;
    readerContent.innerHTML = parsedHTML;

    // Set default activeHeadingId to the first TOC item if available
    activeHeadingId = (currentTOC && currentTOC.length > 0) ? currentTOC[0].id : null;

    // Display Reader, Hide Welcome Screen
    welcomeScreen.classList.add('hidden');
    readerScreen.classList.remove('hidden');

    // Check if there is a saved bookmark for this file
    const savedProgress = localStorage.getItem(`bookmark_${currentFileName}`);
    if (savedProgress) {
        bookmarkProgress = parseFloat(savedProgress);
    } else {
        bookmarkProgress = 0;
    }

    // Wait a tick for rendering to complete before restoring scroll position
    isReflowing = true;
    setTimeout(() => {
        restoreScrollPosition();
        updateProgress();
        triggerHeaderShow();
        if (typeof setupTOCObserver === "function") {
            setupTOCObserver();
        }
        setTimeout(() => {
            isReflowing = false;
        }, 50);
    }, 100);
}

function handleScroll() {
    if (isReflowing) return;
    updateProgress();
}

function updateProgress() {
    if (!readerViewport) return;

    const scrollLeft = Math.abs(readerViewport.scrollLeft);
    const scrollWidth = readerViewport.scrollWidth;
    const clientWidth = readerViewport.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
        bookmarkProgress = 0;
    } else {
        bookmarkProgress = scrollLeft / maxScroll;
    }

    // Progress bar percentage (0 to 100)
    const percentage = Math.min(100, Math.max(0, Math.round(bookmarkProgress * 100)));
    progressBar.style.width = `${percentage}%`;
    readingPercentage.textContent = `${percentage}%`;

    // Calculate pages based on viewport clientWidth
    const pageCount = Math.round(scrollWidth / clientWidth);
    const currentPage = Math.min(pageCount, Math.max(1, Math.round(scrollLeft / clientWidth) + 1));
    readingIndex.textContent = `${currentPage} / ${pageCount} ページ`;
}

function restoreScrollPosition() {
    const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
    if (config.direction === 'rtl') {
        // In vertical-rl, scrolling forward is in the negative direction.
        readerViewport.scrollLeft = -(bookmarkProgress * maxScroll);
    } else {
        // In vertical-lr, scrolling forward is in the positive direction.
        readerViewport.scrollLeft = bookmarkProgress * maxScroll;
    }
}

function restoreScrollPositionSmooth() {
    const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
    const targetScroll = config.direction === 'rtl' ? -(bookmarkProgress * maxScroll) : (bookmarkProgress * maxScroll);
    readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

function saveBookmark() {
    if (currentFileName) {
        try {
            localStorage.setItem(`bookmark_${currentFileName}`, bookmarkProgress);
        } catch (e) {
            console.warn("Failed to save bookmark position to localStorage:", e);
        }
    }
}

function nextPage() {
    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);
    const pageCount = Math.round(readerViewport.scrollWidth / clientWidth);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage < pageCount) {
        CommandManager.execute(new NavigatePageCommand(currentPage + 1));
    }
}

function prevPage() {
    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;

    if (currentPage > 1) {
        CommandManager.execute(new NavigatePageCommand(currentPage - 1));
    }
}

function scrollToPage(pageNumber) {
    const clientWidth = readerViewport.clientWidth;
    const targetScrollLeft = (pageNumber - 1) * clientWidth;
    
    isReflowing = true;
    readerViewport.scrollTo({
        left: config.direction === 'rtl' ? -targetScrollLeft : targetScrollLeft,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        isReflowing = false;
        // Keep progress and bar updated in real-time
        const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
        bookmarkProgress = maxScroll > 0 ? targetScrollLeft / maxScroll : 0;
        updateProgress();
        saveBookmark();
    }, 400); // Wait for transition animation to complete
}

function handleResize() {
    // Avoid double reflow trigger cycles
    if (isReflowing) return;
    
    isReflowing = true;
    const oldProgress = bookmarkProgress;
    
    // Temporarily reset columns layout width before recalculations to get accurate sizing
    readerContent.style.width = 'auto';
    
    setTimeout(() => {
        // Enforce column content size width constraints
        readerContent.style.width = 'max-content';
        
        // Restore progress coordinates on new dimensions
        const maxScroll = Math.abs(readerViewport.scrollWidth - readerViewport.clientWidth);
        if (config.direction === 'rtl') {
            readerViewport.scrollLeft = -(oldProgress * maxScroll);
        } else {
            readerViewport.scrollLeft = oldProgress * maxScroll;
        }
        
        bookmarkProgress = oldProgress;
        updateProgress();
        
        setTimeout(() => {
            isReflowing = false;
        }, 50);
    }, 100);
}

function checkLastSession() {
    const lastProgress = localStorage.getItem(`bookmark_${currentFileName}`);
    if (lastProgress) {
        bookmarkProgress = parseFloat(lastProgress);
    } else {
        bookmarkProgress = 0;
    }
    restoreScrollPosition();
    updateProgress();
}
