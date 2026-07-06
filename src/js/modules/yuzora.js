/**
 * Yuzora - Main Application Controller
 */
"use strict";

/**
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
    }

    /** @override */
    boot() {
        const sceneDirector = new SceneDirector();
        sceneDirector.register("initialize", new InitializeScene());
        sceneDirector.register("welcome", new WelcomeScene());
        sceneDirector.register("reader", new ReaderScene());
        this.locator.register(SceneDirector, sceneDirector);

        const router = new Router("welcome");
        this.locator.register(Router, router);

        const resourceDirector = new ResourceDirector();
        this.locator.register(ResourceDirector, resourceDirector);

        initializeDOMElements();

        const viewContext = /** @type {!ViewContextInterface} */ (this.locator.resolve(ViewContext));

        // 1. Register Routes
        router.register("/welcome", () => {
            sceneDirector.transitionTo("welcome");
        });

        router.register("/reader", (params) => {
            if (params["book"]) {
                loadPredefinedBook(params["book"]);
            } else if (params["local"]) {
                const sessionRepo = /** @type {!SessionRepositoryInterface} */ (this.locator.resolve(SessionRepository));
                const lastSession = sessionRepo.load();
                if (lastSession && lastSession.name === params["local"]) {
                    const resourceDirector = /** @type {!ResourceDirectorInterface} */ (this.locator.resolve(ResourceDirector));
                    const loaderFn = function() {
                        return Promise.resolve(lastSession.content || "");
                    };
                    resourceDirector.loadBook(lastSession.name || "", lastSession.name || "", loaderFn)
                        .then(bookAsset => {
                            const bookModel = /** @type {!BookModelInterface} */ (this.locator.resolve(BookModel));
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
        loadSettings();
        applySettings();

        // Check last session for auto-restore (Only if no hash is explicitly requested)
        const sessionRepo = /** @type {!SessionRepositoryInterface} */ (this.locator.resolve(SessionRepository));
        const lastSession = sessionRepo.load();
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
    }

    /**
     * @override
     * @param {string} text
     * @return {{title: string, body: string}}
     */
    parseAozoraText(text) {
        return parseAozoraText(text);
    }

    /**
     * @override
     * @param {string} html
     * @return {{title: string, body: string}}
     */
    parseAozoraHTML(html) {
        return parseAozoraHTML(html);
    }

    /**
     * @override
     * @param {string} markup
     * @return {string}
     */
    formatAozoraMarkup(markup) {
        return formatAozoraMarkup(markup);
    }

    /**
     * @override
     * @return {string}
     */
    runLayoutDiagnosis() {
        return runLayoutDiagnosis();
    }

    /**
     * @override
     * @return {!Array}
     */
    getCurrentTOC() {
        return this.locator.resolve(BookModel).toc;
    }

    /** @override */
    get config() {
        return this.locator.resolve(ConfigModel);
    }

    /** @override */
    get CommandManager() {
        return this.locator.resolve(CommandHistory);
    }

    /** @override */
    get LoadBookCommand() {
        return LoadBookCommand;
    }

    /** @override */
    get NavigatePageCommand() {
        return NavigatePageCommand;
    }

    /** @override */
    get UpdateConfigCommand() {
        return UpdateConfigCommand;
    }

    /** @override */
    get SyncBookmarkCommand() {
        return SyncBookmarkCommand;
    }
}

/**
 * @type {!LocatorInterface}
 * @nocollapse
 */
Yuzora.locator = locator;

// Instantiate and register yuzora immediately to prevent race conditions during DOMContentLoaded
const yuzoraInstance = new Yuzora();
Yuzora.locator.register(Yuzora, yuzoraInstance);
window['yuzora'] = yuzoraInstance;
window['Yuzora'] = yuzoraInstance;

// Global browser bootstrap entry point
document.addEventListener("DOMContentLoaded", () => {
    yuzoraInstance.boot();
});
