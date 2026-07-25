/**
 * Yuzora - Command Pattern Operations Module
 */
"use strict";


// ==========================================================================
// Command Pattern for Operation History
// ==========================================================================
/**
 * Command base class.
 * @implements {CommandInterface}
 */
class Command {
    constructor(type) {
        this.type = type;
    }
    /**
     * Executes the command.
     * @override
     */
    // @ts-expect-error
    execute() {
        throw new Error("execute() must be implemented");
    }
    /**
     * Converts the command to JSON.
     * @override
     */
    // @ts-expect-error
    serialize() {
        return {
            type: this.type,
            params: {}
        };
    }
}

class LoadBookCommand extends Command {
    constructor(fileName, fileContent) {
        super("LoadBook");
        this.fileName = fileName;
        this.fileContent = fileContent;
    }
    /** @override */
    execute() {
        const resourceDirector = /** @type {!ResourceDirectorInterface} */ (Yuzora.locator.resolve(ResourceDirector));
        const self = this;
        const loaderFn = function() {
            return Promise.resolve(self.fileContent);
        };
        resourceDirector.loadBook(this.fileName, this.fileName, loaderFn)
            .then(function(bookAsset) {
                const currentBookModel = /** @type {?} */ (Yuzora.locator.resolve(BookModel));
                if (!currentBookModel) return;

                currentBookModel.title = bookAsset.id;
                currentBookModel.type = bookAsset.id.endsWith('.html') || bookAsset.id.endsWith('.xhtml') ? 'html' : 'txt';
                currentBookModel.content = bookAsset.content;
                currentBookModel.fileName = self.fileName;
                
                yuzora.publisher.publish(YuzoraEventType.BOOK_LOADED, {
                    fileName: self.fileName,
                    fileContent: self.fileContent
                });
            })
            .catch(function(err) {
                console.error("LoadBookCommand execution failed:", err);
            });
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                fileName: this.fileName,
                fileContent: this.fileContent
            }
        };
    }
}

class NavigatePageCommand extends Command {
    constructor(targetPage) {
        super("NavigatePage");
        this.targetPage = targetPage;
    }
    /** @override */
    execute() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.readerViewport) {
            yuzora.publisher.publish(YuzoraEventType.NAVIGATE_PAGE, {
                targetPage: this.targetPage
            });
        }
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                targetPage: this.targetPage
            }
        };
    }
}

class UpdateConfigCommand extends Command {
    constructor(configKey, configValue) {
        super("UpdateConfig");
        this.configKey = configKey;
        this.configValue = configValue;
    }
    /** @override */
    async execute() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
        
        if (Object.prototype.hasOwnProperty.call(configModel, this.configKey)) {
            configModel[this.configKey] = this.configValue;
        }
        updateSettingsUI(this.configKey, this.configValue);
        
        viewContext.isReflowing = true;
        applySettings();
        DOMUtils.afterReflow(() => {
            const maxScroll = Math.abs(viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth);
            if (configModel.direction === 'rtl') {
                viewContext.readerViewport.scrollLeft = -(bookmarkModel.bookmarkProgress * maxScroll);
            } else {
                viewContext.readerViewport.scrollLeft = bookmarkModel.bookmarkProgress * maxScroll;
            }
            viewContext.isReflowing = false;
        });
        await saveSettings();
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                configKey: this.configKey,
                configValue: this.configValue
            }
        };
    }
}

class SyncBookmarkCommand extends Command {
    constructor(progress) {
        super("SyncBookmark");
        this.progress = progress;
    }
    /** @override */
    execute() {
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
        bookmarkModel.bookmarkProgress = this.progress;
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                progress: this.progress
            }
        };
    }
}

class ToggleControlsCommand extends Command {
    constructor(visible) {
        super("ToggleControls");
        this.visible = visible;
    }
    /** @override */
    execute() {
        if (this.visible) {
            triggerHeaderShow();
        } else {
            const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
            if (viewContext.headerTimeout) clearTimeout(viewContext.headerTimeout);
            hideControls();
        }
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                visible: this.visible
            }
        };
    }
}

class ToggleDrawerCommand extends Command {
    constructor(drawerId, open) {
        super("ToggleDrawer");
        this.drawerId = drawerId;
        this.open = open;
    }
    /** @override */
    execute() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        const drawer = this.drawerId === "settings" ? viewContext.settingsDrawer : viewContext.tocDrawer;
        if (!drawer) return;

        if (this.open) {
            drawer.classList.add("open");
            if (viewContext.drawerOverlay) viewContext.drawerOverlay.classList.add("active");
            if (this.drawerId === "toc") {
                buildTOCList();
                // Note: updateActiveTOCItemUI() is called inside buildTOCList's final renderChunk
                // to ensure active state is applied after all DOM items are populated.
            }
        } else {
            drawer.classList.remove("open");
            // Only hide overlay if both drawers are closed
            const otherDrawer = this.drawerId === "settings" ? viewContext.tocDrawer : viewContext.settingsDrawer;
            if (otherDrawer && !otherDrawer.classList.contains("open")) {
                if (viewContext.drawerOverlay) viewContext.drawerOverlay.classList.remove("active");
            }
        }
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                drawerId: this.drawerId,
                open: this.open
            }
        };
    }
}

class ExitReaderCommand extends Command {
    constructor() {
        super("ExitReader");
    }
    /** @override */
    execute() {
        const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
        const sessionRepo = /** @type {!SessionRepositoryInterface} */ (Yuzora.locator.resolve(SessionRepository));
        const router = /** @type {!RouterInterface} */ (Yuzora.locator.resolve(Router));
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        
        router.navigate("/welcome");
        sessionRepo.clear();
        bookModel.clear();
        
        viewContext.isReflowing = false;
        window['__isReflowing__'] = false;
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {}
        };
    }
}

class ClearStorageCommand extends Command {
    constructor(clearType) {
        super("ClearStorage");
        this.clearType = clearType;
    }
    /** @override */
    async execute() {
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
        const bookmarkRepo = /** @type {!BookmarkRepositoryInterface} */ (Yuzora.locator.resolve(BookmarkRepository));
        const settingsRepo = /** @type {!SettingsRepositoryInterface} */ (Yuzora.locator.resolve(SettingsRepository));
        const sessionRepo = /** @type {!SessionRepositoryInterface} */ (Yuzora.locator.resolve(SessionRepository));
        if (this.clearType === "bookmarks") {
            await bookmarkRepo.clearAll();
            bookmarkModel.bookmarkProgress = 0;
            checkLastSession();
        } else if (this.clearType === "config") {
            await settingsRepo.clear();
            if (!CommandManager.isReplaying) {
                window.location.reload();
            }
        } else if (this.clearType === "all") {
            await Promise.all([
                bookmarkRepo.clearAll(),
                settingsRepo.clear(),
                sessionRepo.clear()
            ]);
            if (!CommandManager.isReplaying) {
                window.location.reload();
            }
        }
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                clearType: this.clearType
            }
        };
    }
}

class ToggleDebugModalCommand extends Command {
    constructor(open) {
        super("ToggleDebugModal");
        this.open = open;
    }
    /** @override */
    execute() {
        yuzora.publisher.publish(YuzoraEventType.TOGGLE_DEBUG_MODAL, {
            open: this.open
        });
    }
    /** @override */
    serialize() {
        return {
            type: this.type,
            params: {
                open: this.open
            }
        };
    }
}


/**
 * CommandHistory class.
 * @implements {CommandManagerInterface}
 */
class CommandHistory {
    constructor() {
        this.commandHistory = [];
        this.commandIndex = 0;
        this.isReplaying = false;
    }

    /**
     * Undoes the last operation.
     * @override
     */
    // @ts-expect-error
    undo() {
        console.warn("Undo operation is not implemented.");
    }

    /**
     * Redoes the last operation.
     * @override
     */
    // @ts-expect-error
    redo() {
        console.warn("Redo operation is not implemented.");
    }

    isDuplicateCommand(command) {
        if (this.commandHistory.length === 0) return false;
        const lastCmd = Array.isArray(this.commandHistory) && this.commandHistory.length > 0 ? this.commandHistory[this.commandHistory.length - 1] : null;
        if (!lastCmd) return false;
        
        if (command.type === "NavigatePage" && lastCmd.type === "NavigatePage") {
            return lastCmd.targetPage === command.targetPage;
        }
        if (command.type === "SyncBookmark" && lastCmd.type === "SyncBookmark") {
            return Math.abs(lastCmd.progress - command.progress) < 0.001;
        }
        return false;
    }

    limitHistorySize() {
        if (this.commandHistory.length <= 100) return;
        // Keep index 0 (LoadBookCommand) protected, discard index 1 (oldest command)
        if (this.commandHistory[0].type === "LoadBook") {
            this.commandHistory.splice(1, 1);
        } else {
            // Fallback in case first command is not load book
            this.commandHistory.shift();
        }
    }

    /**
     * Executes a command and saves it in history.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async execute(command, isFromReplay = false) {
        // If replaying and user tries to execute normal actions, ignore it
        if (this.isReplaying && !isFromReplay) {
            return;
        }

        // Run command
        await command.execute();

        // Record command in history if it is not from replay
        if (!isFromReplay) {
            if (this.isDuplicateCommand(command)) {
                return; // Ignore duplicate consecutive commands
            }

            this.commandHistory.push(command);
            this.limitHistorySize();
            this.commandIndex = this.commandHistory.length;

            this.notifyHistoryUpdated_();
        }
    }

    /**
     * Calculates checksum string for a serialized history payload.
     * @param {!Array} historyData
     * @return {string}
     */
    calculateChecksum(historyData) {
        const jsonStr = JSON.stringify(historyData);
        let hash = 5381;
        for (let i = 0; i < jsonStr.length; i++) {
            hash = ((hash << 5) + hash) + jsonStr.charCodeAt(i);
            hash = hash & hash;
        }
        return (hash >>> 0).toString(16);
    }

    /**
     * Exports history as JSON string with checksum.
     * @override
     */
    // @ts-expect-error
    exportJSON() {
        const historyData = this.commandHistory.map(cmd => cmd.serialize());
        const checksum = this.calculateChecksum(historyData);
        return JSON.stringify({
            version: 1,
            checksum: checksum,
            history: historyData
        }, null, 2);
    }

    recreateCommand(item) {
        switch (item.type) {
            case "LoadBook":
                return new LoadBookCommand(item.params.fileName, item.params.fileContent);
            case "NavigatePage":
                return new NavigatePageCommand(item.params.targetPage);
            case "UpdateConfig":
                return new UpdateConfigCommand(item.params.configKey, item.params.configValue);
            case "SyncBookmark":
                return new SyncBookmarkCommand(item.params.progress);
            case "ToggleControls":
                return new ToggleControlsCommand(item.params.visible);
            case "ToggleDrawer":
                return new ToggleDrawerCommand(item.params.drawerId, item.params.open);
            case "ExitReader":
                return new ExitReaderCommand();
            case "ClearStorage":
                return new ClearStorageCommand(item.params.clearType);
            case "ToggleDebugModal":
                return new ToggleDebugModalCommand(item.params.open);
            default:
                throw new Error(`Unknown command type: ${item.type}`);
        }
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    isValidConfigKeys_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        return keys.length === 2 && keys.indexOf("configKey") !== -1 && keys.indexOf("configValue") !== -1;
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateConfigParam_(params) {
        if (!this.isValidConfigKeys_(params)) return false;
        if (typeof params['configKey'] !== "string" || typeof params['configValue'] !== "string") return false;
        const validValues = {
            theme: ["sepia", "light", "dark", "black"],
            font: ["font-mincho", "font-gothic"],
            direction: ["rtl", "ltr"],
            size: ["size-sm", "size-md", "size-lg", "size-xl"],
            lh: ["line-height-tight", "line-height-normal", "line-height-loose"],
            spacing: ["spacing-tight", "spacing-normal", "spacing-loose"],
            headingPageBreakMode: ["none", "large", "large-medium", "all"]
        };
        const configKey = params['configKey'];
        if (!Object.prototype.hasOwnProperty.call(validValues, configKey)) return false;
        const list = Object.prototype.hasOwnProperty.call(validValues, configKey) ? validValues[configKey] : null;
        return !!list && list.indexOf(params['configValue']) !== -1;
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateLoadBook_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 2) return false;
        if (keys.indexOf("fileName") === -1 || keys.indexOf("fileContent") === -1) return false;
        return typeof params['fileName'] === "string" && typeof params['fileContent'] === "string";
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateNavigatePage_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 1) return false;
        if (keys.indexOf("targetPage") === -1) return false;
        const targetPage = params['targetPage'];
        return typeof targetPage === "number" && !isNaN(targetPage) && Number.isInteger(targetPage) && targetPage >= 1;
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateSyncBookmark_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 1) return false;
        if (keys.indexOf("progress") === -1) return false;
        const progress = params['progress'];
        return typeof progress === "number" && !isNaN(progress) && progress >= 0.0 && progress <= 1.0;
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateToggleControls_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 1) return false;
        if (keys.indexOf("visible") === -1) return false;
        return typeof params['visible'] === "boolean";
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateToggleDrawer_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 2) return false;
        if (keys.indexOf("drawerId") === -1 || keys.indexOf("open") === -1) return false;
        return (params['drawerId'] === "settings" || params['drawerId'] === "toc") && typeof params['open'] === "boolean";
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateClearStorage_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 1) return false;
        if (keys.indexOf("clearType") === -1) return false;
        return ["bookmarks", "config", "all"].indexOf(params['clearType']) !== -1;
    }

    /**
     * @private
     * @param {*} params
     * @return {boolean}
     */
    validateToggleDebugModal_(params) {
        if (!params || typeof params !== "object" || Array.isArray(params)) return false;
        const keys = Object.keys(params);
        if (keys.length !== 1) return false;
        if (keys.indexOf("open") === -1) return false;
        return typeof params['open'] === "boolean";
    }

    /**
     * @private
     * @param {string} type
     * @param {*} params
     * @return {boolean}
     */
    validateParamsByType_(type, params) {
        const validators = {
            "LoadBook": this.validateLoadBook_,
            "NavigatePage": this.validateNavigatePage_,
            "UpdateConfig": this.validateConfigParam_,
            "SyncBookmark": this.validateSyncBookmark_,
            "ToggleControls": this.validateToggleControls_,
            "ToggleDrawer": this.validateToggleDrawer_,
            "ExitReader": (p) => {
                if (!p || typeof p !== "object" || Array.isArray(p)) return false;
                return Object.keys(p).length === 0;
            },
            "ClearStorage": this.validateClearStorage_,
            "ToggleDebugModal": this.validateToggleDebugModal_
        };
        const fn = Object.prototype.hasOwnProperty.call(validators, type) ? validators[type] : null;
        return fn ? fn.call(this, params) : false;
    }

    /**
     * @private
     * @param {*} item
     * @return {boolean}
     */
    isValidCommandStructure_(item) {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        if (typeof item['type'] !== "string") return false;
        return !(!item['params'] || typeof item['params'] !== "object" || Array.isArray(item['params']));
    }

    /**
     * @private
     * @param {*} item
     * @return {boolean}
     */
    isPollutedCommandItem_(item) {
        const gObj = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
        return !!(gObj['hasPrototypePollutionKeys'] && gObj['hasPrototypePollutionKeys'](item));
    }

    /**
     * @private
     * @param {*} item
     * @return {boolean}
     */
    validateCommandItem_(item) {
        if (!this.isValidCommandStructure_(item)) return false;
        if (this.isPollutedCommandItem_(item)) {
            console.warn("Discarding command item containing prototype pollution keys:", item);
            return false;
        }

        const params = /** @type {!Object} */ (item['params']);
        return this.validateParamsByType_(item['type'], params);
    }

    /**
     * @private
     * @param {*} parsed
     * @return {!Array}
     */
    extractRawHistoryArray_(parsed) {
        if (Array.isArray(parsed)) {
            return parsed;
        }
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.history)) {
            if (typeof parsed.checksum === "string") {
                const expectedChecksum = this.calculateChecksum(parsed.history);
                if (parsed.checksum !== expectedChecksum) {
                    console.warn("Checksum mismatch detected in imported history. Data may be corrupted or tampered.");
                    throw new Error("チェックサム不一致: 履歴データが改ざんされているか破損しています");
                }
            }
            return parsed.history;
        }
        throw new Error("Input operations history must be a JSON array or valid wrapper object");
    }

    /**
     * Imports history from JSON string.
     * @override
     */
    // @ts-expect-error
    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            const rawArray = this.extractRawHistoryArray_(parsed);

            const commands = [];
            for (const item of rawArray) {
                if (this.validateCommandItem_(item)) {
                    const cmd = this.recreateCommand(item);
                    if (cmd) {
                        commands.push(cmd);
                    }
                } else {
                    console.warn("Skipping invalid/unsafe command item:", item);
                }
            }
            return commands;
        } catch (err) {
            console.error("Failed to parse operations history JSON:", err);
            alert(`履歴データのインポートに失敗しました:\n${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }

    async replay(commands) {
        if (!commands || commands.length === 0) return;
        
        this.isReplaying = true;
        // Clear current memory history before starting replay
        this.commandHistory = [];
        this.commandIndex = 0;
        
        // Mask UI to prevent user interactions during auto replay
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.app) viewContext.app.classList.add('replaying');

        try {
            for (const cmd of commands) {
                // Delay execution by 300ms to allow rendering / transition cycles
                await TaskScheduler.delay(300);
                await this.execute(cmd, true);
                // Re-populate commandHistory during replay for consistent session state afterward
                this.commandHistory.push(cmd);
                this.commandIndex = this.commandHistory.length;
            }
            this.notifyHistoryUpdated_();
        } catch (err) {
            console.error("Error during auto-replay operation:", err);
        } finally {
            this.isReplaying = false;
            if (viewContext.app) viewContext.app.classList.remove('replaying');
        }
    }

    /**
     * @private
     */
    notifyHistoryUpdated_() {
        yuzora.publisher.publish(YuzoraEventType.HISTORY_UPDATED, {
            history: this.commandHistory.map(cmd => cmd.serialize()),
            canUndo: false,
            canRedo: false
        });
    }

    /**
     * Updates the debug monitor.
     * @override
     */
    // @ts-expect-error
    updateDebugMonitor() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.debugMonitor) {
            const buildIdMeta = /** @type {?HTMLMetaElement} */ (document.querySelector('meta[name="build-id"]'));
            const buildDateMeta = /** @type {?HTMLMetaElement} */ (document.querySelector('meta[name="build-date"]'));
            const rawId = (buildIdMeta && buildIdMeta.content) ? buildIdMeta.content : '';
            const rawDate = (buildDateMeta && buildDateMeta.content) ? buildDateMeta.content : '';
            const buildId = (rawId && rawId !== 'BUILD_ID_PLACEHOLDER') ? rawId : 'dev';
            const buildDate = (rawDate && rawDate !== 'BUILD_DATE_PLACEHOLDER') ? rawDate : '---';
            viewContext.debugMonitor.textContent =
                `Build: ${buildId}  ${buildDate}\nHistory: ${this.commandHistory.length} operations.`;
        }
    }
}

// Compatibility alias for CommandManagerClass
const CommandManagerClass = CommandHistory;

// Register CommandHistory in Locator
const globalCommandHistory = new CommandHistory();
window['Yuzora'].locator.register(CommandHistory, globalCommandHistory);
window['Yuzora'].locator.register(CommandManagerClass, globalCommandHistory); // For backwards compatibility

// Compatibility global variable
/** @type {!CommandManagerInterface} */
var CommandManager = /** @type {!CommandManagerInterface} */ (window['Yuzora'].locator.resolve(CommandHistory));
window['CommandManager'] = CommandManager;
