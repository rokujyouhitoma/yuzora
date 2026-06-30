/**
 * @fileoverview Externs for Yuzora legacy global proxy variables and ADVANCED_OPTIMIZATIONS protection
 * @externs
 */

// Global variables
var localStorageKeys;
var localStorage;

// Window prototype expansions
/** @type {!LocatorInterface} */
Window.prototype.locator;

/** @type {!YuzoraInterface} */
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

/**
 * @interface
 */
function ViewContextInterface() {}
/** @type {?number} */
ViewContextInterface.prototype.headerTimeout;
/** @type {boolean} */
ViewContextInterface.prototype.isReflowing;
/** @type {?string} */
ViewContextInterface.prototype.activeHeadingId;
/** @type {?IntersectionObserver} */
ViewContextInterface.prototype.tocObserver;
/** @type {boolean} */
ViewContextInterface.prototype.settingsDrawerOpen;
/** @type {boolean} */
ViewContextInterface.prototype.tocDrawerOpen;

/** @type {?Element} */
ViewContextInterface.prototype.app;
/** @type {?Element} */
ViewContextInterface.prototype.welcomeScreen;
/** @type {?Element} */
ViewContextInterface.prototype.readerScreen;
/** @type {?Element} */
ViewContextInterface.prototype.dropZone;
/** @type {?HTMLInputElement} */
ViewContextInterface.prototype.fileInput;
/** @type {?Element} */
ViewContextInterface.prototype.readerViewport;
/** @type {?Element} */
ViewContextInterface.prototype.readerContent;
/** @type {?Element} */
ViewContextInterface.prototype.bookTitle;

/** @type {?Element} */
ViewContextInterface.prototype.btnBack;
/** @type {?Element} */
ViewContextInterface.prototype.btnSettings;
/** @type {?Element} */
ViewContextInterface.prototype.btnTOC;
/** @type {?Element} */
ViewContextInterface.prototype.btnFirstPage;
/** @type {?Element} */
ViewContextInterface.prototype.btnCloseSettings;
/** @type {?Element} */
ViewContextInterface.prototype.btnCloseTOC;
/** @type {?Element} */
ViewContextInterface.prototype.settingsDrawer;
/** @type {?Element} */
ViewContextInterface.prototype.tocDrawer;
/** @type {?Element} */
ViewContextInterface.prototype.tocList;
/** @type {?Element} */
ViewContextInterface.prototype.drawerOverlay;
/** @type {?Element} */
ViewContextInterface.prototype.pageNavLeft;
/** @type {?Element} */
ViewContextInterface.prototype.pageNavRight;
/** @type {?Element} */
ViewContextInterface.prototype.readerHeader;
/** @type {?Element} */
ViewContextInterface.prototype.readerFooter;

/** @type {?Element} */
ViewContextInterface.prototype.progressBarContainer;
/** @type {?Element} */
ViewContextInterface.prototype.progressBar;
/** @type {?Element} */
ViewContextInterface.prototype.readingPercentage;
/** @type {?Element} */
ViewContextInterface.prototype.readingIndex;

/** @type {?Element} */
ViewContextInterface.prototype.developerBooksGrid;
/** @type {?Element} */
ViewContextInterface.prototype.readerBooksGrid;

/** @type {?Element} */
ViewContextInterface.prototype.btnOpenDebug;
/** @type {?Element} */
ViewContextInterface.prototype.debugModal;
/** @type {?Element} */
ViewContextInterface.prototype.btnCloseDebug;
/** @type {?Element} */
ViewContextInterface.prototype.debugModalOverlay;
/** @type {?Element} */
ViewContextInterface.prototype.debugMonitor;
/** @type {?Element} */
ViewContextInterface.prototype.btnClearBookmarks;
/** @type {?Element} */
ViewContextInterface.prototype.btnClearConfig;
/** @type {?Element} */
ViewContextInterface.prototype.btnClearAll;

/** @type {?Element} */
ViewContextInterface.prototype.btnDiagnoseLayout;
/** @type {?Element} */
ViewContextInterface.prototype.btnCopyDebugReport;
/** @type {?HTMLTextAreaElement} */
ViewContextInterface.prototype.diagnoseReportOutput;

/** @type {?HTMLTextAreaElement} */
ViewContextInterface.prototype.debugHistoryJSON;
/** @type {?Element} */
ViewContextInterface.prototype.btnExportHistory;
/** @type {?Element} */
ViewContextInterface.prototype.btnImportHistory;

/** @type {?Element} */
ViewContextInterface.prototype.tabBtnMonitor;
/** @type {?Element} */
ViewContextInterface.prototype.tabBtnDiagnose;
/** @type {?Element} */
ViewContextInterface.prototype.tabContentMonitor;
/** @type {?Element} */
ViewContextInterface.prototype.tabContentDiagnose;

/**
 * @interface
 */
function BookModelInterface() {}
/** @type {string} */
BookModelInterface.prototype.title;
/** @type {string} */
BookModelInterface.prototype.content;
/** @type {string} */
BookModelInterface.prototype.type;
/** @type {number} */
BookModelInterface.prototype.totalPages;
/** @type {number} */
BookModelInterface.prototype.currentPage;
/** @type {!Array} */
BookModelInterface.prototype.toc;
/** @type {function():boolean} */
BookModelInterface.prototype.isEmpty = function() {};
/** @type {function():void} */
BookModelInterface.prototype.clear = function() {};

/**
 * @interface
 */
function ConfigModelInterface() {}
/** @type {string} */
ConfigModelInterface.prototype.theme;
/** @type {string} */
ConfigModelInterface.prototype.font;
/** @type {string} */
ConfigModelInterface.prototype.direction;
/** @type {string} */
ConfigModelInterface.prototype.size;
/** @type {string} */
ConfigModelInterface.prototype.lh;
/** @type {string} */
ConfigModelInterface.prototype.spacing;
/** @type {function():void} */
ConfigModelInterface.prototype.load = function() {};
/** @type {function():void} */
ConfigModelInterface.prototype.save = function() {};
/** @type {function():void} */
ConfigModelInterface.prototype.apply = function() {};

/**
 * @interface
 */
function BookmarkModelInterface() {}
/** @type {number} */
BookmarkModelInterface.prototype.bookmarkProgress;
/** @type {function(string, number):void} */
BookmarkModelInterface.prototype.save = function(fileName, progress) {};
/** @type {function(string):number} */
BookmarkModelInterface.prototype.load = function(fileName) {};
/** @type {function():void} */
BookmarkModelInterface.prototype.clear = function() {};

/**
 * @interface
 * @extends {CommandManagerInterface}
 */
function CommandHistoryInterface() {}
/** @type {!Array} */
CommandHistoryInterface.prototype.commandHistory;
/** @type {number} */
CommandHistoryInterface.prototype.commandIndex;
/** @type {boolean} */
CommandHistoryInterface.prototype.isReplaying;

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

/**
 * @interface
 */
function YuzoraInterface() {}
/** @type {!LocatorInterface} */
YuzoraInterface.prototype.locator;
/** @type {function():void} */
YuzoraInterface.prototype.boot = function() {};
/** @type {function(string):{title: string, body: string}} */
YuzoraInterface.prototype.parseAozoraText = function(text) {};
/** @type {function(string):{title: string, body: string}} */
YuzoraInterface.prototype.parseAozoraHTML = function(html) {};
/** @type {function(string):string} */
YuzoraInterface.prototype.formatAozoraMarkup = function(markup) {};
/** @type {function():string} */
YuzoraInterface.prototype.runLayoutDiagnosis = function() {};
/** @type {function():!Array} */
YuzoraInterface.prototype.getCurrentTOC = function() {};
/** @type {!ConfigModelInterface} */
YuzoraInterface.prototype.config;
/** @type {!CommandHistoryInterface} */
YuzoraInterface.prototype.CommandManager;
/** @type {Function} */
YuzoraInterface.prototype.LoadBookCommand;
/** @type {Function} */
YuzoraInterface.prototype.NavigatePageCommand;
/** @type {Function} */
YuzoraInterface.prototype.UpdateConfigCommand;
/** @type {Function} */
YuzoraInterface.prototype.SyncBookmarkCommand;


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


