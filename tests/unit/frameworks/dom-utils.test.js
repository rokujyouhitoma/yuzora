const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;

// Load DOMUtils framework
const domUtilsCode = fs.readFileSync(path.join(__dirname, '../../../src/js/frameworks/dom-utils.js'), 'utf8');
eval(domUtilsCode);

test('DOMUtils.afterReflow should execute callback asynchronously', async () => {
    let called = false;
    global.DOMUtils.afterReflow(() => {
        called = true;
    });
    assert.strictEqual(called, false);
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(called, true);
});

test('DOMUtils.afterRender should execute callback after render', async () => {
    let called = false;
    global.DOMUtils.afterRender(() => {
        called = true;
    });
    assert.strictEqual(called, false);
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(called, true);
});

test('DOMUtils.nextFrame should execute callback on next frame', async () => {
    let called = false;
    global.DOMUtils.nextFrame(() => {
        called = true;
    });
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(called, true);
});
