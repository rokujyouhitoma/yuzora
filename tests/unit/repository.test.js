/**
 * Unit tests for Repository pattern classes.
 * Tests InMemoryRepository directly (no browser APIs required),
 * and domain repositories using InMemoryRepository as the storage backend.
 */
"use strict";

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// ==========================================================================
// Load repository source (standalone, without JSDOM)
// ==========================================================================

// We need to load repository.js in isolation.
// Since it references `locator` at module load time, we stub it.
const repositorySource = fs.readFileSync(
    path.resolve(__dirname, '../../src/js/modules/repository.js'),
    'utf8'
);

// Stub locator to prevent errors when module registers classes
const locatorStub = {
    register: () => {},
    resolve: () => {}
};

// Stub localStorage to prevent reference errors (not used by InMemoryRepository)
const localStorageStub = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
};

// Execute repository source in a minimal context
const moduleCode = `
    const locator = locatorStub;
    const localStorage = localStorageStub;
    ${repositorySource.replace(/"use strict";/, '')}
`;

// eslint-disable-next-line no-new-func
const moduleFactory = new Function(
    'locatorStub',
    'localStorageStub',
    `${moduleCode}
    return { Repository, LocalStorageRepository, InMemoryRepository, SettingsRepository, BookmarkRepository, SessionRepository };`
);

const {
    Repository,
    LocalStorageRepository,
    InMemoryRepository,
    SettingsRepository,
    BookmarkRepository,
    SessionRepository
} = moduleFactory(locatorStub, localStorageStub);

// ==========================================================================
// InMemoryRepository Tests
// ==========================================================================

test.describe('InMemoryRepository', () => {
    test('get() returns null for missing key', () => {
        const repo = new InMemoryRepository();
        assert.strictEqual(repo.get('missing'), null);
    });

    test('save() and get() round-trip', () => {
        const repo = new InMemoryRepository();
        repo.save('key1', 'value1');
        assert.strictEqual(repo.get('key1'), 'value1');
    });

    test('delete() removes the key', () => {
        const repo = new InMemoryRepository();
        repo.save('key1', 'value1');
        repo.delete('key1');
        assert.strictEqual(repo.get('key1'), null);
    });

    test('keys() returns all stored keys', () => {
        const repo = new InMemoryRepository();
        repo.save('a', '1');
        repo.save('b', '2');
        repo.save('c', '3');
        const keys = repo.keys();
        assert.deepStrictEqual(keys.sort(), ['a', 'b', 'c']);
    });

    test('clear() removes all entries', () => {
        const repo = new InMemoryRepository();
        repo.save('a', '1');
        repo.save('b', '2');
        repo.clear();
        assert.strictEqual(repo.keys().length, 0);
        assert.strictEqual(repo.get('a'), null);
    });

    test('overwrite existing key', () => {
        const repo = new InMemoryRepository();
        repo.save('key1', 'value1');
        repo.save('key1', 'value2');
        assert.strictEqual(repo.get('key1'), 'value2');
    });
});

// ==========================================================================
// Repository Abstract Class Tests
// ==========================================================================

test.describe('Repository (abstract)', () => {
    test('get() throws if not overridden', () => {
        const repo = new Repository();
        assert.throws(() => repo.get('key'), /get\(\) must be implemented/);
    });

    test('save() throws if not overridden', () => {
        const repo = new Repository();
        assert.throws(() => repo.save('key', 'value'), /save\(\) must be implemented/);
    });

    test('delete() throws if not overridden', () => {
        const repo = new Repository();
        assert.throws(() => repo.delete('key'), /delete\(\) must be implemented/);
    });

    test('keys() throws if not overridden', () => {
        const repo = new Repository();
        assert.throws(() => repo.keys(), /keys\(\) must be implemented/);
    });

    test('clear() throws if not overridden', () => {
        const repo = new Repository();
        assert.throws(() => repo.clear(), /clear\(\) must be implemented/);
    });
});

// ==========================================================================
// SettingsRepository Tests
// ==========================================================================

test.describe('SettingsRepository', () => {
    test('load() returns empty object when no data is stored', () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        const result = repo.load();
        assert.deepStrictEqual(result, {});
    });

    test('save() and load() round-trip', () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        const config = { theme: 'sepia', font: 'font-gothic', direction: 'rtl', size: 'size-md', lh: 'line-height-normal', spacing: 'spacing-normal' };
        repo.save(config);
        const loaded = repo.load();
        assert.deepStrictEqual(loaded, config);
    });

    test('clear() removes settings', () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        repo.save({ theme: 'dark' });
        repo.clear();
        assert.deepStrictEqual(repo.load(), {});
    });

    test('load() returns empty object for invalid JSON', () => {
        const storage = new InMemoryRepository();
        storage.save('yuzora_config', 'NOT_VALID_JSON{{{');
        const repo = new SettingsRepository(storage);
        assert.deepStrictEqual(repo.load(), {});
    });

    test('load() returns empty object for non-object JSON', () => {
        const storage = new InMemoryRepository();
        storage.save('yuzora_config', '"just a string"');
        const repo = new SettingsRepository(storage);
        assert.deepStrictEqual(repo.load(), {});
    });
});

// ==========================================================================
// BookmarkRepository Tests
// ==========================================================================

test.describe('BookmarkRepository', () => {
    test('load() returns 0 for missing file', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(repo.load('nonexistent.txt'), 0);
    });

    test('load() returns 0 for empty fileName', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(repo.load(''), 0);
    });

    test('save() and load() round-trip', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        repo.save('kokoro.txt', 0.42);
        assert.strictEqual(repo.load('kokoro.txt'), 0.42);
    });

    test('save() uses bookmark_ prefix as key', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        repo.save('test.txt', 0.75);
        assert.strictEqual(storage.get('bookmark_test.txt'), '0.75');
    });

    test('clearAll() removes only bookmark_ keys', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        repo.save('book1.txt', 0.1);
        repo.save('book2.txt', 0.2);
        storage.save('yuzora_config', '{"theme":"dark"}'); // should not be removed
        repo.clearAll();
        assert.strictEqual(storage.get('bookmark_book1.txt'), null);
        assert.strictEqual(storage.get('bookmark_book2.txt'), null);
        assert.strictEqual(storage.get('yuzora_config'), '{"theme":"dark"}'); // preserved
    });

    test('save() ignores empty fileName', () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        repo.save('', 0.5); // should not throw and should not save
        assert.strictEqual(storage.keys().length, 0);
    });

    test('load() returns 0 for NaN value', () => {
        const storage = new InMemoryRepository();
        storage.save('bookmark_test.txt', 'not-a-number');
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(repo.load('test.txt'), 0);
    });
});

// ==========================================================================
// SessionRepository Tests
// ==========================================================================

test.describe('SessionRepository', () => {
    test('load() returns null fields when no session is stored', () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        const session = repo.load();
        assert.strictEqual(session.name, null);
        assert.strictEqual(session.content, null);
        assert.strictEqual(session.type, null);
    });

    test('save() and load() round-trip', () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        repo.save('book.txt', 'book content...', 'txt');
        const session = repo.load();
        assert.strictEqual(session.name, 'book.txt');
        assert.strictEqual(session.content, 'book content...');
        assert.strictEqual(session.type, 'txt');
    });

    test('clear() removes all session keys', () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        repo.save('book.txt', 'content', 'txt');
        repo.clear();
        const session = repo.load();
        assert.strictEqual(session.name, null);
        assert.strictEqual(session.content, null);
        assert.strictEqual(session.type, null);
    });

    test('save() uses correct key names', () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        repo.save('my-book.html', '<html/>', 'html');
        assert.strictEqual(storage.get('last_read_file_name'), 'my-book.html');
        assert.strictEqual(storage.get('last_read_file_content'), '<html/>');
        assert.strictEqual(storage.get('last_read_file_type'), 'html');
    });
});

// ==========================================================================
// Substitution Test: InMemoryRepository replacing LocalStorageRepository
// ==========================================================================

test.describe('Repository substitution (InMemory replaces LocalStorage)', () => {
    test('SettingsRepository works identically with InMemory backend', () => {
        const inMemory = new InMemoryRepository();
        const settingsRepo = new SettingsRepository(inMemory);

        // Simulate what ConfigModel.save() does
        settingsRepo.save({ theme: 'dark', font: 'font-mincho', direction: 'ltr', size: 'size-lg', lh: 'line-height-wide', spacing: 'spacing-wide' });

        // Simulate what ConfigModel.load() does
        const loaded = settingsRepo.load();
        assert.strictEqual(loaded.theme, 'dark');
        assert.strictEqual(loaded.direction, 'ltr');
    });

    test('BookmarkRepository works identically with InMemory backend', () => {
        const inMemory = new InMemoryRepository();
        const bookmarkRepo = new BookmarkRepository(inMemory);

        bookmarkRepo.save('musashi.txt', 0.85);
        const progress = bookmarkRepo.load('musashi.txt');
        assert.strictEqual(progress, 0.85);
    });

    test('SessionRepository works identically with InMemory backend', () => {
        const inMemory = new InMemoryRepository();
        const sessionRepo = new SessionRepository(inMemory);

        sessionRepo.save('kokoro.txt', 'full text content', 'txt');
        const session = sessionRepo.load();
        assert.strictEqual(session.name, 'kokoro.txt');
    });
});
