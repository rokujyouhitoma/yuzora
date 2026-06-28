/**
 * Yuzora - User Interface, Event Handlers & Settings Controller Module
 */

function updateSettingsUI(key, value) {
    if (key === "theme") {
        document.body.className = `theme-${value}`;
    } else if (key === "font") {
        readerContent.className = "reader-content";
        readerContent.classList.add(value, `direction-${config.direction}`, config.size, config.lh, config.spacing);
    } else if (key === "direction") {
        applySettings(); // Changing writing directions changes multi columns configurations entirely
    } else if (key === "size" || key === "lh" || key === "spacing") {
        readerContent.className = "reader-content";
        readerContent.classList.add(config.font, `direction-${config.direction}`, config.size, config.lh, config.spacing);
        handleResize(); // Trigger bounds recalibration on font sizing metrics updates
    }
}

function closeDebugModal() {
    debugModal.classList.add("hidden");
    debugModalOverlay.classList.add("hidden");
    triggerHeaderShow();
}

function handleProgressScrub(clientX) {
    const rect = progressBarContainer.getBoundingClientRect();
    const width = rect.width;
    const clickX = Math.max(0, Math.min(width, clientX - rect.left));
    const targetProgress = clickX / width;

    bookmarkProgress = targetProgress;
    restoreScrollPositionSmooth();
    updateProgress();
}

function setupEventListeners() {
    // Drop Zone Events
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // File Input Events
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Navigation Events
    btnBack.addEventListener("click", () => {
        // Go back in command history or return to welcome screen
        welcomeScreen.classList.remove("hidden");
        readerScreen.classList.add("hidden");
        // Clear local storage for current reading session name to allow reset
        localStorage.removeItem("last_read_file_name");
        localStorage.removeItem("last_read_file_content");
        localStorage.removeItem("last_read_file_type");
        currentFileName = "";
        currentFileContent = "";
        currentFileType = "";
    });

    // Scroll Events on viewport
    let scrollTimeout;
    readerViewport.addEventListener("scroll", () => {
        handleScroll();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollDebounced, 150);
    });

    // Window Resize Events
    window.addEventListener("resize", handleResize);

    // Keyboard Shortcuts
    // eslint-disable-next-line complexity
    document.addEventListener("keydown", (e) => {
        if (readerScreen.classList.contains("hidden")) return;
        
        // Modal Keyboard Navigation Tab Focus traps
        const isModalOpen = debugModal && !debugModal.classList.contains("hidden");
        if (isModalOpen) {
            if (e.key === "Tab") {
                handleDebugTabKeys(e);
                return;
            }
            if (e.key === "Escape") {
                closeDebugModal();
                e.preventDefault();
                return;
            }
        }

        // Close setting modal using ESC key
        if (e.key === "Escape") {
            if (settingsDrawer.classList.contains("open")) closeSettings();
            if (tocDrawer.classList.contains("open")) closeTOC();
            return;
        }

        // Keyboard shortcuts to trigger debug dashboard / commands
        handleDebugKeyboardShortcuts(e);

        // Key controls for scrolling/pages flipping (only when debug modal is NOT open)
        if (!isModalOpen) {
            if (config.direction === "rtl") {
                if (e.key === "ArrowLeft") nextPage();
                if (e.key === "ArrowRight") prevPage();
            } else {
                if (e.key === "ArrowLeft") prevPage();
                if (e.key === "ArrowRight") nextPage();
            }
        }
    });

    // Tap/Click controls inside reader screen to toggle menu overlay controls
    readerViewport.addEventListener("click", toggleControls);

    // Overlay Progress Bar Click/Scrub Seek Event
    let isDraggingProgressBar = false;
    progressBarContainer.addEventListener("mousedown", (e) => {
        isDraggingProgressBar = true;
        handleProgressScrub(e.clientX);
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDraggingProgressBar) return;
        handleProgressScrub(e.clientX);
    });

    document.addEventListener("mouseup", () => {
        isDraggingProgressBar = false;
    });

    // Drag scrub support for mobile touch events
    progressBarContainer.addEventListener("touchstart", (e) => {
        isDraggingProgressBar = true;
        handleProgressScrub(e.touches[0].clientX);
    });

    document.addEventListener("touchmove", (e) => {
        if (!isDraggingProgressBar) return;
        handleProgressScrub(e.touches[0].clientX);
    });

    document.addEventListener("touchend", () => {
        isDraggingProgressBar = false;
    });
}

let scrollVelocity = 0;
let lastScrollLeft = 0;
let lastScrollTime = 0;

function handleScrollDebounced() {
    if (isReflowing) return;
    snapScrollPosition();
}

function snapScrollPosition() {
    if (isReflowing) return;

    const scrollLeft = Math.abs(readerViewport.scrollLeft);
    const clientWidth = readerViewport.clientWidth;

    // Calculate nearest page boundary offset index matching grid sizes
    const pageIndex = Math.round(scrollLeft / clientWidth);
    const targetScrollLeft = pageIndex * clientWidth;

    // Apply magnetic scrolling alignment snaps
    if (Math.abs(scrollLeft - targetScrollLeft) > 5) {
        readerViewport.scrollTo({
            left: config.direction === "rtl" ? -targetScrollLeft : targetScrollLeft,
            behavior: "smooth"
        });
    }
}

function handleDebugTabKeys(e) {
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = debugModal.querySelectorAll(focusableElementsString);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
        }
    }
}

// eslint-disable-next-line complexity
function handleDebugKeyboardShortcuts(e) {
    // Prevent key events from triggering while typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
    }

    const isModalOpen = debugModal && !debugModal.classList.contains("hidden");

    // Toggle debug modal with 'd' or 'D'
    if (e.key === "d" || e.key === "D") {
        if (isModalOpen) {
            closeDebugModal();
        } else {
            if (btnOpenDebug) btnOpenDebug.click();
        }
        e.preventDefault();
        return;
    }

    // Ctrl+Z / Ctrl+Y operation undos
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        CommandManager.undo();
    }
    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        CommandManager.redo();
    }

    // Tab key selection inside modal using keyboard numbers 1 or 2
    if (isModalOpen) {
        if (e.key === '1') {
            if (tabBtnMonitor) tabBtnMonitor.click();
        } else if (e.key === '2') {
            if (tabBtnDiagnose) tabBtnDiagnose.click();
        }
    }
}

// eslint-disable-next-line complexity
function setupDrawerControls() {
    // Drawer overlay backdrops click handlers
    drawerOverlay.addEventListener("click", () => {
        closeSettings();
        closeTOC();
    });

    // TOC buttons events
    btnTOC.addEventListener("click", openTOC);
    btnCloseTOC.addEventListener("click", closeTOC);

    // Settings drawer control hooks
    btnSettings.addEventListener("click", openSettings);
    btnCloseSettings.addEventListener("click", closeSettings);

    // Page overlays clicking triggers (RTL direction mapping)
    pageNavLeft.addEventListener("click", (e) => {
        e.stopPropagation();
        if (config.direction === "rtl") {
            nextPage();
        } else {
            prevPage();
        }
    });

    pageNavRight.addEventListener("click", (e) => {
        e.stopPropagation();
        if (config.direction === "rtl") {
            prevPage();
        } else {
            nextPage();
        }
    });

    // Bind setting selector button groups
    setupButtonGroup(".theme-selector button", "theme", (val) => {
        CommandManager.execute(new UpdateConfigCommand("theme", val));
    });
    setupButtonGroup(".font-selector button", "font", (val) => {
        CommandManager.execute(new UpdateConfigCommand("font", val));
    });
    setupButtonGroup(".direction-selector button", "direction", (val) => {
        CommandManager.execute(new UpdateConfigCommand("direction", val));
    });
    setupButtonGroup(".size-selector button", "size", (val) => {
        CommandManager.execute(new UpdateConfigCommand("size", val));
    });
    setupButtonGroup(".lh-selector button", "lh", (val) => {
        CommandManager.execute(new UpdateConfigCommand("lh", val));
    });
    setupButtonGroup(".spacing-selector button", "spacing", (val) => {
        CommandManager.execute(new UpdateConfigCommand("spacing", val));
    });

    // Header Home icon control
    if (btnFirstPage) {
        btnFirstPage.addEventListener("click", () => {
            CommandManager.execute(new NavigatePageCommand(1));
            closeSettings();
            closeTOC();
        });
    }

    // Modal Close Button hooks
    if (btnCloseDebug) {
        btnCloseDebug.addEventListener("click", closeDebugModal);
    }
    if (debugModalOverlay) {
        debugModalOverlay.addEventListener("click", closeDebugModal);
    }
    if (btnOpenDebug) {
        btnOpenDebug.addEventListener("click", () => {
            debugModal.classList.remove("hidden");
            debugModalOverlay.classList.remove("hidden");
            CommandManager.updateDebugMonitor();
        });
    }

    // Settings/cache purge tools
    if (btnClearBookmarks) {
        btnClearBookmarks.addEventListener("click", () => {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith("bookmark_")) keys.push(key);
            }
            keys.forEach(k => localStorage.removeItem(k));
            alert("すべてのしおりを消去しました。");
            checkLastSession();
        });
    }

    if (btnClearConfig) {
        btnClearConfig.addEventListener("click", () => {
            localStorage.removeItem("yuzora_config");
            alert("表示設定を初期化しました。");
            window.location.reload();
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener("click", () => {
            localStorage.clear();
            alert("すべてのキャッシュデータをリセットしました。");
            window.location.reload();
        });
    }

    // Diagnostics layout analyzer hooks
    if (btnDiagnoseLayout) {
        btnDiagnoseLayout.addEventListener("click", runLayoutDiagnosis);
    }

    if (btnCopyDebugReport) {
        btnCopyDebugReport.addEventListener("click", () => {
            if (diagnoseReportOutput) {
                diagnoseReportOutput.select();
                navigator.clipboard.writeText(diagnoseReportOutput.value)
                    .then(() => alert("診断レポートをクリップボードにコピーしました。"))
                    .catch(() => alert("コピーに失敗しました。"));
            }
        });
    }

    // Operations History Export/Import controls
    if (btnExportHistory) {
        btnExportHistory.addEventListener("click", () => {
            if (debugHistoryJSON) {
                const exported = CommandManager.exportJSON();
                debugHistoryJSON.value = exported;
                navigator.clipboard.writeText(exported)
                    .then(() => alert("操作履歴JSONをコピーし、出力エリアに表示しました。"))
                    .catch(() => alert("コピーに失敗しました。"));
            }
        });
    }

    if (btnImportHistory) {
        btnImportHistory.addEventListener("click", () => {
            if (debugHistoryJSON) {
                const data = debugHistoryJSON.value.trim();
                if (data) {
                    CommandManager.importJSON(data);
                } else {
                    alert("インポート用のJSONデータをテキストエリアに入力してください。");
                }
            }
        });
    }

    // Diagnostics Modal tabs selectors
    if (tabBtnMonitor && tabBtnDiagnose) {
        tabBtnMonitor.addEventListener("click", () => {
            tabBtnMonitor.classList.add("active");
            tabBtnDiagnose.classList.remove("active");
            tabContentMonitor.classList.add("active");
            tabContentDiagnose.classList.remove("active");
        });

        tabBtnDiagnose.addEventListener("click", () => {
            tabBtnDiagnose.classList.add("active");
            tabBtnMonitor.classList.remove("active");
            tabContentDiagnose.classList.add("active");
            tabContentMonitor.classList.remove("active");
            runLayoutDiagnosis(); // Auto analyze layout when switching tab
        });
    }
}

function setupButtonGroup(selector, configKey, callback) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const val = btn.getAttribute(`data-${configKey}`);
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            callback(val);
        });
    });
}

function saveSettings() {
    try {
        localStorage.setItem("yuzora_config", JSON.stringify(config));
    } catch (e) {
        console.warn("Failed to save configuration settings to localStorage:", e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem("yuzora_config");
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                config[key] = parsed[key];
            });
        }
    } catch (e) {
        console.warn("Failed to load configuration settings from localStorage:", e);
    }
}

function applySettings() {
    document.body.className = `theme-${config.theme}`;

    if (!readerContent || !readerViewport) return;

    readerViewport.style.direction = config.direction;

    readerContent.className = "reader-content";
    readerContent.classList.add(config.font, `direction-${config.direction}`, config.size, config.lh, config.spacing);

    // Update navigation overlays page titles based on direction
    if (config.direction === "rtl") {
        pageNavLeft.title = "次のページへ";
        pageNavRight.title = "前のページへ";
    } else {
        pageNavLeft.title = "前のページへ";
        pageNavRight.title = "次のページへ";
    }

    // Update first page button chevron icon direction
    const btnFirstPagePath = btnFirstPage ? btnFirstPage.querySelector("path") : null;
    if (btnFirstPagePath) {
        if (config.direction === "rtl") {
            btnFirstPagePath.setAttribute("d", "M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5");
        } else {
            btnFirstPagePath.setAttribute("d", "M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5");
        }
    }

    // Update Button States in Drawer UI
    syncButtonState(".theme-selector button", "theme", config.theme);
    syncButtonState(".font-selector button", "font", config.font);
    syncButtonState(".direction-selector button", "direction", config.direction);
    syncButtonState(".size-selector button", "size", config.size);
    syncButtonState(".lh-selector button", "lh", config.lh);
    syncButtonState(".spacing-selector button", "spacing", config.spacing);
}

function syncButtonState(selector, attrName, value) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(btn => {
        if (btn.getAttribute(`data-${attrName}`) === value) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function openSettings() {
    settingsDrawer.classList.add("open");
    drawerOverlay.classList.add("open");
}

function closeSettings() {
    settingsDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    triggerHeaderShow();
}

function openTOC() {
    tocDrawer.classList.add("open");
    drawerOverlay.classList.add("open");
    buildTOCList();
}

function closeTOC() {
    tocDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    triggerHeaderShow();
}

function buildTOCList() {
    tocList.innerHTML = "";
    if (currentTOC.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "toc-item";
        emptyMsg.style.cursor = "default";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.textContent = "目次情報はありません。";
        tocList.appendChild(emptyMsg);
        return;
    }

    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);

    currentTOC.forEach((item) => {
        const element = document.getElementById(item.id);
        let isActive = false;
        if (element) {
            const rect = element.getBoundingClientRect();
            const containerRect = readerViewport.getBoundingClientRect();
            
            let pageIndex = 0;
            if (config.direction === "rtl") {
                const absolutePosition = (containerRect.right - rect.right) + Math.abs(readerViewport.scrollLeft);
                pageIndex = Math.floor(absolutePosition / clientWidth);
            } else {
                const absolutePosition = (rect.left - containerRect.left) + readerViewport.scrollLeft;
                pageIndex = Math.floor(absolutePosition / clientWidth);
            }
            const currentScrollPage = Math.round(currentScroll / clientWidth);
            if (pageIndex === currentScrollPage) {
                isActive = true;
            }
        }

        const itemDiv = document.createElement("div");
        itemDiv.className = `toc-item toc-item-level-${item.level}${isActive ? " active" : ""}`;
        itemDiv.textContent = item.text;
        itemDiv.addEventListener("click", () => {
            jumpToHeading(item.id);
            closeTOC();
        });
        tocList.appendChild(itemDiv);
    });
}

function jumpToHeading(headingId) {
    const targetElement = document.getElementById(headingId);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const containerRect = readerViewport.getBoundingClientRect();
    const viewportWidth = readerViewport.clientWidth;

    let pageIndex = 0;
    if (config.direction === "rtl") {
        const absoluteRight = (containerRect.right - rect.right) + Math.abs(readerViewport.scrollLeft);
        const absoluteLeft = (containerRect.right - rect.left) + Math.abs(readerViewport.scrollLeft);
        const absoluteCenter = (absoluteRight + absoluteLeft) / 2;
        pageIndex = Math.floor(absoluteCenter / viewportWidth);
    } else {
        const absoluteLeft = (rect.left - containerRect.left) + readerViewport.scrollLeft;
        const absoluteRight = (rect.right - containerRect.left) + readerViewport.scrollLeft;
        const absoluteCenter = (absoluteLeft + absoluteRight) / 2;
        pageIndex = Math.floor(absoluteCenter / viewportWidth);
    }

    // Execute scroll via CommandManager
    CommandManager.execute(new NavigatePageCommand(pageIndex + 1));

    // Focus the target element after smooth scroll completes to prevent layout jump or scroll interruption
    setTimeout(() => {
        targetElement.setAttribute("tabindex", "-1");
        targetElement.focus({ preventScroll: true });
    }, 400);
}

function hideControls() {
    if (!settingsDrawer.classList.contains("open") && !tocDrawer.classList.contains("open")) {
        readerHeader.classList.add("hidden");
        if (readerFooter) {
            readerFooter.classList.add("hidden");
        }
    }
}

function triggerHeaderShow() {
    readerHeader.classList.remove("hidden");
    if (readerFooter) {
        readerFooter.classList.remove("hidden");
    }
    
    clearTimeout(headerTimeout);
    headerTimeout = setTimeout(() => {
        hideControls();
    }, 3000); // Hide after 3 seconds of inactivity
}

function toggleControls(e) {
    // Prevent toggle if clicking interactive elements inside reader viewport
    if (e && e.type === "click" && (e.target.closest("a") || e.target.closest("ruby") || e.target.closest("button"))) {
        return;
    }

    if (readerHeader.classList.contains("hidden")) {
        triggerHeaderShow();
    } else {
        clearTimeout(headerTimeout);
        hideControls();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeDOMElements();

    // Setup predefined books grids on start welcome screen
    if (developerBooksGrid) {
        developerBooksGrid.innerHTML = "";
        PREDEFINED_BOOKS.filter(b => b.category === "developer").forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";
            card.setAttribute("data-book-id", book.id);
            card.innerHTML = `
                <div class="book-card-title">${book.shortTitle}</div>
                <div class="book-card-author">${book.author}</div>
            `;
            card.addEventListener("click", () => {
                loadPredefinedBook(book.id);
            });
            developerBooksGrid.appendChild(card);
        });
    }

    if (readerBooksGrid) {
        readerBooksGrid.innerHTML = "";
        PREDEFINED_BOOKS.filter(b => b.category === "reader").forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";
            card.setAttribute("data-book-id", book.id);
            card.innerHTML = `
                <div class="book-card-title">${book.shortTitle}</div>
                <div class="book-card-author">${book.author}</div>
            `;
            card.addEventListener("click", () => {
                loadPredefinedBook(book.id);
            });
            readerBooksGrid.appendChild(card);
        });
    }

    // Load Settings
    loadSettings();
    applySettings();

    // Bind Event Listeners
    setupEventListeners();
    setupDrawerControls();

    // Check last session for auto-restore
    const lastName = localStorage.getItem("last_read_file_name");
    const lastContent = localStorage.getItem("last_read_file_content");
    const lastType = localStorage.getItem("last_read_file_type");

    if (lastName && lastContent) {
        currentFileName = lastName;
        currentFileContent = lastContent;
        currentFileType = lastType || "txt";
        displayBook();
    }

    // Expose core functions for testing/debugging
    window.Yuzora = {
        parseAozoraText,
        parseAozoraHTML,
        formatAozoraMarkup,
        config,
        runLayoutDiagnosis,
        getCurrentTOC: () => currentTOC,
        CommandManager,
        LoadBookCommand,
        NavigatePageCommand,
        UpdateConfigCommand,
        SyncBookmarkCommand
    };
});
