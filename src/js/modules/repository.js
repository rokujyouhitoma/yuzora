/**
 * Yuzora - Repository Pattern Module
 *
 * Provides a storage abstraction layer that decouples business logic
 * from the concrete persistence mechanism (localStorage, IndexedDB, etc.).
 */
"use strict";

// ==========================================================================
// Base Repository (Abstract)
// ==========================================================================

/**
 * Abstract base class for all storage repositories.
 * Concrete implementations must override all methods.
 * @implements {RepositoryInterface}
 */
class Repository {
    /**
     * Retrieve a value by key.
     * @override
     * @param {string} key
     * @return {?string}
     */
    get(key) {
        throw new Error("get() must be implemented");
    }

    /**
     * Persist a value by key.
     * @override
     * @param {string} key
     * @param {string} value
     */
    save(key, value) {
        throw new Error("save() must be implemented");
    }

    /**
     * Remove a value by key.
     * @override
     * @param {string} key
     */
    delete(key) {
        throw new Error("delete() must be implemented");
    }

    /**
     * Return all keys currently in storage.
     * @override
     * @return {!Array<string>}
     */
    keys() {
        throw new Error("keys() must be implemented");
    }

    /**
     * Clear all entries from storage.
     * @override
     */
    clear() {
        throw new Error("clear() must be implemented");
    }
}

// ==========================================================================
// LocalStorageRepository
// ==========================================================================

/**
 * Concrete Repository implementation backed by window.localStorage.
 * All read/write operations are wrapped in try-catch for safety.
 * @implements {RepositoryInterface}
 */
class LocalStorageRepository extends Repository {
    /**
     * @override
     * @param {string} key
     * @return {?string}
     */
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("LocalStorageRepository.get() failed:", e);
            return null;
        }
    }

    /**
     * @override
     * @param {string} key
     * @param {string} value
     */
    save(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("LocalStorageRepository.save() failed:", e);
        }
    }

    /**
     * @override
     * @param {string} key
     */
    delete(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("LocalStorageRepository.delete() failed:", e);
        }
    }

    /**
     * @override
     * @return {!Array<string>}
     */
    keys() {
        const result = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key !== null) {
                    result.push(key);
                }
            }
        } catch (e) {
            console.warn("LocalStorageRepository.keys() failed:", e);
        }
        return result;
    }

    /**
     * @override
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn("LocalStorageRepository.clear() failed:", e);
        }
    }
}

// ==========================================================================
// InMemoryRepository
// ==========================================================================

/**
 * In-memory Repository implementation backed by a Map.
 * Intended for use in tests and environments without browser APIs.
 * @implements {RepositoryInterface}
 */
class InMemoryRepository extends Repository {
    constructor() {
        super();
        /**
         * @private
         * @type {!Map<string, string>}
         */
        this.store = new Map();
    }

    /**
     * @override
     * @param {string} key
     * @return {?string}
     */
    get(key) {
        return this.store.has(key) ? /** @type {string} */ (this.store.get(key)) : null;
    }

    /**
     * @override
     * @param {string} key
     * @param {string} value
     */
    save(key, value) {
        this.store.set(key, value);
    }

    /**
     * @override
     * @param {string} key
     */
    delete(key) {
        this.store.delete(key);
    }

    /**
     * @override
     * @return {!Array<string>}
     */
    keys() {
        return Array.from(this.store.keys());
    }

    /**
     * @override
     */
    clear() {
        this.store.clear();
    }
}

// ==========================================================================
// SettingsRepository (Domain Repository)
// ==========================================================================

/**
 * Domain repository for user display settings (theme, font, direction, etc.).
 * Encapsulates the 'yuzora_config' storage key.
 * @implements {SettingsRepositoryInterface}
 */
class SettingsRepository {
    /**
     * @param {!RepositoryInterface} storage
     */
    constructor(storage) {
        /**
         * @private
         * @type {!RepositoryInterface}
         */
        this.storage = storage;

        /**
         * @private
         * @const {string}
         */
        this._KEY = 'yuzora_config';
    }

    /**
     * Load the settings object from storage.
     * Returns an empty object if no settings are found or parsing fails.
     * @override
     * @return {!Object<string, string>}
     */
    load() {
        try {
            const raw = this.storage.get(this._KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") {
                    return /** @type {!Object<string, string>} */ (parsed);
                }
            }
        } catch (e) {
            console.warn("SettingsRepository.load() failed to parse JSON:", e);
        }
        return {};
    }

    /**
     * Persist the settings object to storage.
     * @override
     * @param {!Object<string, string>} configObject
     */
    save(configObject) {
        try {
            this.storage.save(this._KEY, JSON.stringify(configObject));
        } catch (e) {
            console.warn("SettingsRepository.save() failed to serialize JSON:", e);
        }
    }

    /**
     * Remove settings from storage.
     * @override
     */
    clear() {
        this.storage.delete(this._KEY);
    }
}

// ==========================================================================
// BookmarkRepository (Domain Repository)
// ==========================================================================

/**
 * Domain repository for per-book reading progress (bookmark positions).
 * Encapsulates the 'bookmark_' prefix for all bookmark keys.
 * @implements {BookmarkRepositoryInterface}
 */
class BookmarkRepository {
    /**
     * @param {!RepositoryInterface} storage
     */
    constructor(storage) {
        /**
         * @private
         * @type {!RepositoryInterface}
         */
        this.storage = storage;

        /**
         * @private
         * @const {string}
         */
        this._PREFIX = 'bookmark_';
    }

    /**
     * Load the bookmark progress for a given file.
     * Returns 0 if no bookmark is found or loading fails.
     * @override
     * @param {string} fileName
     * @return {number}
     */
    load(fileName) {
        if (!fileName) return 0;
        try {
            const raw = this.storage.get(this._PREFIX + fileName);
            if (raw) {
                const progress = parseFloat(raw);
                return isNaN(progress) ? 0 : progress;
            }
        } catch (e) {
            console.warn("BookmarkRepository.load() failed:", e);
        }
        return 0;
    }

    /**
     * Persist the bookmark progress for a given file.
     * @override
     * @param {string} fileName
     * @param {number} progress
     */
    save(fileName, progress) {
        if (!fileName) return;
        this.storage.save(this._PREFIX + fileName, progress.toString());
    }

    /**
     * Remove all bookmark entries from storage.
     * @override
     */
    clearAll() {
        const allKeys = this.storage.keys();
        const bookmarkKeys = allKeys.filter(k => k.startsWith(this._PREFIX));
        bookmarkKeys.forEach(k => this.storage.delete(k));
    }
}

// ==========================================================================
// SessionRepository (Domain Repository)
// ==========================================================================

/**
 * Domain repository for reading session state (last opened file).
 * Encapsulates the 'last_read_file_*' storage keys.
 * @implements {SessionRepositoryInterface}
 */
class SessionRepository {
    /**
     * @param {!RepositoryInterface} storage
     */
    constructor(storage) {
        /**
         * @private
         * @type {!RepositoryInterface}
         */
        this.storage = storage;

        /**
         * @private
         * @const {string}
         */
        this._KEY_NAME = 'last_read_file_name';

        /**
         * @private
         * @const {string}
         */
        this._KEY_CONTENT = 'last_read_file_content';

        /**
         * @private
         * @const {string}
         */
        this._KEY_TYPE = 'last_read_file_type';
    }

    /**
     * Load the last reading session from storage.
     * Returns an object with name, content, and type fields (may be null).
     * @override
     * @return {{name: ?string, content: ?string, type: ?string}}
     */
    load() {
        return {
            name: this.storage.get(this._KEY_NAME),
            content: this.storage.get(this._KEY_CONTENT),
            type: this.storage.get(this._KEY_TYPE)
        };
    }

    /**
     * Persist the current reading session to storage.
     * @override
     * @param {string} name
     * @param {string} content
     * @param {string} type
     */
    save(name, content, type) {
        this.storage.save(this._KEY_NAME, name);
        this.storage.save(this._KEY_CONTENT, content);
        this.storage.save(this._KEY_TYPE, type);
    }

    /**
     * Remove all session entries from storage.
     * @override
     */
    clear() {
        this.storage.delete(this._KEY_NAME);
        this.storage.delete(this._KEY_CONTENT);
        this.storage.delete(this._KEY_TYPE);
    }
}

// ==========================================================================
// Locator Registration
// ==========================================================================

const globalLocalStorage = new LocalStorageRepository();
const globalSettingsRepository = new SettingsRepository(globalLocalStorage);
const globalBookmarkRepository = new BookmarkRepository(globalLocalStorage);
const globalSessionRepository = new SessionRepository(globalLocalStorage);

locator.register(LocalStorageRepository, globalLocalStorage);
locator.register(SettingsRepository, globalSettingsRepository);
locator.register(BookmarkRepository, globalBookmarkRepository);
locator.register(SessionRepository, globalSessionRepository);
