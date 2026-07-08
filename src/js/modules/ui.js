/**
 * Yuzora - User Interface, Event Handlers & Settings Controller Module
 */
"use strict";

function updateSettingsUI(key, value) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    if (key === "theme") {
        document.body.className = `theme-${value}`;
    } else if (key === "font") {
        viewContext.readerContent.className = "reader-content";
        viewContext.readerContent.classList.add(value, `direction-${configModel.direction}`, configModel.size, configModel.lh, configModel.spacing);
    } else if (key === "direction") {
        applySettings(); // Changing writing directions changes multi columns configurations entirely
    } else if (key === "size" || key === "lh" || key === "spacing") {
        viewContext.readerContent.className = "reader-content";
        viewContext.readerContent.classList.add(configModel.font, `direction-${configModel.direction}`, configModel.size, configModel.lh, configModel.spacing);
        handleResize(); // Trigger bounds recalibration on font sizing metrics updates
    }
}

function closeDebugModal() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.debugModal.classList.add("hidden");
    viewContext.debugModalOverlay.classList.add("hidden");
    triggerHeaderShow();
}

function openDebugModal() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.debugModal && viewContext.debugModalOverlay) {
        viewContext.debugModal.classList.remove("hidden");
        viewContext.debugModalOverlay.classList.remove("hidden");
        CommandManager.updateDebugMonitor();
    }
}

function handleProgressScrub(clientX) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const rect = viewContext.progressBarContainer.getBoundingClientRect();
    const width = rect.width;
    const clickX = Math.max(0, Math.min(width, clientX - rect.left));
    const targetProgress = clickX / width;

    bookmarkModel.bookmarkProgress = targetProgress;
    restoreScrollPositionSmooth();
    updateProgress();
}

/** @type {!Array<{element: (!Element|!Window|!Document), type: string, handler: !Function, options: (AddEventListenerOptions|boolean|undefined)}>} */
let welcomeListeners = [];
/** @type {!Array<{element: (!Element|!Window|!Document), type: string, handler: !Function, options: (AddEventListenerOptions|boolean|undefined)}>} */
let readerListeners = [];

/** @type {?EventListener} */
let readerResizeHandler = null;
/** @type {?EventListener} */
let readerKeydownHandler = null;

/**
 * Helper to add and track welcome event listeners.
 * @param {Element|Window|Document|null} element
 * @param {string} type
 * @param {!Function} handler
 * @param {(AddEventListenerOptions|boolean|undefined)=} options
 * @private
 */
function bindWelcomeEvent_(element, type, handler, options) {
    if (element) {
        const opt = (options === undefined) ? undefined : (options || undefined);
        element.addEventListener(type, /** @type {!EventListener} */ (handler), opt);
        welcomeListeners.push({ element: /** @type {!Element|!Window|!Document} */ (element), type, handler, options: opt });
    }
}

/**
 * Helper to add and track reader event listeners.
 * @param {Element|Window|Document|null} element
 * @param {string} type
 * @param {!Function} handler
 * @param {(AddEventListenerOptions|boolean|undefined)=} options
 * @private
 */
function bindReaderEvent_(element, type, handler, options) {
    if (element) {
        const opt = (options === undefined) ? undefined : (options || undefined);
        element.addEventListener(type, /** @type {!EventListener} */ (handler), opt);
        readerListeners.push({ element: /** @type {!Element|!Window|!Document} */ (element), type, handler, options: opt });
    }
}

function setupPredefinedBooksGrids() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const sceneDirector = /** @type {!SceneDirectorInterface} */ (Yuzora.locator.resolve(SceneDirector));

    // Helper to generate skeleton cards
    const createSkeletons = (container) => {
        if (!container) return;
        container.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            const skeleton = document.createElement("div");
            skeleton.className = "book-card-skeleton";
            skeleton.innerHTML = `
                <div class="skeleton-title-vertical"></div>
                <div class="skeleton-meta-horizontal"></div>
            `;
            container.appendChild(skeleton);
        }
    };

    // Defer grid initialization using requestAnimationFrame + setTimeout (Lazy render)
    const defer = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : (/** @type {function():void} */ cb) => setTimeout(cb, 16);
    defer(() => {
        setTimeout(() => {
            // Safety guard: only render if we are still on the welcome screen
            if (sceneDirector.currentSceneName !== "welcome") return;

            // Render skeleton loaders initially
            createSkeletons(viewContext.developerBooksGrid);
            createSkeletons(viewContext.readerBooksGrid);

            // Asynchronously replace skeletons with actual book cards after 600ms delay
            setTimeout(() => {
                // Safety guard: only render if we are still on the welcome screen
                if (sceneDirector.currentSceneName !== "welcome") return;

                if (viewContext.developerBooksGrid) {
                    viewContext.developerBooksGrid.innerHTML = "";
                    PREDEFINED_BOOKS.filter(b => b.category === "developer").forEach(book => {
                        const card = document.createElement("div");
                        card.className = "book-card fade-in";
                        card.setAttribute("data-book-id", book.id);
                        card.innerHTML = `
                            <div class="book-card-title">${book.shortTitle}</div>
                            <div class="book-card-author">${book.author}</div>
                        `;
                        const onClick = () => {
                            window.location.hash = "#/reader?book=" + book.id;
                        };
                        bindWelcomeEvent_(card, "click", onClick);
                        viewContext.developerBooksGrid.appendChild(card);
                    });
                }

                if (viewContext.readerBooksGrid) {
                    viewContext.readerBooksGrid.innerHTML = "";
                    PREDEFINED_BOOKS.filter(b => b.category === "reader").forEach(book => {
                        const card = document.createElement("div");
                        card.className = "book-card fade-in";
                        card.setAttribute("data-book-id", book.id);
                        card.innerHTML = `
                            <div class="book-card-title">${book.shortTitle}</div>
                            <div class="book-card-author">${book.author}</div>
                        `;
                        const onClick = () => {
                            window.location.hash = "#/reader?book=" + book.id;
                        };
                        bindWelcomeEvent_(card, "click", onClick);
                        viewContext.readerBooksGrid.appendChild(card);
                    });
                }
            }, 600);
        }, 0);
    });
}

function setupWelcomeEvents() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));

    // Drop Zone Events
    const onDragOver = (e) => {
        e.preventDefault();
        viewContext.dropZone.classList.add("dragover");
    };
    const onDragLeave = () => {
        viewContext.dropZone.classList.remove("dragover");
    };
    const onDrop = (e) => {
        e.preventDefault();
        viewContext.dropZone.classList.remove("dragover");
        const dragEvent = /** @type {!DragEvent} */ (e);
        const file = dragEvent.dataTransfer.files[0];
        handleFile(file);
    };

    bindWelcomeEvent_(viewContext.dropZone, "dragover", onDragOver);
    bindWelcomeEvent_(viewContext.dropZone, "dragleave", onDragLeave);
    bindWelcomeEvent_(viewContext.dropZone, "drop", onDrop);

    // File Input Events
    const onFileInputChange = (e) => {
        const inputElement = /** @type {!HTMLInputElement} */ (e.target);
        const file = inputElement.files[0];
        handleFile(file);
    };
    bindWelcomeEvent_(viewContext.fileInput, "change", onFileInputChange);

    // Setup predefined books grids on start welcome screen
    setupPredefinedBooksGrids();
}

function cleanupWelcomeEvents() {
    welcomeListeners.forEach(({ element, type, handler, options }) => {
        const opt = (options === undefined) ? undefined : (options || undefined);
        element.removeEventListener(type, /** @type {!EventListener} */ (handler), opt);
    });
    welcomeListeners = [];
}

function setupReaderEvents() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));

    // Navigation Events
    const onBackClick = () => {
        CommandManager.execute(new ExitReaderCommand());
    };
    bindReaderEvent_(viewContext.btnBack, "click", onBackClick);

    // Scroll Events on viewport
    let scrollTimeout;
    const onViewportScroll = () => {
        handleScroll();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollDebounced, 150);
    };
    bindReaderEvent_(viewContext.readerViewport, "scroll", onViewportScroll);

    // Tap/Click to toggle Controls (header/footer)
    bindReaderEvent_(viewContext.readerViewport, "click", toggleControls);

    // Window Resize Events
    readerResizeHandler = /** @type {!EventListener} */ (handleResize);
    window.addEventListener("resize", readerResizeHandler);

    // Keyboard Shortcuts
    // eslint-disable-next-line complexity
    readerKeydownHandler = /** @type {!EventListener} */ ((e) => {
        const keyEvent = /** @type {!KeyboardEvent} */ (e);
        if (viewContext.readerScreen.classList.contains("hidden")) return;
        
        // Modal Keyboard Navigation Tab Focus traps
        const isModalOpen = viewContext.debugModal && !viewContext.debugModal.classList.contains("hidden");
        if (isModalOpen) {
            if (keyEvent.key === "Tab") {
                handleDebugTabKeys(keyEvent);
                return;
            }
            if (keyEvent.key === "Escape") {
                CommandManager.execute(new ToggleDebugModalCommand(false));
                return;
            }
        }

        // Keyboard shortcuts to trigger debug dashboard / commands
        handleDebugKeyboardShortcuts(keyEvent);

        // Key controls for scrolling/pages flipping (only when debug modal is NOT open)
        if (!isModalOpen) {
            if (configModel.direction === "rtl") {
                if (keyEvent.key === "ArrowLeft") nextPage();
                if (keyEvent.key === "ArrowRight") prevPage();
            } else {
                if (keyEvent.key === "ArrowLeft") prevPage();
                if (keyEvent.key === "ArrowRight") nextPage();
            }
            if (keyEvent.key === "ArrowUp" || keyEvent.key === "ArrowDown") {
                toggleControls(keyEvent);
                keyEvent.preventDefault();
            }
        }
    });
    document.addEventListener("keydown", readerKeydownHandler);

    // Touch Navigation / Swipe Gestures on viewport
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e) => {
        const touchEvent = /** @type {!TouchEvent} */ (e);
        if (touchEvent.touches.length === 1) {
            touchStartX = touchEvent.touches[0].clientX;
            touchStartY = touchEvent.touches[0].clientY;
        }
    };
    bindReaderEvent_(viewContext.readerViewport, "touchstart", onTouchStart, { passive: true });

    const onTouchEnd = (e) => {
        const touchEvent = /** @type {!TouchEvent} */ (e);
        if (touchEvent.changedTouches.length === 1) {
            const touchEndX = touchEvent.changedTouches[0].clientX;
            const touchEndY = touchEvent.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Check if horizontal swipe distance is over 50px and is dominant
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (configModel.direction === "rtl") {
                    if (deltaX > 0) {
                        nextPage();
                    } else {
                        prevPage();
                    }
                } else {
                    if (deltaX > 0) {
                        prevPage();
                    } else {
                        nextPage();
                    }
                }
            }
        }
    };
    bindReaderEvent_(viewContext.readerViewport, "touchend", onTouchEnd);

    // Progress scrub bar interactions
    let isScrubbing = false;

    const onProgressBarMouseDown = (e) => {
        const mouseEvent = /** @type {!MouseEvent} */ (e);
        isScrubbing = true;
        handleProgressScrub(mouseEvent.clientX);
    };
    bindReaderEvent_(viewContext.progressBarContainer, "mousedown", onProgressBarMouseDown);

    const onDocumentMouseMove = (e) => {
        if (!isScrubbing) return;
        const mouseEvent = /** @type {!MouseEvent} */ (e);
        handleProgressScrub(mouseEvent.clientX);
    };
    bindReaderEvent_(document, "mousemove", onDocumentMouseMove);

    const onDocumentMouseUp = () => {
        if (isScrubbing) {
            isScrubbing = false;
            saveBookmark();
        }
    };
    bindReaderEvent_(document, "mouseup", onDocumentMouseUp);

    const onProgressBarTouchStart = (e) => {
        const touchEvent = /** @type {!TouchEvent} */ (e);
        isScrubbing = true;
        handleProgressScrub(touchEvent.touches[0].clientX);
    };
    bindReaderEvent_(viewContext.progressBarContainer, "touchstart", onProgressBarTouchStart, { passive: true });

    const onProgressBarTouchMove = (e) => {
        if (!isScrubbing) return;
        const touchEvent = /** @type {!TouchEvent} */ (e);
        handleProgressScrub(touchEvent.touches[0].clientX);
    };
    bindReaderEvent_(viewContext.progressBarContainer, "touchmove", onProgressBarTouchMove, { passive: true });

    const onProgressBarTouchEnd = () => {
        if (isScrubbing) {
            isScrubbing = false;
            saveBookmark();
        }
    };
    bindReaderEvent_(viewContext.progressBarContainer, "touchend", onProgressBarTouchEnd, { passive: true });

    // Setup drawers
    setupDrawerControls();
}

function cleanupReaderEvents() {
    readerListeners.forEach(({ element, type, handler, options }) => {
        const opt = (options === undefined) ? undefined : (options || undefined);
        element.removeEventListener(type, /** @type {!EventListener} */ (handler), opt);
    });
    readerListeners = [];

    if (readerResizeHandler) {
        window.removeEventListener("resize", readerResizeHandler);
        readerResizeHandler = null;
    }
    if (readerKeydownHandler) {
        document.removeEventListener("keydown", readerKeydownHandler);
        readerKeydownHandler = null;
    }

    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.tocObserver) {
        viewContext.tocObserver.disconnect();
        viewContext.tocObserver = null;
    }
}

function handleScrollDebounced() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.isReflowing) return;
    snapScrollPosition();
}

function snapScrollPosition() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    if (viewContext.isReflowing) return;

    const scrollLeft = Math.abs(viewContext.readerViewport.scrollLeft);
    const clientWidth = viewContext.readerViewport.clientWidth;

    // Calculate nearest page boundary offset index matching grid sizes
    const pageIndex = Math.round(scrollLeft / clientWidth);
    const targetScrollLeft = pageIndex * clientWidth;

    // Apply magnetic scrolling alignment snaps
    if (Math.abs(scrollLeft - targetScrollLeft) > 5) {
        viewContext.readerViewport.scrollTo({
            left: configModel.direction === "rtl" ? -targetScrollLeft : targetScrollLeft,
            behavior: "smooth"
        });
    }
}

function handleDebugTabKeys(e) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = viewContext.debugModal.querySelectorAll(focusableElementsString);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            /** @type {!HTMLElement} */ (lastFocusable).focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            /** @type {!HTMLElement} */ (firstFocusable).focus();
            e.preventDefault();
        }
    }
}

function isTypingInInput_(e) {
    return e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
}

function handleToggleDebugKey_(e, isModalOpen, viewContext) {
    if (e.key !== "d" && e.key !== "D") return;
    if (isModalOpen) {
        closeDebugModal();
    } else {
        if (viewContext.btnOpenDebug) viewContext.btnOpenDebug.click();
    }
    e.preventDefault();
}

function handleUndoRedoKeys_(e) {
    if (!e.ctrlKey) return;
    if (e.key === "z") {
        e.preventDefault();
        CommandManager.undo();
    } else if (e.key === "y") {
        e.preventDefault();
        CommandManager.redo();
    }
}

function handleModalOpenKeys_(e, viewContext) {
    if (e.key === '1') {
        if (viewContext.tabBtnMonitor) viewContext.tabBtnMonitor.click();
    } else if (e.key === '2') {
        if (viewContext.tabBtnDiagnose) viewContext.tabBtnDiagnose.click();
    }
}

function handleDebugKeyboardShortcuts(e) {
    if (isTypingInInput_(e)) return;

    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const isModalOpen = /** @type {boolean} */ (!!(viewContext.debugModal && !viewContext.debugModal.classList.contains("hidden")));

    handleToggleDebugKey_(e, isModalOpen, viewContext);
    handleUndoRedoKeys_(e);

    if (isModalOpen) {
        handleModalOpenKeys_(e, viewContext);
    }
}

function setupDrawerOverlayAndToggles_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    bindReaderEvent_(viewContext.drawerOverlay, "click", () => {
        if (viewContext.settingsDrawer.classList.contains("open")) {
            CommandManager.execute(new ToggleDrawerCommand("settings", false));
        }
        if (viewContext.tocDrawer.classList.contains("open")) {
            CommandManager.execute(new ToggleDrawerCommand("toc", false));
        }
    });

    bindReaderEvent_(viewContext.btnTOC, "click", () => {
        CommandManager.execute(new ToggleDrawerCommand("toc", true));
    });
    bindReaderEvent_(viewContext.btnCloseTOC, "click", () => {
        CommandManager.execute(new ToggleDrawerCommand("toc", false));
    });

    bindReaderEvent_(viewContext.btnSettings, "click", () => {
        CommandManager.execute(new ToggleDrawerCommand("settings", true));
    });
    bindReaderEvent_(viewContext.btnCloseSettings, "click", () => {
        CommandManager.execute(new ToggleDrawerCommand("settings", false));
    });
}

function setupPageNavigationOverlays_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));

    bindReaderEvent_(viewContext.pageNavLeft, "click", (e) => {
        e.stopPropagation();
        if (configModel.direction === "rtl") {
            nextPage();
        } else {
            prevPage();
        }
    });

    bindReaderEvent_(viewContext.pageNavRight, "click", (e) => {
        e.stopPropagation();
        if (configModel.direction === "rtl") {
            prevPage();
        } else {
            nextPage();
        }
    });

    if (viewContext.btnFirstPage) {
        bindReaderEvent_(viewContext.btnFirstPage, "click", () => {
            CommandManager.execute(new NavigatePageCommand(1));
            CommandManager.execute(new ToggleDrawerCommand("settings", false));
            CommandManager.execute(new ToggleDrawerCommand("toc", false));
        });
    }
}

function setupSettingSelectorGroups_() {
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
}

function setupStorageResetButtons_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.btnClearBookmarks) {
        bindReaderEvent_(viewContext.btnClearBookmarks, "click", () => {
            CommandManager.execute(new ClearStorageCommand("bookmarks"));
            alert("すべてのしおりを消去しました。");
        });
    }

    if (viewContext.btnClearConfig) {
        bindReaderEvent_(viewContext.btnClearConfig, "click", () => {
            CommandManager.execute(new ClearStorageCommand("config"));
            alert("表示設定を初期化しました。");
        });
    }

    if (viewContext.btnClearAll) {
        bindReaderEvent_(viewContext.btnClearAll, "click", () => {
            CommandManager.execute(new ClearStorageCommand("all"));
            alert("すべてのキャッシュデータをリセットしました。");
        });
    }
}

function setupDebugModalOpenClose_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.btnCloseDebug) {
        bindReaderEvent_(viewContext.btnCloseDebug, "click", () => {
            CommandManager.execute(new ToggleDebugModalCommand(false));
        });
    }
    if (viewContext.debugModalOverlay) {
        bindReaderEvent_(viewContext.debugModalOverlay, "click", () => {
            CommandManager.execute(new ToggleDebugModalCommand(false));
        });
    }
    if (viewContext.btnOpenDebug) {
        bindReaderEvent_(viewContext.btnOpenDebug, "click", () => {
            CommandManager.execute(new ToggleDebugModalCommand(true));
        });
    }
}

function setupDebugModalHistoryAndTabs_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));

    if (viewContext.btnDiagnoseLayout) {
        bindReaderEvent_(viewContext.btnDiagnoseLayout, "click", runLayoutDiagnosis);
    }

    if (viewContext.btnCopyDebugReport) {
        bindReaderEvent_(viewContext.btnCopyDebugReport, "click", () => {
            if (viewContext.diagnoseReportOutput) {
                viewContext.diagnoseReportOutput.select();
                navigator.clipboard.writeText(viewContext.diagnoseReportOutput.value)
                    .then(() => alert("診断レポートをクリップボードにコピーしました。"))
                    .catch(() => alert("コピーに失敗しました。"));
            }
        });
    }

    if (viewContext.btnExportHistory) {
        bindReaderEvent_(viewContext.btnExportHistory, "click", () => {
            if (viewContext.debugHistoryJSON) {
                const exported = CommandManager.exportJSON();
                viewContext.debugHistoryJSON.value = exported;
                navigator.clipboard.writeText(exported)
                    .then(() => alert("操作履歴JSONをコピーし、出力エリアに表示しました。"))
                    .catch(() => alert("コピーに失敗しました。"));
            }
        });
    }

    if (viewContext.btnImportHistory) {
        bindReaderEvent_(viewContext.btnImportHistory, "click", () => {
            if (viewContext.debugHistoryJSON) {
                const data = viewContext.debugHistoryJSON.value.trim();
                if (data) {
                    CommandManager.importJSON(data);
                } else {
                    alert("インポート用のJSONデータをテキストエリアに入力してください。");
                }
            }
        });
    }
}

function setupTabSelectors_() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (viewContext.tabBtnMonitor && viewContext.tabBtnDiagnose) {
        bindReaderEvent_(viewContext.tabBtnMonitor, "click", () => {
            viewContext.tabBtnMonitor.classList.add("active");
            viewContext.tabBtnDiagnose.classList.remove("active");
            viewContext.tabContentMonitor.classList.remove("hidden");
            viewContext.tabContentDiagnose.classList.add("hidden");
        });

        bindReaderEvent_(viewContext.tabBtnDiagnose, "click", () => {
            viewContext.tabBtnDiagnose.classList.add("active");
            viewContext.tabBtnMonitor.classList.remove("active");
            viewContext.tabContentDiagnose.classList.remove("hidden");
            viewContext.tabContentMonitor.classList.add("hidden");
            runLayoutDiagnosis();
        });
    }
}

function setupDrawerControls() {
    setupDrawerOverlayAndToggles_();
    setupPageNavigationOverlays_();
    setupSettingSelectorGroups_();
    setupStorageResetButtons_();
    setupDebugModalOpenClose_();
    setupDebugModalHistoryAndTabs_();
    setupTabSelectors_();
}

function setupButtonGroup(selector, configKey, callback) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(btn => {
        bindReaderEvent_(btn, "click", () => {
            const val = btn.getAttribute(`data-${configKey}`);
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            callback(val);
        });
    });
}

async function saveSettings() {
    await Yuzora.locator.resolve(ConfigModel).save();
}

async function loadSettings() {
    await Yuzora.locator.resolve(ConfigModel).load();
}

function applySettings() {
    Yuzora.locator.resolve(ConfigModel).apply();
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
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.settingsDrawer.classList.add("open");
    viewContext.drawerOverlay.classList.add("open");
}

function closeSettings() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.settingsDrawer.classList.remove("open");
    viewContext.drawerOverlay.classList.remove("open");
    triggerHeaderShow();
}

function openTOC() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.tocDrawer.classList.add("open");
    viewContext.drawerOverlay.classList.add("open");
    buildTOCList();
}

function closeTOC() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.tocDrawer.classList.remove("open");
    viewContext.drawerOverlay.classList.remove("open");
    triggerHeaderShow();
}

var activeTOCAnimationId = null;

function buildTOCList() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    if (activeTOCAnimationId) {
        cancelAnimationFrame(activeTOCAnimationId);
        activeTOCAnimationId = null;
    }
    viewContext.tocList.innerHTML = "";
    if (!bookModel.toc || bookModel.toc.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "toc-item";
        emptyMsg.style.cursor = "default";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.textContent = "目次情報はありません。";
        viewContext.tocList.appendChild(emptyMsg);
        return;
    }

    let index = 0;
    const chunkSize = 100;

    function renderChunk() {
        const fragment = document.createDocumentFragment();
        const limit = Math.min(index + chunkSize, bookModel.toc.length);

        for (; index < limit; index++) {
            const item = bookModel.toc[index];
            const isActive = (item.id === viewContext.activeHeadingId);
            const itemDiv = document.createElement("div");
            itemDiv.className = `toc-item toc-item-level-${item.level}${isActive ? " active" : ""}`;
            itemDiv.textContent = item.text;
            itemDiv.setAttribute("data-heading-id", item.id);
            bindReaderEvent_(itemDiv, "click", () => {
                jumpToHeading(item.id);
                closeTOC();
            });
            fragment.appendChild(itemDiv);
        }

        viewContext.tocList.appendChild(fragment);

        if (index < bookModel.toc.length) {
            activeTOCAnimationId = requestAnimationFrame(renderChunk);
        } else {
            activeTOCAnimationId = null;
            // Update active state now that all DOM items have been appended
            updateActiveTOCItemUI();
        }
    }

    renderChunk();
}

var visibleHeadingIds = new Set();
// Timestamp (ms) until which the IntersectionObserver must not override activeHeadingId.
// Set by jumpToHeading() to prevent scroll-triggered observer callbacks from resetting
// the explicitly-chosen heading immediately after a programmatic jump.
var jumpLockUntil = 0;

function setupTOCObserver() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    visibleHeadingIds.clear();
    if (viewContext.tocObserver) {
        viewContext.tocObserver.disconnect();
    }

    const options = {
        root: viewContext.readerViewport,
        threshold: 0.1
    };

    viewContext.tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleHeadingIds.add(entry.target.id);
            } else {
                visibleHeadingIds.delete(entry.target.id);
            }
        });

        if (visibleHeadingIds.size > 0 && Date.now() >= jumpLockUntil) {
            const firstVisible = bookModel.toc.find(item => visibleHeadingIds.has(item.id));
            if (firstVisible) {
                viewContext.activeHeadingId = firstVisible.id;
            }
        }

        if (viewContext.activeHeadingId && viewContext.tocDrawer.classList.contains("open")) {
            updateActiveTOCItemUI();
        }
    }, options);

    if (bookModel.toc) {
        bookModel.toc.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                viewContext.tocObserver.observe(el);
            }
        });
    }
}

function updateActiveTOCItemUI() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const items = viewContext.tocList.querySelectorAll(".toc-item");
    items.forEach(item => {
        const headingId = item.getAttribute("data-heading-id");
        if (headingId === viewContext.activeHeadingId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

function jumpToHeading(headingId) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    const targetElement = document.getElementById(headingId);
    if (!targetElement) return;

    viewContext.activeHeadingId = headingId;
    // Lock the IntersectionObserver from overriding activeHeadingId for 800ms
    // so that the scroll-triggered observer callback doesn't reset it to the
    // first document-order heading before the viewport finishes moving.
    jumpLockUntil = Date.now() + 800;

    const rect = targetElement.getBoundingClientRect();
    const containerRect = viewContext.readerViewport.getBoundingClientRect();
    const viewportWidth = viewContext.readerViewport.clientWidth;

    let pageIndex = 0;
    if (configModel.direction === "rtl") {
        const absoluteRight = (containerRect.right - rect.right) + Math.abs(viewContext.readerViewport.scrollLeft);
        const absoluteLeft = (containerRect.right - rect.left) + Math.abs(viewContext.readerViewport.scrollLeft);
        const absoluteCenter = (absoluteRight + absoluteLeft) / 2;
        pageIndex = Math.floor(absoluteCenter / viewportWidth);
    } else {
        const absoluteLeft = (rect.left - containerRect.left) + viewContext.readerViewport.scrollLeft;
        const absoluteRight = (rect.right - containerRect.left) + viewContext.readerViewport.scrollLeft;
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
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (!viewContext.settingsDrawer.classList.contains("open") && !viewContext.tocDrawer.classList.contains("open")) {
        viewContext.readerHeader.classList.add("hidden");
        if (viewContext.readerFooter) {
            viewContext.readerFooter.classList.add("hidden");
        }
    }
}

function triggerHeaderShow() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    viewContext.readerHeader.classList.remove("hidden");
    if (viewContext.readerFooter) {
        viewContext.readerFooter.classList.remove("hidden");
    }
    
    clearTimeout(viewContext.headerTimeout);
    viewContext.headerTimeout = setTimeout(() => {
        hideControls();
    }, 3000); // Hide after 3 seconds of inactivity
}

function toggleControls(e) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    // Prevent toggle if clicking interactive elements inside reader viewport
    if (e && e.type === "click" && (e.target.closest("a") || e.target.closest("ruby") || e.target.closest("button"))) {
        return;
    }

    const nextVisible = viewContext.readerHeader.classList.contains("hidden");
    CommandManager.execute(new ToggleControlsCommand(nextVisible));
}


