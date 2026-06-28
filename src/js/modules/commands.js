/**
 * Yuzora - Command Pattern Operations Module
 */

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
        currentFileName = this.fileName;
        currentFileType = this.fileName.endsWith('.html') || this.fileName.endsWith('.xhtml') ? 'html' : 'txt';
        currentFileContent = this.fileContent;
        
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
        scrollToPage(this.targetPage);
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
        config[this.configKey] = this.configValue;
        updateSettingsUI(this.configKey, this.configValue);
        
        isReflowing = true;
        applySettings();
        setTimeout(() => {
            const maxScroll = Math.abs(readerViewport.scrollWidth - readerViewport.clientWidth);
            if (config.direction === 'rtl') {
                readerViewport.scrollLeft = -(bookmarkProgress * maxScroll);
            } else {
                readerViewport.scrollLeft = bookmarkProgress * maxScroll;
            }
            isReflowing = false;
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
        bookmarkProgress = this.progress;
        saveBookmark();
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

// Global Operations Command History Manager
var CommandManager = {
    commandHistory: [],
    isReplaying: false,

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
    },

    limitHistorySize() {
        if (this.commandHistory.length <= 100) return;
        // Keep index 0 (LoadBookCommand) protected, discard index 1 (oldest command)
        if (this.commandHistory[0].type === "LoadBook") {
            this.commandHistory.splice(1, 1);
        } else {
            // Fallback in case first command is not load book
            this.commandHistory.shift();
        }
    },

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
            if (debugHistoryJSON) {
                debugHistoryJSON.value = this.exportJSON();
            }
        }
    },

    exportJSON() {
        return JSON.stringify(this.commandHistory.map(cmd => cmd.toJSON()), null, 2);
    },

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
            default:
                throw new Error(`Unknown command type: ${item.type}`);
        }
    },

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
    },

    async replay(commands) {
        if (!commands || commands.length === 0) return;
        
        this.isReplaying = true;
        // Clear current memory history before starting replay
        this.commandHistory = [];
        
        // Mask UI to prevent user interactions during auto replay
        if (app) app.classList.add('replaying');

        try {
            for (const cmd of commands) {
                // Delay execution by 300ms to allow rendering / transition cycles
                await new Promise(resolve => setTimeout(resolve, 300));
                this.execute(cmd, true);
                // Re-populate commandHistory during replay for consistent session state afterward
                this.commandHistory.push(cmd);
            }
            if (debugHistoryJSON) {
                debugHistoryJSON.value = this.exportJSON();
            }
        } catch (err) {
            console.error("Error during auto-replay operation:", err);
        } finally {
            this.isReplaying = false;
            if (app) app.classList.remove('replaying');
        }
    },

    updateDebugMonitor() {
        if (debugMonitor) {
            debugMonitor.textContent = `History: ${this.commandHistory.length} operations.`;
        }
    }
};
