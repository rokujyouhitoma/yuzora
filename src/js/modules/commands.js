/**
 * Yuzora - Command Pattern Operations Module
 */
"use strict";

// ==========================================================================
// Command Pattern for Operation History
// ==========================================================================
/**
 * @implements {CommandInterface}
 */
class Command {
    constructor(type) {
        this.type = type;
    }
    /** @override */
    execute() {
        throw new Error("execute() must be implemented");
    }
    /** @override */
    toJSON() {
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
        const bookModel = /** @type {!BookModelInterface} */ (window.locator.resolve(BookModel));
        bookModel.title = this.fileName;
        bookModel.type = this.fileName.endsWith('.html') || this.fileName.endsWith('.xhtml') ? 'html' : 'txt';
        bookModel.content = this.fileContent;
        
        const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
        eventBus.dispatchEvent(new YuzoraEvent(YuzoraEventType.BOOK_LOADED, {
            fileName: this.fileName,
            fileContent: this.fileContent
        }));
    }
    /** @override */
    toJSON() {
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
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
        if (viewContext.readerViewport) {
            const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
            eventBus.dispatchEvent(new YuzoraEvent(YuzoraEventType.NAVIGATE_PAGE, {
                targetPage: this.targetPage
            }));
        }
    }
    /** @override */
    toJSON() {
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
    execute() {
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
        const configModel = /** @type {!ConfigModelInterface} */ (window.locator.resolve(ConfigModel));
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
        
        configModel[this.configKey] = this.configValue;
        updateSettingsUI(this.configKey, this.configValue);
        
        viewContext.isReflowing = true;
        applySettings();
        setTimeout(() => {
            const maxScroll = Math.abs(viewContext.readerViewport.scrollWidth - viewContext.readerViewport.clientWidth);
            if (configModel.direction === 'rtl') {
                viewContext.readerViewport.scrollLeft = -(bookmarkModel.bookmarkProgress * maxScroll);
            } else {
                viewContext.readerViewport.scrollLeft = bookmarkModel.bookmarkProgress * maxScroll;
            }
            viewContext.isReflowing = false;
        }, 150);
        saveSettings();
    }
    /** @override */
    toJSON() {
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
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
        bookmarkModel.bookmarkProgress = this.progress;
    }
    /** @override */
    toJSON() {
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
            const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
            if (viewContext.headerTimeout) clearTimeout(viewContext.headerTimeout);
            hideControls();
        }
    }
    /** @override */
    toJSON() {
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
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
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
    toJSON() {
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
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
        const bookModel = /** @type {!BookModelInterface} */ (window.locator.resolve(BookModel));
        viewContext.welcomeScreen.classList.remove("hidden");
        viewContext.readerScreen.classList.add("hidden");
        localStorage.removeItem("last_read_file_name");
        localStorage.removeItem("last_read_file_content");
        localStorage.removeItem("last_read_file_type");
        bookModel.clear();
    }
    /** @override */
    toJSON() {
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
    execute() {
        const bookmarkModel = /** @type {!BookmarkModelInterface} */ (window.locator.resolve(BookmarkModel));
        if (this.clearType === "bookmarks") {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("bookmark_")) {
                    keys.push(key);
                }
            }
            keys.forEach(k => localStorage.removeItem(k));
            bookmarkModel.bookmarkProgress = 0;
            checkLastSession();
        } else if (this.clearType === "config") {
            localStorage.removeItem("yuzora_config");
            if (!CommandManager.isReplaying) {
                window.location.reload();
            }
        } else if (this.clearType === "all") {
            localStorage.clear();
            if (!CommandManager.isReplaying) {
                window.location.reload();
            }
        }
    }
    /** @override */
    toJSON() {
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
        const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
        eventBus.dispatchEvent(new YuzoraEvent(YuzoraEventType.TOGGLE_DEBUG_MODAL, {
            open: this.open
        }));
    }
    /** @override */
    toJSON() {
        return {
            type: this.type,
            params: {
                open: this.open
            }
        };
    }
}


/**
 * @implements {CommandHistoryInterface}
 */
class CommandHistory {
    constructor() {
        this.commandHistory = [];
        this.commandIndex = 0;
        this.isReplaying = false;
    }

    /** @override */
    undo() {
        console.warn("Undo operation is not implemented.");
    }

    /** @override */
    redo() {
        console.warn("Redo operation is not implemented.");
    }

    isDuplicateCommand(command) {
        if (this.commandHistory.length === 0) return false;
        const lastCmd = this.commandHistory[this.commandHistory.length - 1];
        
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

    /** @override */
    execute(command, isFromReplay = false) {
        // If replaying and user tries to execute normal actions, ignore it
        if (this.isReplaying && !isFromReplay) {
            return;
        }

        // Run command
        command.execute();

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

    /** @override */
    exportJSON() {
        return JSON.stringify(this.commandHistory.map(cmd => cmd.toJSON()), null, 2);
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

    /** @override */
    importJSON(jsonString) {
        try {
            const rawArray = JSON.parse(jsonString);
            if (!Array.isArray(rawArray)) {
                throw new Error("Input operations history must be a JSON array");
            }
            const commands = [];
            for (const item of rawArray) {
                if (!item.type || !item.params) {
                    throw new Error("Invalid command format in history array");
                }
                const cmd = this.recreateCommand(item);
                if (cmd) {
                    commands.push(cmd);
                }
            }
            return commands;
        } catch (err) {
            console.error("Failed to parse operations history JSON:", err);
            alert(`履歴データのインポートに失敗しました:\n${err.message}`);
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
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
        if (viewContext.app) viewContext.app.classList.add('replaying');

        try {
            for (const cmd of commands) {
                // Delay execution by 300ms to allow rendering / transition cycles
                await new Promise(resolve => setTimeout(resolve, 300));
                this.execute(cmd, true);
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
        const eventBus = /** @type {!YuzoraEventTargetInterface} */ (window.locator.resolve(YuzoraEventTarget));
        eventBus.dispatchEvent(new YuzoraEvent(YuzoraEventType.HISTORY_UPDATED, {
            history: this.commandHistory.map(cmd => cmd.toJSON()),
            canUndo: false,
            canRedo: false
        }));
    }

    /** @override */
    updateDebugMonitor() {
        const viewContext = /** @type {!ViewContextInterface} */ (window.locator.resolve(ViewContext));
        if (viewContext.debugMonitor) {
            viewContext.debugMonitor.textContent = `History: ${this.commandHistory.length} operations.`;
        }
    }
}

// Compatibility alias for CommandManagerClass
const CommandManagerClass = CommandHistory;

// Register CommandHistory in Locator
const globalCommandHistory = new CommandHistory();
window.locator.register(CommandHistory, globalCommandHistory);
window.locator.register(CommandManagerClass, globalCommandHistory); // For backwards compatibility

// Compatibility global variable
/** @type {!CommandManagerInterface} */
var CommandManager = /** @type {!CommandManagerInterface} */ (window.locator.resolve(CommandHistory));

