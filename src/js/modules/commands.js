/**
 * Yuzora - Command Pattern Operations Module
 */
"use strict";

// ==========================================================================
// Command Pattern for Operation History
// ==========================================================================
class Command {
    constructor(type) {
        this.type = type;
    }
    execute() {
        throw new Error("execute() must be implemented");
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        state.currentFileName = this.fileName;
        state.currentFileType = this.fileName.endsWith('.html') || this.fileName.endsWith('.xhtml') ? 'html' : 'txt';
        state.currentFileContent = this.fileContent;
        
        displayBook();
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        if (state.readerViewport) {
            scrollToPage(this.targetPage);
        }
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        state.config[this.configKey] = this.configValue;
        updateSettingsUI(this.configKey, this.configValue);
        
        state.isReflowing = true;
        applySettings();
        setTimeout(() => {
            const maxScroll = Math.abs(state.readerViewport.scrollWidth - state.readerViewport.clientWidth);
            if (state.config.direction === 'rtl') {
                state.readerViewport.scrollLeft = -(state.bookmarkProgress * maxScroll);
            } else {
                state.readerViewport.scrollLeft = state.bookmarkProgress * maxScroll;
            }
            state.isReflowing = false;
        }, 150);
        saveSettings();
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        state.bookmarkProgress = this.progress;
    }
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
    execute() {
        if (this.visible) {
            triggerHeaderShow();
        } else {
            const state = window.locator.resolve(AppState);
            if (state.headerTimeout) clearTimeout(state.headerTimeout);
            hideControls();
        }
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        const drawer = this.drawerId === "settings" ? state.settingsDrawer : state.tocDrawer;
        if (!drawer) return;

        if (this.open) {
            drawer.classList.add("open");
            if (state.drawerOverlay) state.drawerOverlay.classList.add("active");
            if (this.drawerId === "toc") {
                buildTOCList();
                // Note: updateActiveTOCItemUI() is called inside buildTOCList's final renderChunk
                // to ensure active state is applied after all DOM items are populated.
            }
        } else {
            drawer.classList.remove("open");
            // Only hide overlay if both drawers are closed
            const otherDrawer = this.drawerId === "settings" ? state.tocDrawer : state.settingsDrawer;
            if (otherDrawer && !otherDrawer.classList.contains("open")) {
                if (state.drawerOverlay) state.drawerOverlay.classList.remove("active");
            }
        }
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        state.welcomeScreen.classList.remove("hidden");
        state.readerScreen.classList.add("hidden");
        localStorage.removeItem("last_read_file_name");
        localStorage.removeItem("last_read_file_content");
        localStorage.removeItem("last_read_file_type");
        state.currentFileName = "";
        state.currentFileContent = "";
        state.currentFileType = "";
    }
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
    execute() {
        const state = window.locator.resolve(AppState);
        if (this.clearType === "bookmarks") {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("bookmark_")) {
                    keys.push(key);
                }
            }
            keys.forEach(k => localStorage.removeItem(k));
            state.bookmarkProgress = 0;
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
    execute() {
        if (this.open) {
            openDebugModal();
        } else {
            closeDebugModal();
        }
    }
    toJSON() {
        return {
            type: this.type,
            params: {
                open: this.open
            }
        };
    }
}


// Global Operations Command History Manager
class CommandManagerClass {
    constructor() {
        this.commandHistory = [];
        this.isReplaying = false;
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

            // Update debug text area with latest history JSON string
            const state = window.locator.resolve(AppState);
            if (state.debugHistoryJSON) {
                state.debugHistoryJSON.value = this.exportJSON();
            }
        }
    }

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
        
        // Mask UI to prevent user interactions during auto replay
        const state = window.locator.resolve(AppState);
        if (state.app) state.app.classList.add('replaying');

        try {
            for (const cmd of commands) {
                // Delay execution by 300ms to allow rendering / transition cycles
                await new Promise(resolve => setTimeout(resolve, 300));
                this.execute(cmd, true);
                // Re-populate commandHistory during replay for consistent session state afterward
                this.commandHistory.push(cmd);
            }
            if (state.debugHistoryJSON) {
                state.debugHistoryJSON.value = this.exportJSON();
            }
        } catch (err) {
            console.error("Error during auto-replay operation:", err);
        } finally {
            this.isReplaying = false;
            if (state.app) state.app.classList.remove('replaying');
        }
    }

    updateDebugMonitor() {
        const state = window.locator.resolve(AppState);
        if (state.debugMonitor) {
            state.debugMonitor.textContent = `History: ${this.commandHistory.length} operations.`;
        }
    }
}

// Register CommandManagerClass in Locator
window.locator.register(CommandManagerClass, new CommandManagerClass());

// Compatibility global variable
var CommandManager = window.locator.resolve(CommandManagerClass);
