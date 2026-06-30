/**
 * @fileoverview Externs for Yuzora legacy global proxy variables and ADVANCED_OPTIMIZATIONS protection
 * @externs
 */

// Legacy Global Proxy Variables (to protect global variables)
var currentFileName;
var currentFileContent;
var currentFileType;
var bookmarkProgress;
var headerTimeout;
var isReflowing;
var currentTOC;
var activeHeadingId;
var tocObserver;
var config;
var app;
var welcomeScreen;
var readerScreen;
var dropZone;
var fileInput;
var readerViewport;
var readerContent;
var bookTitle;
var btnBack;
var btnSettings;
var btnTOC;
var btnFirstPage;
var btnCloseSettings;
var btnCloseTOC;
var settingsDrawer;
var tocDrawer;
var tocList;
var drawerOverlay;
var pageNavLeft;
var pageNavRight;
var readerHeader;
var readerFooter;
var progressBarContainer;
var progressBar;
var readingPercentage;
var readingIndex;
var developerBooksGrid;
var readerBooksGrid;
var btnOpenDebug;
var debugModal;
var btnCloseDebug;
var debugModalOverlay;
var debugMonitor;
var btnClearBookmarks;
var btnClearConfig;
var btnClearAll;
var btnDiagnoseLayout;
var btnCopyDebugReport;
var diagnoseReportOutput;
var debugHistoryJSON;
var btnExportHistory;
var btnImportHistory;
var tabBtnMonitor;
var tabBtnDiagnose;
var tabContentMonitor;
var tabContentDiagnose;
var localStorageKeys;
var localStorage;

// Window prototype expansions
/** @type {!LocatorInterface} */
Window.prototype.locator;

/** @type {Object} */
Window.prototype.Yuzora;
/** @type {Object} */
Window.prototype.YuzoraEvent;
/** @type {Object} */
Window.prototype.YuzoraEventTarget;

// CSSStyleDeclaration prototype extensions
/** @type {string} */
CSSStyleDeclaration.prototype.columnWidth;
/** @type {string} */
CSSStyleDeclaration.prototype.columnGap;

// Locator Interface definition in externs
/**
 * @interface
 */
function LocatorInterface() {}
/**
 * @param {!Function} Class
 * @return {?}
 */
LocatorInterface.prototype.resolve = function(Class) {};
/**
 * @param {!Function} Class
 * @return {?}
 */
LocatorInterface.prototype.locate = function(Class) {};
/**
 * @param {!Function} Class
 * @param {!Object} instance
 */
LocatorInterface.prototype.register = function(Class, instance) {};

// Custom interface to protect property names from being renamed globally in ADVANCED_OPTIMIZATIONS
/**
 * @interface
 */
function YuzoraPrototypes() {}

/** @type {Function} */
YuzoraPrototypes.prototype.initializeDOMElements;

// Command Interface
/**
 * @interface
 */
function CommandInterface() {}
/** @type {Function} */
CommandInterface.prototype.execute = function() {};
/** @type {Function} */
CommandInterface.prototype.toJSON = function() {};

// CommandManager Interface
/**
 * @interface
 */
function CommandManagerInterface() {}
/** @type {Function} */
CommandManagerInterface.prototype.execute = function(command, isFromReplay) {};
/** @type {Function} */
CommandManagerInterface.prototype.exportJSON = function() {};
/** @type {Function} */
CommandManagerInterface.prototype.importJSON = function(jsonString) {};
/** @type {Function} */
CommandManagerInterface.prototype.undo = function() {};
/** @type {Function} */
CommandManagerInterface.prototype.redo = function() {};
/** @type {boolean} */
CommandManagerInterface.prototype.isReplaying;
/** @type {!Array} */
CommandManagerInterface.prototype.commandHistory;
/** @type {Function} */
CommandManagerInterface.prototype.updateDebugMonitor = function() {};

// Protect AppState properties by declaring them on Object.prototype to prevent renaming during dynamic access
/** @type {?} */
Object.prototype.currentFileName;
/** @type {?} */
Object.prototype.currentFileContent;
/** @type {?} */
Object.prototype.currentFileType;
/** @type {?} */
Object.prototype.bookmarkProgress;
/** @type {?} */
Object.prototype.headerTimeout;
/** @type {?} */
Object.prototype.isReflowing;
/** @type {?} */
Object.prototype.currentTOC;
/** @type {?} */
Object.prototype.activeHeadingId;
/** @type {?} */
Object.prototype.tocObserver;
/** @type {?} */
Object.prototype.config;
/** @type {?} */
Object.prototype.app;
/** @type {?} */
Object.prototype.welcomeScreen;
/** @type {?} */
Object.prototype.readerScreen;
/** @type {?} */
Object.prototype.dropZone;
/** @type {?} */
Object.prototype.fileInput;
/** @type {?} */
Object.prototype.readerViewport;
/** @type {?} */
Object.prototype.readerContent;
/** @type {?} */
Object.prototype.bookTitle;
/** @type {?} */
Object.prototype.btnBack;
/** @type {?} */
Object.prototype.btnSettings;
/** @type {?} */
Object.prototype.btnTOC;
/** @type {?} */
Object.prototype.btnFirstPage;
/** @type {?} */
Object.prototype.btnCloseSettings;
/** @type {?} */
Object.prototype.btnCloseTOC;
/** @type {?} */
Object.prototype.settingsDrawer;
/** @type {?} */
Object.prototype.tocDrawer;
/** @type {?} */
Object.prototype.tocList;
/** @type {?} */
Object.prototype.drawerOverlay;
/** @type {?} */
Object.prototype.pageNavLeft;
/** @type {?} */
Object.prototype.pageNavRight;
/** @type {?} */
Object.prototype.readerHeader;
/** @type {?} */
Object.prototype.readerFooter;
/** @type {?} */
Object.prototype.progressBarContainer;
/** @type {?} */
Object.prototype.progressBar;
/** @type {?} */
Object.prototype.readingPercentage;
/** @type {?} */
Object.prototype.readingIndex;
/** @type {?} */
Object.prototype.developerBooksGrid;
/** @type {?} */
Object.prototype.readerBooksGrid;
/** @type {?} */
Object.prototype.btnOpenDebug;
/** @type {?} */
Object.prototype.debugModal;
/** @type {?} */
Object.prototype.btnCloseDebug;
/** @type {?} */
Object.prototype.debugModalOverlay;
/** @type {?} */
Object.prototype.debugMonitor;
/** @type {?} */
Object.prototype.btnClearBookmarks;
/** @type {?} */
Object.prototype.btnClearConfig;
/** @type {?} */
Object.prototype.btnClearAll;
/** @type {?} */
Object.prototype.btnDiagnoseLayout;
/** @type {?} */
Object.prototype.btnCopyDebugReport;
/** @type {?} */
Object.prototype.diagnoseReportOutput;
/** @type {?} */
Object.prototype.debugHistoryJSON;
/** @type {?} */
Object.prototype.btnExportHistory;
/** @type {?} */
Object.prototype.btnImportHistory;
/** @type {?} */
Object.prototype.tabBtnMonitor;
/** @type {?} */
Object.prototype.tabBtnDiagnose;
/** @type {?} */
Object.prototype.tabContentMonitor;
/** @type {?} */
Object.prototype.tabContentDiagnose;
/** @type {?} */
Object.prototype.localStorageKeys;

// Command subclasses parameter property protection
var targetPage;
var progress;
var visible;
var configKey;
var configValue;
var fileName;
var fileContent;

// Yuzora global namespaces properties
var Yuzora;
Yuzora.parseAozoraText;
Yuzora.parseAozoraHTML;
Yuzora.formatAozoraMarkup;
Yuzora.config;
Yuzora.runLayoutDiagnosis;
Yuzora.getCurrentTOC;
Yuzora.CommandManager;
Yuzora.LoadBookCommand;
Yuzora.NavigatePageCommand;
Yuzora.UpdateConfigCommand;
Yuzora.SyncBookmarkCommand;

// YuzoraEvent Interface definition
/**
 * @interface
 */
function YuzoraEventInterface() {}
/** @type {string} */
YuzoraEventInterface.prototype.type;
/** @type {?} */
YuzoraEventInterface.prototype.detail;
/** @type {?Object} */
YuzoraEventInterface.prototype.target;

// YuzoraEventTarget Interface definition
/**
 * @interface
 */
function YuzoraEventTargetInterface() {}
/**
 * @param {string} type
 * @param {function(!YuzoraEventInterface):void} listener
 */
YuzoraEventTargetInterface.prototype.addEventListener = function(type, listener) {};
/**
 * @param {string} type
 * @param {function(!YuzoraEventInterface):void} listener
 */
YuzoraEventTargetInterface.prototype.removeEventListener = function(type, listener) {};
/**
 * @param {!YuzoraEventInterface} event
 */
YuzoraEventTargetInterface.prototype.dispatchEvent = function(event) {};


