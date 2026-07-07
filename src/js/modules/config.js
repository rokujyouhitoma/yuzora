/**
 * Yuzora - Configuration & Global State Variables Module
 */
"use strict";

/**
 * ViewContext class.
 * @implements {ViewContextInterface}
 */
class ViewContext {
    constructor() {
        // DOM Elements (Placeholders)
        this.app = null;
        this.welcomeScreen = null;
        this.readerScreen = null;
        this.dropZone = null;
        /** @type {?HTMLInputElement} */
        this.fileInput = null;
        this.readerViewport = null;
        this.readerContent = null;
        this.bookTitle = null;

        // Controls & Navigation
        this.btnBack = null;
        this.btnSettings = null;
        this.btnTOC = null;
        this.btnFirstPage = null;
        this.btnCloseSettings = null;
        this.btnCloseTOC = null;
        this.settingsDrawer = null;
        this.tocDrawer = null;
        this.tocList = null;
        this.drawerOverlay = null;
        this.pageNavLeft = null;
        this.pageNavRight = null;
        this.readerHeader = null;
        this.readerFooter = null;

        // Progress
        this.progressBarContainer = null;
        this.progressBar = null;
        this.readingPercentage = null;
        this.readingIndex = null;

        // Predefined Books Grid
        this.developerBooksGrid = null;
        this.readerBooksGrid = null;

        // Debug Modal Elements
        this.btnOpenDebug = null;
        this.debugModal = null;
        this.btnCloseDebug = null;
        this.debugModalOverlay = null;
        this.debugMonitor = null;
        this.btnClearBookmarks = null;
        this.btnClearConfig = null;
        this.btnClearAll = null;

        // Layout Diagnostics Elements
        this.btnDiagnoseLayout = null;
        this.btnCopyDebugReport = null;
        this.diagnoseReportOutput = null;

        // Debug Command History Elements
        this.debugHistoryJSON = null;
        this.btnExportHistory = null;
        this.btnImportHistory = null;

        // Debug Tabs Elements
        this.tabBtnMonitor = null;
        this.tabBtnDiagnose = null;
        this.tabContentMonitor = null;
        this.tabContentDiagnose = null;

        // UI/Layout related states
        this.headerTimeout = null;
        this.isReflowing = false;
        this.activeHeadingId = null;
        this.tocObserver = null;
        /** @type {?ConfigModelInterface} */
        this.config = null;

        // Drawer open/closed states
        this.settingsDrawerOpen = false;
        this.tocDrawerOpen = false;
    }

    initializeDOMElements() {
        this.app = document.getElementById('app');
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.readerScreen = document.getElementById('reader-screen');
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = /** @type {?HTMLInputElement} */ (document.getElementById('file-input'));
        this.readerViewport = document.getElementById('reader-viewport');
        this.readerContent = document.getElementById('reader-content');
        this.bookTitle = document.getElementById('book-title');
        
        this.btnBack = document.getElementById('btn-back');
        this.btnSettings = document.getElementById('btn-settings');
        this.btnTOC = document.getElementById('btn-toc');
        this.btnFirstPage = document.getElementById('btn-first-page');
        this.btnCloseSettings = document.getElementById('btn-close-settings');
        this.btnCloseTOC = document.getElementById('btn-close-toc');
        this.settingsDrawer = document.getElementById('settings-drawer');
        this.tocDrawer = document.getElementById('toc-drawer');
        this.tocList = document.getElementById('toc-list');
        this.drawerOverlay = document.getElementById('drawer-overlay');
        this.pageNavLeft = document.getElementById('page-nav-left');
        this.pageNavRight = document.getElementById('page-nav-right');
        this.readerHeader = /** @type {?HTMLElement} */ (document.querySelector('.reader-header'));
        this.readerFooter = /** @type {?HTMLElement} */ (document.querySelector('.reader-footer'));
        
        this.progressBarContainer = /** @type {?HTMLElement} */ (document.querySelector('.progress-bar-container'));
        this.progressBar = document.getElementById('progress-bar');
        this.readingPercentage = document.getElementById('reading-percentage');
        this.readingIndex = document.getElementById('reading-index');
        
        this.developerBooksGrid = document.getElementById('developer-books-grid');
        this.readerBooksGrid = document.getElementById('reader-books-grid');

        this.btnOpenDebug = document.getElementById('btn-open-debug');
        this.debugModal = document.getElementById('debug-modal');
        this.btnCloseDebug = document.getElementById('btn-close-debug');
        this.debugModalOverlay = document.getElementById('debug-modal-overlay');
        this.debugMonitor = document.getElementById('debug-monitor');
        this.btnClearBookmarks = document.getElementById('btn-clear-bookmarks');
        this.btnClearConfig = document.getElementById('btn-clear-config');
        this.btnClearAll = document.getElementById('btn-clear-all');

        this.btnDiagnoseLayout = document.getElementById('btn-diagnose-layout');
        this.btnCopyDebugReport = document.getElementById('btn-copy-debug-report');
        this.diagnoseReportOutput = /** @type {?HTMLTextAreaElement} */ (document.getElementById('diagnose-report-output'));

        this.debugHistoryJSON = /** @type {?HTMLTextAreaElement} */ (document.getElementById('debug-history-json'));
        this.btnExportHistory = document.getElementById('btn-export-history');
        this.btnImportHistory = document.getElementById('btn-import-history');

        this.tabBtnMonitor = document.getElementById('tab-btn-monitor');
        this.tabBtnDiagnose = document.getElementById('tab-btn-diagnose');
        this.tabContentMonitor = document.getElementById('debug-tab-content-monitor');
        this.tabContentDiagnose = document.getElementById('debug-tab-content-diagnose');
    }
}

/**
 * BookModel class.
 * @implements {BookModelInterface}
 */
class BookModel {
    constructor() {
        this.title = '';
        this.content = '';
        this.type = ''; // 'txt' or 'html'
        this.totalPages = 0;
        this.currentPage = 0;
        this.toc = [];
    }

    /**
     * Checks if empty.
     * @return {boolean}
     * @override
     */
    // @ts-expect-error
    isEmpty() {
        return !this.title || !this.content;
    }

    /**
     * Clears data.
     * @override
     */
    // @ts-expect-error
    clear() {
        this.title = '';
        this.content = '';
        this.type = '';
        this.totalPages = 0;
        this.currentPage = 0;
        this.toc = [];
    }
}

/**
 * ConfigModel class.
 * @implements {ConfigModelInterface}
 */
class ConfigModel {
    constructor() {
        this.theme = 'sepia';
        this.font = 'font-gothic';
        this.direction = 'rtl';
        this.size = 'size-md';
        this.lh = 'line-height-normal';
        this.spacing = 'spacing-normal';
    }

    /**
     * Loads config.
     * @override
     */
    // @ts-expect-error
    load() {
        const settingsRepo = /** @type {!SettingsRepositoryInterface} */ (Yuzora.locator.resolve(SettingsRepository));
        const parsed = settingsRepo.load();
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            this.applyParsed_(/** @type {!Object<string, string>} */ (parsed));
        }
    }

    /**
     * @private
     * @param {!Object<string, string>} parsedConfig
     */
    applyParsed_(parsedConfig) {
        if (parsedConfig['theme']) this.theme = parsedConfig['theme'];
        if (parsedConfig['font']) this.font = parsedConfig['font'];
        if (parsedConfig['direction']) this.direction = parsedConfig['direction'];
        if (parsedConfig['size']) this.size = parsedConfig['size'];
        if (parsedConfig['lh']) this.lh = parsedConfig['lh'];
        if (parsedConfig['spacing']) this.spacing = parsedConfig['spacing'];
    }

    /**
     * Saves config.
     * @override
     */
    // @ts-expect-error
    save() {
        const settingsRepo = /** @type {!SettingsRepositoryInterface} */ (Yuzora.locator.resolve(SettingsRepository));
        settingsRepo.save({
            'theme': this.theme,
            'font': this.font,
            'direction': this.direction,
            'size': this.size,
            'lh': this.lh,
            'spacing': this.spacing
        });
    }

    /**
     * Applies config styles.
     * @override
     */
    // @ts-expect-error
    apply() {
        document.body.setAttribute('data-theme', this.theme);

        const viewContext = /** @type {!ViewContext} */ (Yuzora.locator.resolve(ViewContext));
        if (!viewContext.readerContent || !viewContext.readerViewport) return;

        viewContext.readerViewport.style.direction = this.direction;

        viewContext.readerContent.className = "reader-content";
        viewContext.readerContent.classList.add(this.font, `direction-${this.direction}`, this.size, this.lh, this.spacing);

        // Update navigation overlays page titles based on direction
        if (this.direction === "rtl") {
            viewContext.pageNavLeft.title = "次のページへ";
            viewContext.pageNavRight.title = "前のページへ";
        } else {
            viewContext.pageNavLeft.title = "前のページへ";
            viewContext.pageNavRight.title = "次のページへ";
        }

        // Update first page button chevron icon direction
        const btnFirstPagePath = viewContext.btnFirstPage ? viewContext.btnFirstPage.querySelector("path") : null;
        if (btnFirstPagePath) {
            if (this.direction === "rtl") {
                btnFirstPagePath.setAttribute("d", "M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5");
            } else {
                btnFirstPagePath.setAttribute("d", "M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5");
            }
        }

        // Update Button States in Drawer UI
        if (typeof syncButtonState === "function") {
            syncButtonState(".theme-selector button", "theme", this.theme);
            syncButtonState(".font-selector button", "font", this.font);
            syncButtonState(".direction-selector button", "direction", this.direction);
            syncButtonState(".size-selector button", "size", this.size);
            syncButtonState(".lh-selector button", "lh", this.lh);
            syncButtonState(".spacing-selector button", "spacing", this.spacing);
        }
    }
}

/**
 * BookmarkModel class.
 * @implements {BookmarkModelInterface}
 */
class BookmarkModel {
    constructor() {
        this.bookmarkProgress = 0;
    }

    /**
     * Saves bookmark.
     * @param {string} fileName
     * @param {number} progress
     * @override
     */
    // @ts-expect-error
    save(fileName, progress) {
        if (fileName) {
            this.bookmarkProgress = progress;
            const bookmarkRepo = /** @type {!BookmarkRepositoryInterface} */ (Yuzora.locator.resolve(BookmarkRepository));
            bookmarkRepo.save(fileName, progress);
        }
    }

    /**
     * Loads bookmark.
     * @param {string} fileName
     * @return {number}
     * @override
     */
    // @ts-expect-error
    load(fileName) {
        if (!fileName) {
            this.bookmarkProgress = 0;
            return 0;
        }
        const bookmarkRepo = /** @type {!BookmarkRepositoryInterface} */ (Yuzora.locator.resolve(BookmarkRepository));
        this.bookmarkProgress = bookmarkRepo.load(fileName);
        return this.bookmarkProgress;
    }

    /**
     * Clears bookmark.
     * @override
     */
    // @ts-expect-error
    clear() {
        this.bookmarkProgress = 0;
    }
}

// Predefined Recommended Books Data (Keep as global/constant data)
var PREDEFINED_BOOKS = [
    { id: "kokoro", title: "こころ", shortTitle: "こころ", cardId: 773, path: "src/books/773_yoko.txt", category: "developer", author: "夏目漱石", meta: "夏目漱石" },
    { id: "gokyo", title: "故郷", shortTitle: "故郷", cardId: 42939, path: "src/books/42939_yoko.txt", category: "developer", author: "魯迅", meta: "魯迅" },

    { id: "musashi_01", title: "宮本武蔵 01 序、はしがき", shortTitle: "序、はしがき", cardId: 52395, path: "src/books/52395_yoko.txt", category: "reader", author: "吉川英治", meta: "01" },
    { id: "musashi_02", title: "宮本武蔵 02 地の巻", shortTitle: "地の巻", cardId: 52396, path: "src/books/52396_yoko.txt", category: "reader", author: "吉川英治", meta: "02" },
    { id: "musashi_03", title: "宮本武蔵 03 水の巻", shortTitle: "水の巻", cardId: 52397, path: "src/books/52397_yoko.txt", category: "reader", author: "吉川英治", meta: "03" },
    { id: "musashi_04", title: "宮本武蔵 04 火の巻", shortTitle: "火の巻", cardId: 52398, path: "src/books/52398_yoko.txt", category: "reader", author: "吉川英治", meta: "04" },
    { id: "musashi_05", title: "宮本武蔵 05 風 of the roll", shortTitle: "風の巻", cardId: 52399, path: "src/books/52399_yoko.txt", category: "reader", author: "吉川英治", meta: "05" },
    { id: "musashi_06", title: "宮本武蔵 06 空の巻", shortTitle: "空の巻", cardId: 52400, path: "src/books/52400_yoko.txt", category: "reader", author: "吉川英治", meta: "06" },
    { id: "musashi_07", title: "宮本武蔵 07 二天の巻", shortTitle: "二天の巻", cardId: 52401, path: "src/books/52401_yoko.txt", category: "reader", author: "吉川英治", meta: "07" },
    { id: "musashi_08", title: "宮本武蔵 08 円明の巻", shortTitle: "円明の巻", cardId: 52402, path: "src/books/52402_yoko.txt", category: "reader", author: "吉川英治", meta: "08" }
];

// Compatibility wrapper function
function initializeDOMElements() {
    Yuzora.locator.resolve(ViewContext).initializeDOMElements();
}

// Register ViewContext and new Models in the global locator
const globalViewContext = new ViewContext();
locator.register(ViewContext, globalViewContext);
locator.register(BookModel, new BookModel());
locator.register(ConfigModel, new ConfigModel());
locator.register(BookmarkModel, new BookmarkModel());
