// @ts-nocheck
/**
 * @fileoverview Externs for Yuzora legacy global proxy variables and ADVANCED_OPTIMIZATIONS protection
 * @externs
 */

// Global variables
var localStorageKeys;
var localStorage;

// Repository Interface definition in externs
/**
 * @interface
 */
function RepositoryInterface() {}
/**
 * @param {string} key
 * @return {!Promise<?string>}
 */
RepositoryInterface.prototype.get = function(key) {};
/**
 * @param {string} key
 * @param {string} value
 * @return {!Promise<void>}
 */
RepositoryInterface.prototype.save = function(key, value) {};
/**
 * @param {string} key
 * @return {!Promise<void>}
 */
RepositoryInterface.prototype.delete = function(key) {};
/**
 * @return {!Promise<!Array<string>>}
 */
RepositoryInterface.prototype.keys = function() {};
/**
 * @return {!Promise<void>}
 */
RepositoryInterface.prototype.clear = function() {};

// SettingsRepository Interface definition in externs
/**
 * @interface
 */
function SettingsRepositoryInterface() {}
/**
 * @return {!Promise<!Object<string, string>>}
 */
SettingsRepositoryInterface.prototype.load = function() {};
/**
 * @param {!Object<string, string>} configObject
 * @return {!Promise<void>}
 */
SettingsRepositoryInterface.prototype.save = function(configObject) {};
/**
 * @return {!Promise<void>}
 */
SettingsRepositoryInterface.prototype.clear = function() {};

// BookmarkRepository Interface definition in externs
/**
 * @interface
 */
function BookmarkRepositoryInterface() {}
/**
 * @param {string} fileName
 * @return {!Promise<number>}
 */
BookmarkRepositoryInterface.prototype.load = function(fileName) {};
/**
 * @param {string} fileName
 * @param {number} progress
 * @return {!Promise<void>}
 */
BookmarkRepositoryInterface.prototype.save = function(fileName, progress) {};
/**
 * @return {!Promise<void>}
 */
BookmarkRepositoryInterface.prototype.clearAll = function() {};

// SessionRepository Interface definition in externs
/**
 * @interface
 */
function SessionRepositoryInterface() {}
/**
 * @return {!Promise<{name: ?string, content: ?string, type: ?string}>}
 */
SessionRepositoryInterface.prototype.load = function() {};
/**
 * @param {string} name
 * @param {string} content
 * @param {string} type
 * @return {!Promise<void>}
 */
SessionRepositoryInterface.prototype.save = function(name, content, type) {};
/**
 * @return {!Promise<void>}
 */
SessionRepositoryInterface.prototype.clear = function() {};


// LibraryRepository Interface definition in externs
/**
 * @interface
 */
function LibraryRepositoryInterface() {}
/**
 * @param {string} fileName
 * @param {string} title
 * @param {string} author
 * @param {string} content
 * @param {string} fileType
 * @return {!Promise<void>}
 */
LibraryRepositoryInterface.prototype.saveBook = function(fileName, title, author, content, fileType) {};
/**
 * @return {!Promise<!Array<!Object>>}
 */
LibraryRepositoryInterface.prototype.getBooks = function() {};
/**
 * @param {string} fileName
 * @return {!Promise<?Object>}
 */
LibraryRepositoryInterface.prototype.getBook = function(fileName) {};
/**
 * @param {string} fileName
 * @return {!Promise<void>}
 */
LibraryRepositoryInterface.prototype.deleteBook = function(fileName) {};
/**
 * @return {!Promise<void>}
 */
LibraryRepositoryInterface.prototype.clearAll = function() {};


// Window prototype expansions
/** @type {!LocatorInterface} */
Window.prototype.locator;

/** @type {function(new:YuzoraInterface)} */
Window.prototype.Yuzora;
/** @type {!YuzoraInterface} */
Window.prototype.yuzora;
/** @type {Object} */
Window.prototype.YuzoraEvent;
/** @type {Object} */
Window.prototype.YuzoraEventTarget;
/** @type {Object} */
Window.prototype.ScopedEventTarget;
/** @type {Object} */
Window.prototype.YuzoraEventType;
/** @type {Object} */
Window.prototype.Publisher;
/** @type {boolean} */
Window.prototype.__DEBUG_EVENT__;
/** @type {boolean} */
Window.prototype.__DEBUG_PERFORMANCE__;
/** @type {Function} */
Window.prototype.hasPrototypePollutionKeys;

/** @type {!YuzoraInterface} */
var yuzora;

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
 * @param {?} Class
 * @return {?}
 */
LocatorInterface.prototype.resolve = function(Class) {};
/**
 * @param {?} Class
 * @return {?}
 */
LocatorInterface.prototype.locate = function(Class) {};
/**
 * @param {?} Class
 * @param {!Object} instance
 */
LocatorInterface.prototype.register = function(Class, instance) {};

/**
 * @typedef {{
 *   title: string,
 *   body: string,
 *   metadata: (Object|undefined)
 * }}
 */
var ParsedDocument;

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
CommandInterface.prototype.serialize = function() {};

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
/** @type {?number} */
ViewContextInterface.prototype.cachedScrollWidth;
/** @type {?number} */
ViewContextInterface.prototype.cachedClientWidth;
/** @type {?number} */
ViewContextInterface.prototype.progressAnimationFrameId;
/** @type {boolean} */
ViewContextInterface.prototype.isSnapping;
/** @type {?number} */
ViewContextInterface.prototype.scrollStartTimestamp;
/** @type {number} */
ViewContextInterface.prototype.scrollEventCount;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.app;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.welcomeScreen;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerScreen;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.dropZone;
/** @type {?HTMLInputElement} */
ViewContextInterface.prototype.fileInput;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerViewport;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerContent;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.bookTitle;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnBack;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnSettings;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnTOC;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnFirstPage;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnCloseSettings;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnCloseTOC;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.settingsDrawer;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.tocDrawer;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.tocList;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.drawerOverlay;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.pageNavLeft;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.pageNavRight;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerHeader;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerFooter;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.progressBarContainer;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.progressBar;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readingPercentage;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readingIndex;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.developerBooksGrid;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.readerBooksGrid;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnOpenDebug;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.debugModal;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnCloseDebug;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.debugModalOverlay;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.debugMonitor;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnClearBookmarks;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnClearConfig;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnClearAll;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnDiagnoseLayout;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnCopyDebugReport;
/** @type {?HTMLTextAreaElement} */
ViewContextInterface.prototype.diagnoseReportOutput;

/** @type {?HTMLTextAreaElement} */
ViewContextInterface.prototype.debugHistoryJSON;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnExportHistory;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.btnImportHistory;

/** @type {?HTMLElement} */
ViewContextInterface.prototype.tabBtnMonitor;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.tabBtnDiagnose;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.tabContentMonitor;
/** @type {?HTMLElement} */
ViewContextInterface.prototype.tabContentDiagnose;

/**
 * @interface
 */
function BookModelInterface() {}
/** @type {string} */
BookModelInterface.prototype.title;
/** @type {string} */
BookModelInterface.prototype.author;
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
/** @type {string} */
ConfigModelInterface.prototype.headingPageBreakMode;
/** @type {function():!Promise<void>} */
ConfigModelInterface.prototype.load = function() {};
/** @type {function():!Promise<void>} */
ConfigModelInterface.prototype.save = function() {};
/** @type {function():void} */
ConfigModelInterface.prototype.apply = function() {};

/**
 * @interface
 */
function BookmarkModelInterface() {}
/** @type {number} */
BookmarkModelInterface.prototype.bookmarkProgress;
/** @type {function(string, number):!Promise<void>} */
BookmarkModelInterface.prototype.save = function(fileName, progress) {};
/** @type {function(string):!Promise<number>} */
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
Object.prototype.passesCount;
/** @type {?} */
Object.prototype.insertedCount;
/** @type {?} */
Object.prototype.durationMs;
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
/** @type {?} */
Object.prototype.storage;
/** @type {?} */
Object.prototype.store;
/** @type {?} */
Object.prototype._KEY;
/** @type {?} */
Object.prototype._PREFIX;
/** @type {?} */
Object.prototype._KEY_NAME;
/** @type {?} */
Object.prototype._KEY_CONTENT;
/** @type {?} */
Object.prototype._KEY_TYPE;
/** @type {?} */
Object.prototype.params;
/** @type {?} */
Object.prototype.drawerId;
/** @type {?} */
Object.prototype.clearType;


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
/** @type {!PublisherInterface} */
YuzoraInterface.prototype.publisher;
/** @type {function(new:YuzoraInterface)} */
YuzoraInterface.prototype.constructor;
/** @type {!LocatorInterface} */
YuzoraInterface.prototype.constructor.locator;
/** @type {function():!Promise<void>} */
YuzoraInterface.prototype.boot = function() {};
/** @type {function(string):{title: string, body: string}} */
YuzoraInterface.prototype.parseAozoraText = function(text) {};
/** @type {function(string):{title: string, body: string}} */
YuzoraInterface.prototype.parseAozoraHTML = function(html) {};
/** @type {function(string):string} */
YuzoraInterface.prototype.formatAozoraMarkup = function(markup) {};
/** @type {function():!Promise<string>} */
YuzoraInterface.prototype.runLayoutDiagnosis = function() {};
/** @type {function():!Array} */
YuzoraInterface.prototype.getCurrentTOC = function() {};
/** @type {?ConfigModelInterface} */
YuzoraInterface.prototype.config;
/** @type {Function} */
YuzoraInterface.prototype.BookModel;
/** @type {Function} */
YuzoraInterface.prototype.ConfigModel;
/** @type {Function} */
YuzoraInterface.prototype.BookmarkModel;
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
YuzoraInterface.prototype.VerticalRenderer;
YuzoraInterface.prototype.ViewContext;
YuzoraInterface.prototype.AozoraTokenizer;
YuzoraInterface.prototype.AozoraParser;
YuzoraInterface.prototype.AozoraSemanticAnalyzer;
YuzoraInterface.prototype.AozoraEvaluator;
YuzoraInterface.prototype.ASTNode;


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
/**
 * @param {string} scopePrefix
 * @return {!YuzoraEventTargetInterface}
 */
YuzoraEventTargetInterface.prototype.scoped = function(scopePrefix) {};

// Publisher Interface definition
/**
 * @interface
 */
function PublisherInterface() {}
/**
 * @param {string} topic
 * @param {function(*):void} callback
 */
PublisherInterface.prototype.subscribe = function(topic, callback) {};
/**
 * @param {string} topic
 * @param {function(*):void} callback
 */
PublisherInterface.prototype.unsubscribe = function(topic, callback) {};
/**
 * @param {string} topic
 * @param {*=} data
 */
PublisherInterface.prototype.publish = function(topic, data) {};


// Scene Interface definition
/**
 * @interface
 */
function SceneInterface() {}
/**
 * @param {*=} data
 */
SceneInterface.prototype.enter = function(data) {};
SceneInterface.prototype.exit = function() {};

// SceneDirector Interface definition
/**
 * @interface
 */
function SceneDirectorInterface() {}
/**
 * @param {string} sceneName
 * @param {!SceneInterface} sceneInstance
 */
SceneDirectorInterface.prototype.register = function(sceneName, sceneInstance) {};
/**
 * @param {string} sceneName
 * @param {*=} data
 */
SceneDirectorInterface.prototype.transitionTo = function(sceneName, data) {};
/** @type {?string} */
SceneDirectorInterface.prototype.currentSceneName;
/** @type {boolean} */
SceneDirectorInterface.prototype.isTransitioning;

// Router Interface definition
/**
 * @interface
 */
function RouterInterface() {}
/**
 * @param {string} pattern
 * @param {!Function} callback
 */
RouterInterface.prototype.register = function(pattern, callback) {};
/**
 * @param {string} hash
 * @return {boolean}
 */
RouterInterface.prototype.resolve = function(hash) {};
RouterInterface.prototype.listen = function() {};
/**
 * @param {string} hash
 */
RouterInterface.prototype.navigate = function(hash) {};
/** @type {?string} */
RouterInterface.prototype.currentHash;

// Asset Interface definition
/**
 * @interface
 */
function AssetInterface() {}
/** @type {string} */
AssetInterface.prototype.id;
/** @type {string} */
AssetInterface.prototype.type;
/** @type {string} */
AssetInterface.prototype.status;
/** @type {?Error} */
AssetInterface.prototype.error;
AssetInterface.prototype.dispose = function() {};

// BookAsset Interface definition
/**
 * @interface
 * @extends {AssetInterface}
 */
function BookAssetInterface() {}
/** @type {string} */
BookAssetInterface.prototype.title;
/** @type {string} */
BookAssetInterface.prototype.content;
/** @type {!Array} */
BookAssetInterface.prototype.toc;

// ResourceDirector Interface definition
/**
 * @interface
 */
function ResourceDirectorInterface() {}
/** @type {!Map<string, !Asset>} */
ResourceDirectorInterface.prototype.assets;
/**
 * @param {string} id
 * @param {string} source
 * @param {function(): !Promise<string>} loaderFn
 * @return {!Promise<!BookAsset>}
 */
ResourceDirectorInterface.prototype.loadBook = function(id, source, loaderFn) {};
/**
 * @param {string} id
 */
ResourceDirectorInterface.prototype.unload = function(id) {};
ResourceDirectorInterface.prototype.clear = function() {};

// Renderer Interface definition
/**
 * @interface
 */
function RendererInterface() {}
/**
 * @param {string} htmlContent
 */
RendererInterface.prototype.render = function(htmlContent) {};
/**
 * @param {string} htmlContent
 */
RendererInterface.prototype.appendRender = function(htmlContent) {};
/**
 * @param {number} progress
 * @param {boolean=} smooth
 */
RendererInterface.prototype.restoreScrollPosition = function(progress, smooth) {};
/**
 * @param {number} pageNumber
 * @return {!Promise<void>}
 */
RendererInterface.prototype.scrollToPage = function(pageNumber) {};
/**
 * @param {number} progress
 * @return {!Promise<void>}
 */
RendererInterface.prototype.handleResize = function(progress) {};
/**
 * @return {!Promise<void>}
 */
RendererInterface.prototype.adjustPageBreaksForOverrun = function() {};
/**
 * @return {boolean}
 */
RendererInterface.prototype.hasOverrunNearCurrentPage = function() {};
/** @type {!Object} */
RendererInterface.prototype.lastRepairMetrics;
/** @type {boolean} */
RendererInterface.prototype.isRepairing;
/** @type {!Array<!Object>} */
RendererInterface.prototype.paragraphBoundsCache;
RendererInterface.prototype.cacheParagraphBounds = function() {};

// AozoraTokenizerInterface
/** @interface */
function AozoraTokenizerInterface() {}
/** @param {string} text */
AozoraTokenizerInterface.prototype.tokenizeInline = function(text) {};
/** @param {string} text */
AozoraTokenizerInterface.prototype.tokenize = function(text) {};

// ASTNodeInterface
/** @interface */
function ASTNodeInterface() {}
/** @type {string} */
ASTNodeInterface.prototype.type;
/** @type {string|undefined} */
ASTNodeInterface.prototype.value;
/** @type {string|undefined} */
ASTNodeInterface.prototype.rt;
/** @type {!Array<!ASTNodeInterface>|undefined} */
ASTNodeInterface.prototype.children;
/** @type {string|undefined} */
ASTNodeInterface.prototype.title;
/** @type {string|undefined} */
ASTNodeInterface.prototype.author;
/** @type {number|undefined} */
ASTNodeInterface.prototype.level;
/** @type {string|undefined} */
ASTNodeInterface.prototype.headingId;
/** @type {string|undefined} */
ASTNodeInterface.prototype.jisageClass;
/** @type {string|undefined} */
ASTNodeInterface.prototype.alignmentClass;

// AozoraParserInterface
/** @interface */
function AozoraParserInterface() {}
/** @param {!Array} tokens */
AozoraParserInterface.prototype.parseTokensToAST = function(tokens) {};
/** @param {string} text */
AozoraParserInterface.prototype.parseAozoraText = function(text) {};
/** @param {string} htmlString */
AozoraParserInterface.prototype.parseAozoraHTML = function(htmlString) {};
/** @param {string} line */
AozoraParserInterface.prototype.formatAozoraMarkup = function(line) {};
/**
 * @param {string} text
 * @param {function(string, string, string): (void|!Promise<void>)} onFirstChunkReady
 * @param {function(string): void} onChunkParsed
 * @param {function(): void} onComplete
 * @param {function(): boolean} shouldCancel
 * @return {!Promise<void>}
 */
AozoraParserInterface.prototype.parseAozoraTextIncremental = function(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel) {};
/** @param {string} text */
AozoraParserInterface.prototype.parseText = function(text) {};
/** @param {string} htmlString */
AozoraParserInterface.prototype.parseHTML = function(htmlString) {};
/** @param {string} line */
AozoraParserInterface.prototype.formatMarkup = function(line) {};
/**
 * @param {string} text
 * @param {function(string, string, string): (void|!Promise<void>)} onFirstChunkReady
 * @param {function(string): void} onChunkParsed
 * @param {function(): void} onComplete
 * @param {function(): boolean} shouldCancel
 * @return {!Promise<void>}
 */
AozoraParserInterface.prototype.parseTextIncremental = function(text, onFirstChunkReady, onChunkParsed, onComplete, shouldCancel) {};

// AozoraSemanticAnalyzerInterface
/** @interface */
function AozoraSemanticAnalyzerInterface() {}
/** @param {!ASTNodeInterface} astRoot */
AozoraSemanticAnalyzerInterface.prototype.analyze = function(astRoot) {};

// AozoraEvaluatorInterface
/** @interface */
function AozoraEvaluatorInterface() {}
/** @param {!ASTNodeInterface} astRoot */
AozoraEvaluatorInterface.prototype.evaluate = function(astRoot) {};
/** @param {string} str */
AozoraEvaluatorInterface.prototype.escapeHTML = function(str) {};
/** @param {!Element} rootElement */
AozoraEvaluatorInterface.prototype.sanitizeDOM = function(rootElement) {};

/** @type {number} */
var docLeft;
/** @type {number} */
var docRight;
