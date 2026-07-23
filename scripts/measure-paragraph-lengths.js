const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => {});

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div><div id="welcome-screen"></div><div id="reader-screen"></div><div id="drop-zone"></div><input id="file-input" type="file" /><div id="reader-viewport"></div><div id="reader-content"></div><div id="book-title"></div><button id="btn-back"></button><button id="btn-settings"></button><button id="btn-toc"></button><button id="btn-first-page"></button><button id="btn-close-settings"></button><button id="btn-close-toc"></button><div id="settings-drawer"></div><div id="toc-drawer"></div><div id="toc-list"></div><div id="drawer-overlay"></div><div id="page-nav-left"></div><div id="page-nav-right"></div><div class="reader-header"></div><div class="reader-footer"></div><div class="progress-bar-container"></div><div id="progress-bar"></div><div id="reading-percentage"></div><div id="reading-index"></div><div id="developer-books-grid"></div><div id="reader-books-grid"></div><button id="btn-open-debug"></button><div id="debug-modal"></div><button id="btnCloseDebug"></button><button id="btn-close-debug"></button><div id="debug-modal-overlay"></div><div id="debug-monitor"></div><button id="btn-clear-bookmarks"></button><button id="btn-clear-config"></button><button id="btn-clear-all"></button><button id="btn-diagnose-layout"></button><button id="btn-copy-debug-report"></button><pre id="diagnose-report-output"></pre><button id="tab-btn-monitor"></button><button id="tab-btn-diagnose"></button><div id="debug-tab-content-monitor"></div><div id="debug-tab-content-diagnose"></div><textarea id="debug-history-json"></textarea><button id="btn-export-history"></button><button id="btn-import-history"></button></body></html>', {
    url: "http://localhost",
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});

const window = dom.window;
global.document = window.document;
global.window = window;

const appJsCode = fs.readFileSync(path.resolve(__dirname, '../main-min.js'), 'utf8');
const scriptEl = window.document.createElement('script');
scriptEl.textContent = appJsCode;
window.document.body.appendChild(scriptEl);

const booksDir = path.join(__dirname, '../src/books');
const files = fs.readdirSync(booksDir).filter(f => f.endsWith('.txt'));

console.log('========================================================================================');
console.log('        AOZORA BUNKO PARAGRAPH LENGTH STATISTICAL PERCENTILE ANALYSIS REPORT           ');
console.log('========================================================================================\n');

const allParagraphLengths = [];
const bookStats = [];

const parser = new window.Yuzora.AozoraParser();

function getPercentile(arr, p) {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, Math.min(arr.length - 1, index))];
}

files.forEach(file => {
    const filePath = path.join(booksDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const result = parser.parseText(content);
    const html = (result && typeof result === 'object') ? (result.body || '') : String(result);

    const tempDiv = window.document.createElement('div');
    tempDiv.innerHTML = html;
    const pElements = Array.from(tempDiv.querySelectorAll('p'));

    const bookLengths = pElements.map(p => p.textContent.trim().length).sort((a, b) => a - b);
    allParagraphLengths.push(...bookLengths);

    const sum = bookLengths.reduce((acc, val) => acc + val, 0);
    const mean = (sum / Math.max(1, bookLengths.length)).toFixed(1);

    bookStats.push({
        file,
        count: bookLengths.length,
        mean: parseFloat(mean),
        min: bookLengths[0] || 0,
        p5: getPercentile(bookLengths, 5),
        p10: getPercentile(bookLengths, 10),
        p25: getPercentile(bookLengths, 25),
        p50: getPercentile(bookLengths, 50),
        p75: getPercentile(bookLengths, 75),
        p90: getPercentile(bookLengths, 90),
        p95: getPercentile(bookLengths, 95),
        p99: getPercentile(bookLengths, 99),
        max: bookLengths[bookLengths.length - 1] || 0
    });
});

allParagraphLengths.sort((a, b) => a - b);

console.log('--- PER-BOOK STATISTICAL SUMMARY (CHARS) ---');
console.log('File             | Count | Mean | Min |  P5 | P10 | P25 | P50 | P75 | P90 | P95 | P99 | Max  ');
console.log('-----------------+-------+------+-----+-----+-----+-----+-----+-----+-----+-----+-----+------');

bookStats.forEach(s => {
    console.log(
        `${s.file.padEnd(16)} | ` +
        `${String(s.count).padStart(5)} | ` +
        `${String(s.mean.toFixed(1)).padStart(4)} | ` +
        `${String(s.min).padStart(3)} | ` +
        `${String(s.p5).padStart(3)} | ` +
        `${String(s.p10).padStart(3)} | ` +
        `${String(s.p25).padStart(3)} | ` +
        `${String(s.p50).padStart(3)} | ` +
        `${String(s.p75).padStart(3)} | ` +
        `${String(s.p90).padStart(3)} | ` +
        `${String(s.p95).padStart(3)} | ` +
        `${String(s.p99).padStart(3)} | ` +
        `${String(s.max).padStart(4)}`
    );
});

const totalCount = allParagraphLengths.length;
const totalSum = allParagraphLengths.reduce((a, b) => a + b, 0);
const overallMean = (totalSum / totalCount).toFixed(1);

console.log('\n========================================================================================');
console.log('               OVERALL AGGREGATE PERCENTILE DISTRIBUTION (38,656 PARAGRAPHS)            ');
console.log('========================================================================================');
console.log(`Total Books Analyzed       : ${files.length}`);
console.log(`Total Paragraphs Analyzed   : ${totalCount.toLocaleString()}`);
console.log(`Mean Paragraph Length      : ${overallMean} characters`);
console.log(`Min Paragraph Length       : ${allParagraphLengths[0]} characters`);
console.log(`P1  Percentile (1%)        : ${getPercentile(allParagraphLengths, 1)} characters`);
console.log(`P5  Percentile (5%)        : ${getPercentile(allParagraphLengths, 5)} characters`);
console.log(`P10 Percentile (10%)       : ${getPercentile(allParagraphLengths, 10)} characters`);
console.log(`P25 Percentile (25% Q1)    : ${getPercentile(allParagraphLengths, 25)} characters`);
console.log(`P50 Percentile (50% Median): ${getPercentile(allParagraphLengths, 50)} characters`);
console.log(`P75 Percentile (75% Q3)    : ${getPercentile(allParagraphLengths, 75)} characters`);
console.log(`P90 Percentile (90%)       : ${getPercentile(allParagraphLengths, 90)} characters`);
console.log(`P95 Percentile (95%)       : ${getPercentile(allParagraphLengths, 95)} characters`);
console.log(`P99 Percentile (99%)       : ${getPercentile(allParagraphLengths, 99)} characters`);
console.log(`P99.9 Percentile (99.9%)   : ${getPercentile(allParagraphLengths, 99.9)} characters`);
console.log(`Max Paragraph Length       : ${allParagraphLengths[totalCount - 1]} characters`);
console.log('========================================================================================\n');
