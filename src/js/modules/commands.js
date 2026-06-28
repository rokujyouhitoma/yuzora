/**
 * Yuzora - Command Pattern Operations Module
 */

// ==========================================================================
// Command Pattern for Operation History
// ==========================================================================
class Command {
    execute() {}
    undo() {}
    serialize() { return {}; }
}

class NavigatePageCommand extends Command {
    constructor(targetPage) {
        super();
        this.targetPage = targetPage;
        this.previousPage = 1;
    }

    execute() {
        const clientWidth = readerViewport.clientWidth;
        const currentScroll = Math.abs(readerViewport.scrollLeft);
        this.previousPage = Math.round(currentScroll / clientWidth) + 1;
        scrollToPage(this.targetPage);
    }

    undo() {
        scrollToPage(this.previousPage);
    }

    serialize() {
        return { type: 'NavigatePageCommand', targetPage: this.targetPage };
    }
}

class LoadBookCommand extends Command {
    constructor(fileName, fileContent, fileType) {
        super();
        this.fileName = fileName;
        this.fileContent = fileContent;
        this.fileType = fileType;
        
        this.previousFileName = currentFileName;
        this.previousFileContent = currentFileContent;
        this.previousFileType = currentFileType;
    }

    execute() {
        currentFileName = this.fileName;
        currentFileContent = this.fileContent;
        currentFileType = this.fileType;

        // Save metadata and content to localStorage for session restore
        try {
            localStorage.setItem('last_read_file_name', currentFileName);
            localStorage.setItem('last_read_file_content', currentFileContent);
            localStorage.setItem('last_read_file_type', currentFileType);
        } catch (e) {
            console.warn('Failed to save book to localStorage for restoration:', e);
        }

        displayBook();
    }

    undo() {
        currentFileName = this.previousFileName;
        currentFileContent = this.previousFileContent;
        currentFileType = this.previousFileType;
        
        if (currentFileName) {
            displayBook();
        } else {
            welcomeScreen.classList.remove('hidden');
            readerScreen.classList.add('hidden');
        }
    }

    serialize() {
        return {
            type: 'LoadBookCommand',
            fileName: this.fileName,
            fileContent: this.fileContent,
            fileType: this.fileType
        };
    }
}

class UpdateConfigCommand extends Command {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
        this.previousValue = config[key];
    }

    execute() {
        config[this.key] = this.value;
        saveSettings();
        applySettings();
    }

    undo() {
        config[this.key] = this.previousValue;
        saveSettings();
        applySettings();
    }

    serialize() {
        return {
            type: 'UpdateConfigCommand',
            key: this.key,
            value: this.value
        };
    }
}

class SyncBookmarkCommand extends Command {
    constructor(progress) {
        super();
        this.progress = progress;
        this.previousProgress = bookmarkProgress;
    }

    execute() {
        bookmarkProgress = this.progress;
        saveBookmark();
    }

    undo() {
        bookmarkProgress = this.previousProgress;
        saveBookmark();
    }

    serialize() {
        return {
            type: 'SyncBookmarkCommand',
            progress: this.progress
        };
    }
}

// Global Operations Command History Manager
var CommandManager = {
    history: [],
    undoneHistory: [],

    isDuplicateCommand(command) {
        if (this.history.length === 0) return false;
        const lastCmd = this.history[this.history.length - 1];
        if (lastCmd.constructor.name !== command.constructor.name) return false;

        if (command instanceof NavigatePageCommand) {
            return lastCmd.targetPage === command.targetPage;
        }
        if (command instanceof SyncBookmarkCommand) {
            return Math.abs(lastCmd.progress - command.progress) < 0.001;
        }
        if (command instanceof UpdateConfigCommand) {
            return lastCmd.key === command.key && lastCmd.value === command.value;
        }
        if (command instanceof LoadBookCommand) {
            return lastCmd.fileName === command.fileName;
        }
        return false;
    },

    limitHistorySize() {
        if (this.history.length > 50) {
            this.history.shift(); // Remove the oldest command
        }
    },

    execute(command) {
        if (this.isDuplicateCommand(command)) {
            return;
        }

        command.execute();
        this.history.push(command);
        this.limitHistorySize();
        this.undoneHistory = []; // Reset undo chain on new operations
        this.updateDebugMonitor();
    },

    undo() {
        if (this.history.length === 0) return;
        const command = this.history.pop();
        command.undo();
        this.undoneHistory.push(command);
        this.updateDebugMonitor();
    },

    redo() {
        if (this.undoneHistory.length === 0) return;
        const command = this.undoneHistory.pop();
        command.execute();
        this.history.push(command);
        this.updateDebugMonitor();
    },

    exportJSON() {
        const serialized = this.history.map(cmd => cmd.serialize());
        return JSON.stringify(serialized, null, 2);
    },

    importJSON(jsonString) {
        try {
            const list = JSON.parse(jsonString);
            if (!Array.isArray(list)) throw new Error("Imported operations must be an array");

            this.history = [];
            this.undoneHistory = [];

            list.forEach(data => {
                let cmd = null;
                switch (data.type) {
                    case 'NavigatePageCommand':
                        cmd = new NavigatePageCommand(data.targetPage);
                        break;
                    case 'LoadBookCommand':
                        cmd = new LoadBookCommand(data.fileName, data.fileContent, data.fileType);
                        break;
                    case 'UpdateConfigCommand':
                        cmd = new UpdateConfigCommand(data.key, data.value);
                        break;
                    case 'SyncBookmarkCommand':
                        cmd = new SyncBookmarkCommand(data.progress);
                        break;
                    default:
                        console.warn('Unknown command type inside import history:', data.type);
                }
                if (cmd) {
                    // Directly push commands to history instead of execute to avoid re-triggering side effects
                    this.history.push(cmd);
                }
            });

            // Re-apply the last state of the history to the app
            if (this.history.length > 0) {
                // To restore safely, we clean UI state and execute the last state sequentially
                const lastCommand = this.history[this.history.length - 1];
                lastCommand.execute();
            }
            this.updateDebugMonitor();
        } catch (e) {
            console.error('Failed to parse operations history JSON:', e);
            alert('操作履歴データのパースに失敗しました。正しいJSONファイルかご確認ください。');
        }
    },

    updateDebugMonitor() {
        if (debugMonitor) {
            debugMonitor.textContent = `History: ${this.history.length} operations. Undone: ${this.undoneHistory.length} operations.`;
        }
    }
};
