const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;

// Load Timing framework
const timingCode = fs.readFileSync(path.join(__dirname, '../../../src/js/frameworks/timing.js'), 'utf8');
eval(timingCode);

test('Timing.debounce should coalesce rapid calls', async () => {
    let count = 0;
    const fn = global.Timing.debounce(() => {
        count++;
    }, 50);

    fn();
    fn();
    fn();
    assert.strictEqual(count, 0);

    await new Promise(r => setTimeout(r, 80));
    assert.strictEqual(count, 1);
});

test('Timing.createInactivityTimer should trigger and cancel', async () => {
    let triggered = false;
    const timer = global.Timing.createInactivityTimer(() => {
        triggered = true;
    }, 50);

    timer.trigger();
    timer.cancel();

    await new Promise(r => setTimeout(r, 80));
    assert.strictEqual(triggered, false);

    timer.trigger();
    await new Promise(r => setTimeout(r, 80));
    assert.strictEqual(triggered, true);
});
