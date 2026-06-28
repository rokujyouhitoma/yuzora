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
    if (!currentFileContent) return;

    isReflowing = true;
    welcomeScreen.classList.add("hidden");
    readerScreen.classList.remove("hidden");
    bookTitle.textContent = currentFileName;

    // Render contents based on file type
    if (currentFileType === "html") {
        readerContent.innerHTML = parseAozoraHTML(currentFileContent);
    } else {
        readerContent.innerHTML = parseAozoraText(currentFileContent);
    }

    // Scroll to absolute right (beginning of text) in RTL mode
    // wait for layout reflow rendering to complete
    setTimeout(() => {
        // Setup initial pagination or restore bookmark
        checkLastSession();
        isReflowing = false;
        triggerHeaderShow();
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

    // Command History Sync (Debounced or command throttled inside CommandManager)
    CommandManager.execute(new SyncBookmarkCommand(bookmarkProgress));

    // Update progress numbers
    const currentPage = Math.round(scrollLeft / clientWidth) + 1;
    const totalPages = Math.round(scrollWidth / clientWidth);

    if (readingPercentage) {
        const percent = Math.round(bookmarkProgress * 100);
        readingPercentage.textContent = `${percent}%`;
    }
    if (readingIndex) {
        readingIndex.textContent = `${currentPage} / ${totalPages}`;
    }

    // Set interactive visual slider bar
    if (progressBar) {
        progressBar.style.width = `${bookmarkProgress * 100}%`;
    }
}

function restoreScrollPosition() {
    const scrollWidth = readerViewport.scrollWidth;
    const clientWidth = readerViewport.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = maxScroll * bookmarkProgress;

    if (config.direction === "rtl") {
        readerViewport.scrollLeft = -targetScroll;
    } else {
        readerViewport.scrollLeft = targetScroll;
    }
}

function restoreScrollPositionSmooth() {
    const scrollWidth = readerViewport.scrollWidth;
    const clientWidth = readerViewport.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = maxScroll * bookmarkProgress;

    readerViewport.scrollTo({
        left: config.direction === "rtl" ? -targetScroll : targetScroll,
        behavior: "smooth"
    });
}

function scrollToPage(targetPage) {
    const clientWidth = readerViewport.clientWidth;
    const targetScrollLeft = (targetPage - 1) * clientWidth;

    readerViewport.scrollTo({
        left: config.direction === "rtl" ? -targetScrollLeft : targetScrollLeft,
        behavior: "smooth"
    });
}

function nextPage() {
    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);
    const targetScroll = currentScroll + clientWidth;
    const maxScroll = readerViewport.scrollWidth - clientWidth;

    if (targetScroll <= maxScroll + 10) {
        readerViewport.scrollTo({
            left: config.direction === "rtl" ? -targetScroll : targetScroll,
            behavior: "smooth"
        });
    }
}

function prevPage() {
    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);
    const targetScroll = Math.max(0, currentScroll - clientWidth);

    readerViewport.scrollTo({
        left: config.direction === "rtl" ? -targetScroll : targetScroll,
        behavior: "smooth"
    });
}

function handleResize() {
    if (!currentFileName) return;

    isReflowing = true;
    // Keep relative reading percentage location on viewport size changes
    const previousPercentage = bookmarkProgress;

    setTimeout(() => {
        bookmarkProgress = previousPercentage;
        restoreScrollPosition();
        isReflowing = false;
        updateProgress();
    }, 100);
}

function saveBookmark() {
    if (!currentFileName) return;
    try {
        localStorage.setItem(`bookmark_${currentFileName}`, bookmarkProgress.toString());
    } catch (e) {
        console.warn("Failed to save bookmark index to localStorage:", e);
    }
}

function checkLastSession() {
    if (!currentFileName) return;

    const savedProgress = localStorage.getItem(`bookmark_${currentFileName}`);
    if (savedProgress) {
        bookmarkProgress = parseFloat(savedProgress);
        restoreScrollPosition();
    } else {
        bookmarkProgress = 0;
        if (config.direction === "rtl") {
            readerViewport.scrollLeft = 0;
        } else {
            readerViewport.scrollLeft = 0;
        }
    }
    updateProgress();
}
