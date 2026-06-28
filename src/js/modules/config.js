/**
 * Yuzora - Configuration & Global State Variables Module
 */

// ==========================================================================
// DOM Elements (Placeholders)
// ==========================================================================
var app = null;
var welcomeScreen = null;
var readerScreen = null;
var dropZone = null;
var fileInput = null;
var readerViewport = null;
var readerContent = null;
var bookTitle = null;

// Controls & Navigation
var btnBack = null;
var btnSettings = null;
var btnTOC = null;
var btnFirstPage = null;
var btnCloseSettings = null;
var btnCloseTOC = null;
var settingsDrawer = null;
var tocDrawer = null;
var tocList = null;
var drawerOverlay = null;
var pageNavLeft = null;
var pageNavRight = null;
var readerHeader = null;
var readerFooter = null;

// Progress
var progressBarContainer = null;
var progressBar = null;
var readingPercentage = null;
var readingIndex = null;

// Predefined Books Grid
var developerBooksGrid = null;
var readerBooksGrid = null;

// Debug Modal Elements
var btnOpenDebug = null;
var debugModal = null;
var btnCloseDebug = null;
var debugModalOverlay = null;
var debugMonitor = null;
var btnClearBookmarks = null;
var btnClearConfig = null;
var btnClearAll = null;

// Layout Diagnostics Elements
var btnDiagnoseLayout = null;
var btnCopyDebugReport = null;
var diagnoseReportOutput = null;

// Debug Command History Elements
var debugHistoryJSON = null;
var btnExportHistory = null;
var btnImportHistory = null;

// Debug Tabs Elements
var tabBtnMonitor = null;
var tabBtnDiagnose = null;
var tabContentMonitor = null;
var tabContentDiagnose = null;

function initializeDOMElements() {
    app = document.getElementById('app');
    welcomeScreen = document.getElementById('welcome-screen');
    readerScreen = document.getElementById('reader-screen');
    dropZone = document.getElementById('drop-zone');
    fileInput = document.getElementById('file-input');
    readerViewport = document.getElementById('reader-viewport');
    readerContent = document.getElementById('reader-content');
    bookTitle = document.getElementById('book-title');
    
    btnBack = document.getElementById('btn-back');
    btnSettings = document.getElementById('btn-settings');
    btnTOC = document.getElementById('btn-toc');
    btnFirstPage = document.getElementById('btn-first-page');
    btnCloseSettings = document.getElementById('btn-close-settings');
    btnCloseTOC = document.getElementById('btn-close-toc');
    settingsDrawer = document.getElementById('settings-drawer');
    tocDrawer = document.getElementById('toc-drawer');
    tocList = document.getElementById('toc-list');
    drawerOverlay = document.getElementById('drawer-overlay');
    pageNavLeft = document.getElementById('page-nav-left');
    pageNavRight = document.getElementById('page-nav-right');
    readerHeader = document.querySelector('.reader-header');
    readerFooter = document.querySelector('.reader-footer');
    
    progressBarContainer = document.querySelector('.progress-bar-container');
    progressBar = document.getElementById('progress-bar');
    readingPercentage = document.getElementById('reading-percentage');
    readingIndex = document.getElementById('reading-index');
    
    developerBooksGrid = document.getElementById('developer-books-grid');
    readerBooksGrid = document.getElementById('reader-books-grid');

    btnOpenDebug = document.getElementById('btn-open-debug');
    debugModal = document.getElementById('debug-modal');
    btnCloseDebug = document.getElementById('btn-close-debug');
    debugModalOverlay = document.getElementById('debug-modal-overlay');
    debugMonitor = document.getElementById('debug-monitor');
    btnClearBookmarks = document.getElementById('btn-clear-bookmarks');
    btnClearConfig = document.getElementById('btn-clear-config');
    btnClearAll = document.getElementById('btn-clear-all');

    btnDiagnoseLayout = document.getElementById('btn-diagnose-layout');
    btnCopyDebugReport = document.getElementById('btn-copy-debug-report');
    diagnoseReportOutput = document.getElementById('diagnose-report-output');

    debugHistoryJSON = document.getElementById('debug-history-json');
    btnExportHistory = document.getElementById('btn-export-history');
    btnImportHistory = document.getElementById('btn-import-history');

    tabBtnMonitor = document.getElementById('tab-btn-monitor');
    tabBtnDiagnose = document.getElementById('tab-btn-diagnose');
    tabContentMonitor = document.getElementById('debug-tab-content-monitor');
    tabContentDiagnose = document.getElementById('debug-tab-content-diagnose');
}

// ==========================================================================
// Predefined Recommended Books Data
// ==========================================================================
var PREDEFINED_BOOKS = [
    { id: "kokoro", title: "こころ", shortTitle: "こころ", cardId: 773, path: "src/books/773_yoko.txt", category: "developer", author: "夏目漱石", meta: "夏目漱石" },
    { id: "gokyo", title: "故郷", shortTitle: "故郷", cardId: 42939, path: "src/books/42939_yoko.txt", category: "developer", author: "魯迅", meta: "魯迅" },

    { id: "musashi_01", title: "宮本武蔵 01 序、はしがき", shortTitle: "序、はしがき", cardId: 52395, path: "src/books/52395_yoko.txt", category: "reader", author: "吉川英治", meta: "01" },
    { id: "musashi_02", title: "宮本武蔵 02 地の巻", shortTitle: "地の巻", cardId: 52396, path: "src/books/52396_yoko.txt", category: "reader", author: "吉川英治", meta: "02" },
    { id: "musashi_03", title: "宮本武蔵 03 水の巻", shortTitle: "水の巻", cardId: 52397, path: "src/books/52397_yoko.txt", category: "reader", author: "吉川英治", meta: "03" },
    { id: "musashi_04", title: "宮本武蔵 04 火の巻", shortTitle: "火の巻", cardId: 52398, path: "src/books/52398_yoko.txt", category: "reader", author: "吉川英治", meta: "04" },
    { id: "musashi_05", title: "宮本武蔵 05 風の巻", shortTitle: "風の巻", cardId: 52399, path: "src/books/52399_yoko.txt", category: "reader", author: "吉川英治", meta: "05" },
    { id: "musashi_06", title: "宮本武蔵 06 空の巻", shortTitle: "空の巻", cardId: 52400, path: "src/books/52400_yoko.txt", category: "reader", author: "吉川英治", meta: "06" },
    { id: "musashi_07", title: "宮本武蔵 07 二天の巻", shortTitle: "二天の巻", cardId: 52401, path: "src/books/52401_yoko.txt", category: "reader", author: "吉川英治", meta: "07" },
    { id: "musashi_08", title: "宮本武蔵 08 円明の巻", shortTitle: "円明の巻", cardId: 52402, path: "src/books/52402_yoko.txt", category: "reader", author: "吉川英治", meta: "08" }
];

// ==========================================================================
// State Variables
// ==========================================================================
var currentFileName = '';
var currentFileContent = '';
var currentFileType = ''; // 'txt' or 'html'
var bookmarkProgress = 0; // 0 to 1 scroll percentage
var headerTimeout = null;
var isReflowing = false;
var currentTOC = [];

// Viewport layout configurations
var config = {
    theme: 'sepia',
    font: 'font-gothic',
    direction: 'rtl',
    size: 'size-md',
    lh: 'line-height-normal',
    spacing: 'spacing-normal'
};

var localStorageKeys = [
    'last_read_file_name',
    'last_read_file_content',
    'last_read_file_type',
    'yuzora_config'
];
