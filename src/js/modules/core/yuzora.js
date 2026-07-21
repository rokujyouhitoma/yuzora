/**
 * Yuzora - Main Application Controller
 */
"use strict";

/**
 * Yuzora - Main Application Controller
 * @implements {YuzoraInterface}
 */
class Yuzora {
    constructor() {
        /**
         * @public
         * @type {!LocatorInterface}
         */
        this.locator = Yuzora.locator;

        /**
         * @public
         * @type {!PublisherInterface}
         */
        this.publisher = /** @type {!PublisherInterface} */ (this.locator.resolve(Publisher));

        /**
         * @public
         * @type {?ConfigModelInterface}
         */
        this.config = null;
    }

    /**
     * Boots the application.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async boot() {
        const sceneDirector = new SceneDirector();
        sceneDirector.register("initialize", /** @type {!SceneInterface} */ (new InitializeScene()));
        sceneDirector.register("welcome", /** @type {!SceneInterface} */ (new WelcomeScene()));
        sceneDirector.register("reader", /** @type {!SceneInterface} */ (new ReaderScene()));
        this.locator.register(SceneDirector, sceneDirector);

        const router = new Router("welcome");
        this.locator.register(Router, router);

        const resourceDirector = new ResourceDirector();
        this.locator.register(ResourceDirector, resourceDirector);

        const renderer = new VerticalRenderer();
        this.locator.register(VerticalRenderer, renderer);

        this.config = /** @type {!ConfigModel} */ (this.locator.resolve(ConfigModel));

        initializeDOMElements();

        const viewContext = /** @type {!ViewContextInterface} */ (this.locator.resolve(ViewContext));

        // 1. Register Routes
        router.register("/welcome", () => {
            sceneDirector.transitionTo("welcome");
        });

        router.register("/reader", async (params) => {
            if (params["book"]) {
                loadPredefinedBook(params["book"]);
            } else if (params["local"]) {
                const sessionRepo = /** @type {!SessionRepositoryInterface} */ (this.locator.resolve(SessionRepository));
                const lastSession = await sessionRepo.load();
                if (lastSession && lastSession.name === params["local"]) {
                    const resourceDirector = /** @type {!ResourceDirectorInterface} */ (this.locator.resolve(ResourceDirector));
                    const loaderFn = function() {
                        return Promise.resolve(lastSession.content || "");
                    };
                    resourceDirector.loadBook(lastSession.name || "", lastSession.name || "", loaderFn)
                        .then(bookAsset => {
                            if (!this.locator) return;
                            const bookModel = /** @type {?} */ (this.locator.resolve(BookModel));
                            if (!bookModel) return;

                            bookModel.title = bookAsset.id;
                            bookModel.content = bookAsset.content;
                            bookModel.type = bookAsset.id.endsWith('.html') || bookAsset.id.endsWith('.xhtml') ? 'html' : 'txt';
                            this.publisher.publish(YuzoraEventType.BOOK_LOADED, {
                                fileName: bookAsset.id,
                                fileContent: bookAsset.content
                            });
                        })
                        .catch(err => {
                            console.error("Failed to restore session via ResourceDirector:", err);
                            router.navigate("/welcome");
                        });
                } else {
                    alert("ローカルファイルは再ロードが必要です。");
                    router.navigate("/welcome");
                }
            } else {
                router.navigate("/welcome");
            }
        });

        // Reset screen state with initialize scene
        sceneDirector.transitionTo("initialize");

        // Load Settings
        await loadSettings();
        applySettings();

        // Check last session for auto-restore (Only if no hash is explicitly requested)
        const sessionRepo = /** @type {!SessionRepositoryInterface} */ (this.locator.resolve(SessionRepository));
        const lastSession = await sessionRepo.load();
        const currentHash = window.location.hash;

        if (lastSession && lastSession.name && lastSession.content && (!currentHash || currentHash === "#" || currentHash === "#/welcome")) {
            window.location.hash = "#/reader?local=" + encodeURIComponent(lastSession.name);
        }

        // Start routing
        router.listen();

        // Listen to book rendered event to update UI controls and TOC observers
        this.publisher.subscribe(YuzoraEventType.BOOK_RENDERED, () => {
            triggerHeaderShow();
            setupTOCObserver();
        });

        // Listen to debug modal toggles
        this.publisher.subscribe(YuzoraEventType.TOGGLE_DEBUG_MODAL, (detail) => {
            const openDetail = /** @type {{open: boolean}} */ (detail);
            if (openDetail && openDetail.open) {
                openDebugModal();
            } else {
                closeDebugModal();
            }
        });

        // Listen to command history updates
        this.publisher.subscribe(YuzoraEventType.HISTORY_UPDATED, (detail) => {
            const historyDetail = /** @type {{history: !Array<!Object>}} */ (detail);
            if (viewContext.debugHistoryJSON && historyDetail && historyDetail.history) {
                viewContext.debugHistoryJSON.value = JSON.stringify(historyDetail.history, null, 2);
            }
        });

        // Listen to page changed events to trigger layout validation
        this.publisher.subscribe(YuzoraEventType.PAGE_CHANGED, () => {
            const renderer = /** @type {!VerticalRenderer} */ (this.locator.resolve(VerticalRenderer));
            if (renderer.isRepairing) return;
            setTimeout(() => {
                this.publisher.publish(YuzoraEventType.LAYOUT_CHECK_REQUESTED, { scope: 'current' });
            }, 0);
        });

        // Listen to layout check requests
        this.publisher.subscribe(YuzoraEventType.LAYOUT_CHECK_REQUESTED, (detail) => {
            const renderer = /** @type {!VerticalRenderer} */ (this.locator.resolve(VerticalRenderer));
            const checkDetail = /** @type {{scope: string}} */ (detail);
            if (checkDetail && checkDetail.scope === 'current') {
                // Lightweight read-only check flanking current page
                if (renderer.hasOverrunNearCurrentPage()) {
                    setTimeout(() => {
                        this.publisher.publish(YuzoraEventType.LAYOUT_REPAIR_REQUESTED);
                    }, 0);
                }
            } else {
                // "all" scope (e.g. load book, resize) - trigger repair unconditionally
                setTimeout(() => {
                    this.publisher.publish(YuzoraEventType.LAYOUT_REPAIR_REQUESTED);
                }, 0);
            }
        });
    }

    /**
     * Parses text.
     * @param {string} text
     * @return {{title: string, body: string}}
     * @override
     */
    // @ts-expect-error
    parseAozoraText(text) {
        return /** @type {!AozoraParserInterface} */ (this.locator.resolve(AozoraParser)).parseAozoraText(text);
    }

    /**
     * Parses HTML.
     * @param {string} html
     * @return {{title: string, body: string}}
     * @override
     */
    // @ts-expect-error
    parseAozoraHTML(html) {
        return /** @type {!AozoraParserInterface} */ (this.locator.resolve(AozoraParser)).parseAozoraHTML(html);
    }

    /**
     * Formats markup.
     * @param {string} markup
     * @return {string}
     * @override
     */
    // @ts-expect-error
    formatAozoraMarkup(markup) {
        return /** @type {!AozoraParserInterface} */ (this.locator.resolve(AozoraParser)).formatAozoraMarkup(markup);
    }

    /**
     * Runs layout diagnosis.
     * @return {!Promise<string>}
     * @override
     */
    // @ts-expect-error
    async runLayoutDiagnosis() {
        return await runLayoutDiagnosis();
    }

    /**
     * Gets TOC.
     * @return {!Array}
     * @override
     */
    // @ts-expect-error
    getCurrentTOC() {
        return this.locator.resolve(BookModel).toc;
    }

    /**
     * Gets CommandManager.
     * @override
     */
    // @ts-expect-error
    get CommandManager() {
        return this.locator.resolve(CommandHistory);
    }

    /**
     * Gets BookModel constructor.
     * @override
     */
    // @ts-expect-error
    get BookModel() {
        return BookModel;
    }

    /**
     * Gets ConfigModel constructor.
     * @override
     */
    // @ts-expect-error
    get ConfigModel() {
        return ConfigModel;
    }

    /**
     * Gets BookmarkModel constructor.
     * @override
     */
    // @ts-expect-error
    get BookmarkModel() {
        return BookmarkModel;
    }

    /**
     * Gets LoadBookCommand constructor.
     * @override
     */
    // @ts-expect-error
    get LoadBookCommand() {
        return LoadBookCommand;
    }

    /**
     * Gets NavigatePageCommand constructor.
     * @override
     */
    // @ts-expect-error
    get NavigatePageCommand() {
        return NavigatePageCommand;
    }

    /**
     * Gets UpdateConfigCommand constructor.
     * @override
     */
    // @ts-expect-error
    get UpdateConfigCommand() {
        return UpdateConfigCommand;
    }

    /**
     * Gets SyncBookmarkCommand constructor.
     * @override
     */
    // @ts-expect-error
    get SyncBookmarkCommand() {
        return SyncBookmarkCommand;
    }

    /**
     * Gets VerticalRenderer constructor.
     * @override
     */
    // @ts-expect-error
    get VerticalRenderer() {
        return VerticalRenderer;
    }

    /**
     * Gets ViewContext constructor.
     * @override
     */
    // @ts-expect-error
    get ViewContext() {
        return ViewContext;
    }

    /**
     * Gets AozoraTokenizer constructor.
     * @override
     */
    // @ts-expect-error
    get AozoraTokenizer() {
        return AozoraTokenizer;
    }

    /**
     * Gets AozoraParser constructor.
     * @override
     */
    // @ts-expect-error
    get AozoraParser() {
        return AozoraParser;
    }

    /**
     * Gets AozoraSemanticAnalyzer constructor.
     * @override
     */
    // @ts-expect-error
    get AozoraSemanticAnalyzer() {
        return AozoraSemanticAnalyzer;
    }

    /**
     * Gets AozoraEvaluator constructor.
     * @override
     */
    // @ts-expect-error
    get AozoraEvaluator() {
        return AozoraEvaluator;
    }

    /**
     * Gets ASTNode constructor.
     * @override
     */
    // @ts-expect-error
    get ASTNode() {
        return ASTNode;
    }
}

const existingLocator = window['Yuzora'] ? window['Yuzora'].locator : null;
/**
 * @type {!LocatorInterface}
 * @nocollapse
 */
Yuzora.locator = /** @type {!LocatorInterface} */ (existingLocator || locator);

// Instantiate and register yuzora immediately to prevent race conditions during DOMContentLoaded
const yuzoraInstance = new Yuzora();
Yuzora.locator.register(Yuzora, yuzoraInstance);
Yuzora.locator.register(AozoraTokenizer, new AozoraTokenizer());
Yuzora.locator.register(AozoraSemanticAnalyzer, new AozoraSemanticAnalyzer());
Yuzora.locator.register(AozoraEvaluator, new AozoraEvaluator());
Yuzora.locator.register(AozoraParser, new AozoraParser());

window['yuzora'] = /** @type {*} */ (yuzoraInstance);
window['Yuzora'] = /** @type {*} */ (yuzoraInstance);

// Global browser bootstrap entry point
document.addEventListener("DOMContentLoaded", () => {
    yuzoraInstance.boot();
});
