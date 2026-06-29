/**
 * Yuzora - Configuration & Global State Variables Module
 */
"use strict";

class AppState {
    constructor() {
        // DOM Elements (Placeholders)
        this.app = null;
        this.welcomeScreen = null;
        this.readerScreen = null;
        this.dropZone = null;
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

        // State Variables
        this.currentFileName = '';
        this.currentFileContent = '';
        this.currentFileType = ''; // 'txt' or 'html'
        this.bookmarkProgress = 0; // 0 to 1 scroll percentage
        this.headerTimeout = null;
        this.isReflowing = false;
        this.currentTOC = [];
        this.activeHeadingId = null;
        this.tocObserver = null;

        // Viewport layout configurations
        this.config = {
            theme: 'sepia',
            font: 'font-gothic',
            direction: 'rtl',
            size: 'size-md',
            lh: 'line-height-normal',
            spacing: 'spacing-normal'
        };

        this.localStorageKeys = [
            'last_read_file_name',
            'last_read_file_content',
            'last_read_file_type',
            'yuzora_config'
        ];
    }

    initializeDOMElements() {
        this.app = document.getElementById('app');
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.readerScreen = document.getElementById('reader-screen');
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
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
        this.readerHeader = document.querySelector('.reader-header');
        this.readerFooter = document.querySelector('.reader-footer');
        
        this.progressBarContainer = document.querySelector('.progress-bar-container');
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
        this.diagnoseReportOutput = document.getElementById('diagnose-report-output');

        this.debugHistoryJSON = document.getElementById('debug-history-json');
        this.btnExportHistory = document.getElementById('btn-export-history');
        this.btnImportHistory = document.getElementById('btn-import-history');

        this.tabBtnMonitor = document.getElementById('tab-btn-monitor');
        this.tabBtnDiagnose = document.getElementById('tab-btn-diagnose');
        this.tabContentMonitor = document.getElementById('debug-tab-content-monitor');
        this.tabContentDiagnose = document.getElementById('debug-tab-content-diagnose');
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
    window.locator.resolve(AppState).initializeDOMElements();
}

// Register AppState in the global locator
window.locator.register(AppState, new AppState());

// Define compatibility getters/setters on window to route legacy global variables to AppState in locator
[
    'currentFileName', 'currentFileContent', 'currentFileType', 'bookmarkProgress',
    'headerTimeout', 'isReflowing', 'currentTOC', 'activeHeadingId', 'tocObserver', 'config',
    'app', 'welcomeScreen', 'readerScreen', 'dropZone', 'fileInput', 'readerViewport',
    'readerContent', 'bookTitle', 'btnBack', 'btnSettings', 'btnTOC', 'btnFirstPage',
    'btnCloseSettings', 'btnCloseTOC', 'settingsDrawer', 'tocDrawer', 'tocList',
    'drawerOverlay', 'pageNavLeft', 'pageNavRight', 'readerHeader', 'readerFooter',
    'progressBarContainer', 'progressBar', 'readingPercentage', 'readingIndex',
    'developerBooksGrid', 'readerBooksGrid', 'btnOpenDebug', 'debugModal', 'btnCloseDebug',
    'debugModalOverlay', 'debugMonitor', 'btnClearBookmarks', 'btnClearConfig', 'btnClearAll',
    'btnDiagnoseLayout', 'btnCopyDebugReport', 'diagnoseReportOutput', 'debugHistoryJSON',
    'btnExportHistory', 'btnImportHistory', 'tabBtnMonitor', 'tabBtnDiagnose',
    'tabContentMonitor', 'tabContentDiagnose', 'localStorageKeys'
].forEach(prop => {
    Object.defineProperty(window, prop, {
        get() {
            const state = window.locator.resolve(AppState);
            return state[prop];
        },
        set(val) {
            const state = window.locator.resolve(AppState);
            state[prop] = val;
        },
        configurable: true
    });
});
