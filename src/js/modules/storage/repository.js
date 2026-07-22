/**
 * Yuzora - Repository Pattern Module
 *
 * Provides a storage abstraction layer that decouples business logic
 * from the concrete persistence mechanism (localStorage, IndexedDB, etc.).
 */
"use strict";

/**
 * Checks if a key is a prototype pollution property.
 * @param {string} key
 * @return {boolean}
 */
function isPollutedKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/**
 * Checks if a prototype object is mutated / polluted.
 * @param {*} proto
 * @return {boolean}
 */
function isPollutedPrototype(proto) {
    return proto !== null && proto !== Object.prototype && proto !== Array.prototype;
}

/**
 * Checks if the scan should be skipped for an object.
 * @param {*} obj
 * @param {!Set<*>} visited
 * @return {boolean}
 */
function shouldSkipScan(obj, visited) {
    return !obj || typeof obj !== "object" || visited.has(obj);
}

/**
 * Recursively scans an object for prototype pollution keys.
 * @param {*} obj
 * @param {!Set<*>=} visited
 * @return {boolean}
 */
function hasPrototypePollutionKeys(obj, visited = new Set()) {
    if (shouldSkipScan(obj, visited)) {
        return false;
    }
    visited.add(obj);

    const nonNullObj = /** @type {!Object} */ (obj);

    if (isPollutedPrototype(Object.getPrototypeOf(nonNullObj))) {
        return true;
    }

    const keys = Object.getOwnPropertyNames(nonNullObj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (isPollutedKey(key)) {
            return true;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(nonNullObj, key);
            const val = desc ? desc.value : undefined;
            if (hasPrototypePollutionKeys(val, visited)) {
                return true;
            }
        } catch (e) {
            // Ignore errors
        }
    }
    return false;
}
const globalObj = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
globalObj['hasPrototypePollutionKeys'] = hasPrototypePollutionKeys;

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
     * @param {string} key
     * @return {!Promise<?string>}
     * @override
     */
    // @ts-expect-error
    get(key) {
        return Promise.reject(new Error("get() must be implemented"));
    }

    /**
     * Persist a value by key.
     * @param {string} key
     * @param {string} value
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    save(key, value) {
        return Promise.reject(new Error("save() must be implemented"));
    }

    /**
     * Remove a value by key.
     * @param {string} key
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    delete(key) {
        return Promise.reject(new Error("delete() must be implemented"));
    }

    /**
     * Return all keys currently in storage.
     * @return {!Promise<!Array<string>>}
     * @override
     */
    // @ts-expect-error
    keys() {
        return Promise.reject(new Error("keys() must be implemented"));
    }

    /**
     * Clear all entries from storage.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    clear() {
        return Promise.reject(new Error("clear() must be implemented"));
    }
}

// ==========================================================================
// LocalStorageRepository
// ==========================================================================

/**
 * Concrete Repository implementation backed by window.localStorage.
 * All read/write operations are wrapped in try-catch for safety.
 */
class LocalStorageRepository extends Repository {
    /**
     * @override
     * @param {string} key
     * @return {!Promise<?string>}
     */
    get(key) {
        try {
            return Promise.resolve(localStorage.getItem(key));
        } catch (e) {
            console.warn("LocalStorageRepository.get() failed:", e);
            return Promise.resolve(null);
        }
    }

    /**
     * @override
     * @param {string} key
     * @param {string} value
     * @return {!Promise<void>}
     */
    save(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("LocalStorageRepository.save() failed:", e);
        }
        return Promise.resolve();
    }

    /**
     * @override
     * @param {string} key
     * @return {!Promise<void>}
     */
    delete(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("LocalStorageRepository.delete() failed:", e);
        }
        return Promise.resolve();
    }

    /**
     * @override
     * @return {!Promise<!Array<string>>}
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
        return Promise.resolve(result);
    }

    /**
     * @override
     * @return {!Promise<void>}
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn("LocalStorageRepository.clear() failed:", e);
        }
        return Promise.resolve();
    }
}

// ==========================================================================
// InMemoryRepository
// ==========================================================================

/**
 * In-memory Repository implementation backed by a Map.
 * Intended for use in tests and environments without browser APIs.
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
     * @return {!Promise<?string>}
     */
    get(key) {
        const val = this.store.has(key) ? /** @type {string} */ (this.store.get(key)) : null;
        return Promise.resolve(val);
    }

    /**
     * @override
     * @param {string} key
     * @param {string} value
     * @return {!Promise<void>}
     */
    save(key, value) {
        this.store.set(key, value);
        return Promise.resolve();
    }

    /**
     * @override
     * @param {string} key
     * @return {!Promise<void>}
     */
    delete(key) {
        this.store.delete(key);
        return Promise.resolve();
    }

    /**
     * @override
     * @return {!Promise<!Array<string>>}
     */
    keys() {
        return Promise.resolve(Array.from(this.store.keys()));
    }

    /**
     * @override
     * @return {!Promise<void>}
     */
    clear() {
        this.store.clear();
        return Promise.resolve();
    }
}

// ==========================================================================
// SettingsRepository (Domain Repository)
// ==========================================================================

/**
 * Filters a configuration object against the allowed settings whitelist.
 * @param {*} parsed
 * @return {!Object<string, string>}
 */
function filterConfigKeys(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return /** @type {!Object<string, string>} */ ({});
    }
    const validated = {};
    const allowedKeys = {
        'theme': ['sepia', 'dark', 'light', 'black'],
        'font': ['font-gothic', 'font-mincho'],
        'direction': ['rtl', 'ltr'],
        'size': ['size-sm', 'size-md', 'size-lg', 'size-xl'],
        'lh': ['line-height-tight', 'line-height-normal', 'line-height-loose'],
        'spacing': ['spacing-tight', 'spacing-normal', 'spacing-loose'],
        'headingPageBreakMode': ['none', 'large', 'large-medium', 'all']
    };

    const parsedKeys = Object.keys(parsed);
    for (let i = 0; i < parsedKeys.length; i++) {
        const key = parsedKeys[i];
        if (allowedKeys.hasOwnProperty(key)) {
            const val = parsed[key];
            if (typeof val === "string" && allowedKeys[key].indexOf(val) !== -1) {
                validated[key] = val;
            }
        }
    }
    return /** @type {!Object<string, string>} */ (validated);
}

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
     * @return {!Promise<!Object<string, string>>}
     * @override
     */
    // @ts-expect-error
    async load() {
        try {
            const raw = await this.storage.get(this._KEY);
            if (!raw) {
                return /** @type {!Object<string, string>} */ ({});
            }

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                return /** @type {!Object<string, string>} */ ({});
            }

            if (hasPrototypePollutionKeys(parsed)) {
                console.warn("SettingsRepository.load() detected prototype pollution in config, discarding config.");
                return /** @type {!Object<string, string>} */ ({});
            }

            const validated = filterConfigKeys(parsed);
            return /** @type {!Object<string, string>} */ (validated);
        } catch (e) {
            console.warn("SettingsRepository.load() failed to parse JSON:", e);
        }
        return /** @type {!Object<string, string>} */ ({});
    }

    /**
     * Persist the settings object to storage.
     * @param {!Object<string, string>} configObject
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async save(configObject) {
        try {
            await this.storage.save(this._KEY, JSON.stringify(configObject));
        } catch (e) {
            console.warn("SettingsRepository.save() failed to serialize JSON:", e);
        }
    }

    /**
     * Remove settings from storage.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async clear() {
        await this.storage.delete(this._KEY);
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
     * @param {string} fileName
     * @return {!Promise<number>}
     * @override
     */
    // @ts-expect-error
    async load(fileName) {
        if (!fileName) return 0;
        try {
            const raw = await this.storage.get(this._PREFIX + fileName);
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
     * @param {string} fileName
     * @param {number} progress
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async save(fileName, progress) {
        if (!fileName) return;
        await this.storage.save(this._PREFIX + fileName, progress.toString());
    }

    /**
     * Remove all bookmark entries from storage.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async clearAll() {
        const allKeys = await this.storage.keys();
        const bookmarkKeys = allKeys.filter(k => k.startsWith(this._PREFIX));
        await Promise.all(bookmarkKeys.map(k => this.storage.delete(k)));
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
     * @return {!Promise<{name: ?string, content: ?string, type: ?string}>}
     * @override
     */
    // @ts-expect-error
    async load() {
        const [name, content, type] = await Promise.all([
            this.storage.get(this._KEY_NAME),
            this.storage.get(this._KEY_CONTENT),
            this.storage.get(this._KEY_TYPE)
        ]);
        return { name, content, type };
    }

    /**
     * Persist the current reading session to storage.
     * @param {string} name
     * @param {string} content
     * @param {string} type
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async save(name, content, type) {
        await Promise.all([
            this.storage.save(this._KEY_NAME, name),
            this.storage.save(this._KEY_CONTENT, content),
            this.storage.save(this._KEY_TYPE, type)
        ]);
    }

    /**
     * Remove all session entries from storage.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async clear() {
        await Promise.all([
            this.storage.delete(this._KEY_NAME),
            this.storage.delete(this._KEY_CONTENT),
            this.storage.delete(this._KEY_TYPE)
        ]);
    }
}

// ==========================================================================
// IndexedDBRepository
// ==========================================================================

/**
 * Repository implementation backed by IndexedDB.
 */
class IndexedDBRepository {
    constructor() {
        /**
         * @private
         * @type {string}
         */
        this.dbName = "yuzora_db";
        /**
         * @private
         * @type {number}
         */
        this.dbVersion = 1;
        /**
         * @private
         * @type {string}
         */
        this.storeName = "books";
        /**
         * @private
         * @type {?IDBDatabase}
         */
        this.db = null;
    }

    /**
     * @private
     * @return {!Promise<!IDBDatabase>}
     */
    async getDB() {
        if (this.db) {
            return this.db;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "fileName" });
                }
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to open IndexedDB"));
            };
        });
    }

    /**
     * Retrieve all items.
     * @return {!Promise<!Array<!Object>>}
     */
    async getAll() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to getAll from IndexedDB"));
            };
        });
    }

    /**
     * Get item by key.
     * @param {string} key
     * @return {!Promise<?Object>}
     */
    async get(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to get from IndexedDB"));
            };
        });
    }

    /**
     * Put item.
     * @param {!Object} value
     * @return {!Promise<void>}
     */
    async put(value) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to put into IndexedDB"));
            };
        });
    }

    /**
     * Delete item.
     * @param {string} key
     * @return {!Promise<void>}
     */
    async delete(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to delete from IndexedDB"));
            };
        });
    }

    /**
     * Clear all items.
     * @return {!Promise<void>}
     */
    async clear() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error || new Error("Failed to clear IndexedDB"));
            };
        });
    }
}

// ==========================================================================
// LibraryRepository (Domain Repository)
// ==========================================================================

/**
 * Domain repository for library books saved in IndexedDB.
 * @implements {LibraryRepositoryInterface}
 */
class LibraryRepository {
    /**
     * @param {!IndexedDBRepository} db
     */
    constructor(db) {
        /**
         * @private
         * @type {!IndexedDBRepository}
         */
        this.db = db;
    }

    /**
     * Save a book to the library database.
     * @param {string} fileName
     * @param {string} title
     * @param {string} author
     * @param {string} content
     * @param {string} fileType
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async saveBook(fileName, title, author, content, fileType) {
        if (!fileName) return;
        const bookObj = {
            fileName: fileName,
            title: title || fileName,
            author: author || "",
            content: content || "",
            fileType: fileType || "txt",
            importedAt: Date.now()
        };
        await this.db.put(bookObj);
    }

    /**
     * Retrieve all library books metadata sorted by importedAt desc.
     * @return {!Promise<!Array<!Object>>}
     * @override
     */
    // @ts-expect-error
    async getBooks() {
        try {
            const all = await this.db.getAll();
            return all.sort((a, b) => (b.importedAt || 0) - (a.importedAt || 0));
        } catch (e) {
            console.warn("LibraryRepository.getBooks() failed:", e);
            return [];
        }
    }

    /**
     * Retrieve a specific book by fileName.
     * @param {string} fileName
     * @return {!Promise<?Object>}
     * @override
     */
    // @ts-expect-error
    async getBook(fileName) {
        if (!fileName) return null;
        try {
            return await this.db.get(fileName);
        } catch (e) {
            console.warn("LibraryRepository.getBook() failed:", e);
            return null;
        }
    }

    /**
     * Delete a book by fileName.
     * @param {string} fileName
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async deleteBook(fileName) {
        if (!fileName) return;
        await this.db.delete(fileName);
    }

    /**
     * Clear all books from the library.
     * @return {!Promise<void>}
     * @override
     */
    // @ts-expect-error
    async clearAll() {
        await this.db.clear();
    }
}

// ==========================================================================
// Locator Registration
// ==========================================================================

const globalLocalStorage = new LocalStorageRepository();
const globalSettingsRepository = new SettingsRepository(/** @type {!RepositoryInterface} */ (globalLocalStorage));
const globalBookmarkRepository = new BookmarkRepository(/** @type {!RepositoryInterface} */ (globalLocalStorage));
const globalSessionRepository = new SessionRepository(/** @type {!RepositoryInterface} */ (globalLocalStorage));
const globalIndexedDBRepository = new IndexedDBRepository();
const globalLibraryRepository = new LibraryRepository(globalIndexedDBRepository);

locator.register(LocalStorageRepository, globalLocalStorage);
locator.register(SettingsRepository, globalSettingsRepository);
locator.register(BookmarkRepository, globalBookmarkRepository);
locator.register(SessionRepository, globalSessionRepository);
locator.register(IndexedDBRepository, globalIndexedDBRepository);
locator.register(LibraryRepository, globalLibraryRepository);
