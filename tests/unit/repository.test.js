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
    path.resolve(__dirname, '../../src/js/modules/storage/repository.js'),
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
    test('get() returns null for missing key', async () => {
        const repo = new InMemoryRepository();
        assert.strictEqual(await repo.get('missing'), null);
    });

    test('save() and get() round-trip', async () => {
        const repo = new InMemoryRepository();
        await repo.save('key1', 'value1');
        assert.strictEqual(await repo.get('key1'), 'value1');
    });

    test('delete() removes the key', async () => {
        const repo = new InMemoryRepository();
        await repo.save('key1', 'value1');
        await repo.delete('key1');
        assert.strictEqual(await repo.get('key1'), null);
    });

    test('keys() returns all stored keys', async () => {
        const repo = new InMemoryRepository();
        await repo.save('a', '1');
        await repo.save('b', '2');
        await repo.save('c', '3');
        const keys = await repo.keys();
        assert.deepStrictEqual(keys.sort(), ['a', 'b', 'c']);
    });

    test('clear() removes all entries', async () => {
        const repo = new InMemoryRepository();
        await repo.save('a', '1');
        await repo.save('b', '2');
        await repo.clear();
        const keys = await repo.keys();
        assert.strictEqual(keys.length, 0);
        assert.strictEqual(await repo.get('a'), null);
    });

    test('overwrite existing key', async () => {
        const repo = new InMemoryRepository();
        await repo.save('key1', 'value1');
        await repo.save('key1', 'value2');
        assert.strictEqual(await repo.get('key1'), 'value2');
    });
});

// ==========================================================================
// Repository Abstract Class Tests
// ==========================================================================

test.describe('Repository (abstract)', () => {
    test('get() throws if not overridden', async () => {
        const repo = new Repository();
        await assert.rejects(() => repo.get('key'), /get\(\) must be implemented/);
    });

    test('save() throws if not overridden', async () => {
        const repo = new Repository();
        await assert.rejects(() => repo.save('key', 'value'), /save\(\) must be implemented/);
    });

    test('delete() throws if not overridden', async () => {
        const repo = new Repository();
        await assert.rejects(() => repo.delete('key'), /delete\(\) must be implemented/);
    });

    test('keys() throws if not overridden', async () => {
        const repo = new Repository();
        await assert.rejects(() => repo.keys(), /keys\(\) must be implemented/);
    });

    test('clear() throws if not overridden', async () => {
        const repo = new Repository();
        await assert.rejects(() => repo.clear(), /clear\(\) must be implemented/);
    });
});

// ==========================================================================
// SettingsRepository Tests
// ==========================================================================

test.describe('SettingsRepository', () => {
    test('load() returns empty object when no data is stored', async () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        const result = await repo.load();
        assert.deepStrictEqual(result, {});
    });

    test('save() and load() round-trip', async () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        const config = { theme: 'sepia', font: 'font-gothic', direction: 'rtl', size: 'size-md', lh: 'line-height-normal', spacing: 'spacing-normal' };
        await repo.save(config);
        const loaded = await repo.load();
        assert.deepStrictEqual(loaded, config);
    });

    test('clear() removes settings', async () => {
        const storage = new InMemoryRepository();
        const repo = new SettingsRepository(storage);
        await repo.save({ theme: 'dark' });
        await repo.clear();
        assert.deepStrictEqual(await repo.load(), {});
    });

    test('load() returns empty object for invalid JSON', async () => {
        const storage = new InMemoryRepository();
        await storage.save('yuzora_config', 'NOT_VALID_JSON{{{');
        const repo = new SettingsRepository(storage);
        assert.deepStrictEqual(await repo.load(), {});
    });

    test('load() returns empty object for non-object JSON', async () => {
        const storage = new InMemoryRepository();
        await storage.save('yuzora_config', '"just a string"');
        const repo = new SettingsRepository(storage);
        assert.deepStrictEqual(await repo.load(), {});
    });
});

// ==========================================================================
// BookmarkRepository Tests
// ==========================================================================

test.describe('BookmarkRepository', () => {
    test('load() returns 0 for missing file', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(await repo.load('nonexistent.txt'), 0);
    });

    test('load() returns 0 for empty fileName', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(await repo.load(''), 0);
    });

    test('save() and load() round-trip', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        await repo.save('kokoro.txt', 0.42);
        assert.strictEqual(await repo.load('kokoro.txt'), 0.42);
    });

    test('save() uses bookmark_ prefix as key', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        await repo.save('test.txt', 0.75);
        assert.strictEqual(await storage.get('bookmark_test.txt'), '0.75');
    });

    test('clearAll() removes only bookmark_ keys', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        await repo.save('book1.txt', 0.1);
        await repo.save('book2.txt', 0.2);
        await storage.save('yuzora_config', '{"theme":"dark"}'); // should not be removed
        await repo.clearAll();
        assert.strictEqual(await storage.get('bookmark_book1.txt'), null);
        assert.strictEqual(await storage.get('bookmark_book2.txt'), null);
        assert.strictEqual(await storage.get('yuzora_config'), '{"theme":"dark"}'); // preserved
    });

    test('save() ignores empty fileName', async () => {
        const storage = new InMemoryRepository();
        const repo = new BookmarkRepository(storage);
        await repo.save('', 0.5); // should not throw and should not save
        const keys = await storage.keys();
        assert.strictEqual(keys.length, 0);
    });

    test('load() returns 0 for NaN value', async () => {
        const storage = new InMemoryRepository();
        await storage.save('bookmark_test.txt', 'not-a-number');
        const repo = new BookmarkRepository(storage);
        assert.strictEqual(await repo.load('test.txt'), 0);
    });
});

// ==========================================================================
// SessionRepository Tests
// ==========================================================================

test.describe('SessionRepository', () => {
    test('load() returns null fields when no session is stored', async () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        const session = await repo.load();
        assert.strictEqual(session.name, null);
        assert.strictEqual(session.content, null);
        assert.strictEqual(session.type, null);
    });

    test('save() and load() round-trip', async () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        await repo.save('book.txt', 'book content...', 'txt');
        const session = await repo.load();
        assert.strictEqual(session.name, 'book.txt');
        assert.strictEqual(session.content, 'book content...');
        assert.strictEqual(session.type, 'txt');
    });

    test('clear() removes all session keys', async () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        await repo.save('book.txt', 'content', 'txt');
        await repo.clear();
        const session = await repo.load();
        assert.strictEqual(session.name, null);
        assert.strictEqual(session.content, null);
        assert.strictEqual(session.type, null);
    });

    test('save() uses correct key names', async () => {
        const storage = new InMemoryRepository();
        const repo = new SessionRepository(storage);
        await repo.save('my-book.html', '<html/>', 'html');
        assert.strictEqual(await storage.get('last_read_file_name'), 'my-book.html');
        assert.strictEqual(await storage.get('last_read_file_content'), '<html/>');
        assert.strictEqual(await storage.get('last_read_file_type'), 'html');
    });
});

// ==========================================================================
// Substitution Test: InMemoryRepository replacing LocalStorageRepository
// ==========================================================================

test.describe('Repository substitution (InMemory replaces LocalStorage)', () => {
    test('SettingsRepository works identically with InMemory backend', async () => {
        const inMemory = new InMemoryRepository();
        const settingsRepo = new SettingsRepository(inMemory);

        // Simulate what ConfigModel.save() does
        await settingsRepo.save({ theme: 'dark', font: 'font-mincho', direction: 'ltr', size: 'size-lg', lh: 'line-height-wide', spacing: 'spacing-wide' });

        // Simulate what ConfigModel.load() does
        const loaded = await settingsRepo.load();
        assert.strictEqual(loaded.theme, 'dark');
        assert.strictEqual(loaded.direction, 'ltr');
    });

    test('BookmarkRepository works identically with InMemory backend', async () => {
        const inMemory = new InMemoryRepository();
        const bookmarkRepo = new BookmarkRepository(inMemory);

        await bookmarkRepo.save('musashi.txt', 0.85);
        const progress = await bookmarkRepo.load('musashi.txt');
        assert.strictEqual(progress, 0.85);
    });

    test('SessionRepository works identically with InMemory backend', async () => {
        const inMemory = new InMemoryRepository();
        const sessionRepo = new SessionRepository(inMemory);

        await sessionRepo.save('kokoro.txt', 'full text content', 'txt');
        const session = await sessionRepo.load();
        assert.strictEqual(session.name, 'kokoro.txt');
    });
});
