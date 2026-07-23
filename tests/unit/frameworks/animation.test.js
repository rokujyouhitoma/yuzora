const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;

// Load AnimationUtils framework
const animationCode = fs.readFileSync(path.join(__dirname, '../../../src/js/frameworks/animation.js'), 'utf8');
eval(animationCode);

test('AnimationUtils.delay should delay execution', async () => {
    const start = Date.now();
    await global.AnimationUtils.delay(50);
    const elapsed = Date.now() - start;
    assert.strictEqual(elapsed >= 35, true);
});

test('AnimationUtils.waitForTransition should resolve on fallback timeout when no event target', async () => {
    const mockEl = {
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    const start = Date.now();
    await global.AnimationUtils.waitForTransition(mockEl, 50);
    const elapsed = Date.now() - start;
    assert.strictEqual(elapsed >= 35, true);
});
