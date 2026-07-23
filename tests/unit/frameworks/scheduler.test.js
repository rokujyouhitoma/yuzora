const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;
global.performance = global.performance || { now: () => Date.now() };

// Load Scheduler framework
const schedulerCode = fs.readFileSync(path.join(__dirname, '../../../src/js/frameworks/scheduler.js'), 'utf8');
eval(schedulerCode);

test('TaskScheduler.delay should resolve after specified time', async () => {
    const start = Date.now();
    await global.TaskScheduler.delay(50);
    const elapsed = Date.now() - start;
    assert.strictEqual(elapsed >= 35, true);
});

test('TaskScheduler.requestIdle should invoke callback', async () => {
    let called = false;
    global.TaskScheduler.requestIdle(() => {
        called = true;
    });
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(called, true);
});

test('TaskScheduler.yieldToMainThread should yield execution non-blockingly', async () => {
    const nextTime = await global.TaskScheduler.yieldToMainThread(0, 0);
    assert.strictEqual(typeof nextTime, 'number');
});
