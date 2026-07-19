const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/');
  
  // Wait and open "こころ"
  await page.waitForSelector('.book-card');
  await page.click('.book-card:has-text("こころ")');
  await page.waitForSelector('#reader-viewport');
  
  console.log('Book loaded. Standard Yuzora environment initialized.');

  // 実験1: Yuzora環境で、p-afterの直後にあるスタイルと座標を測定
  // まず、HTMLを注入
  await page.evaluate(() => {
    const content = document.getElementById('reader-content');
    content.style.blockSize = 'max-content';
    const longTextBefore = "これは改ページ前の非常に長い段落テキストです。".repeat(40);
    const longTextAfter = "これは改ページ後の非常に長い段落テキストです。確実に次のカラムに行く必要があります。".repeat(40);
    content.innerHTML = `
      <p id="p-before">${longTextBefore}</p>
      <div class="page-break" id="test-page-break"></div>
      <p id="p-after">${longTextAfter}</p>
    `;
  });

  await page.waitForTimeout(500);

  // 座標を測定
  let rectBefore = await page.locator('#p-before').boundingBox();
  let rectAfter = await page.locator('#p-after').boundingBox();
  let diffX = rectAfter.x - rectBefore.x;
  console.log(`\n[Test 1 - Standard page-break + *]`);
  console.log(`  Before: x=${rectBefore.x.toFixed(2)}, y=${rectBefore.y.toFixed(2)}, w=${rectBefore.width.toFixed(2)}`);
  console.log(`  After : x=${rectAfter.x.toFixed(2)}, y=${rectAfter.y.toFixed(2)}, w=${rectAfter.width.toFixed(2)}`);
  console.log(`  Diff X: ${diffX.toFixed(2)}px (Column break: ${diffX < -150 ? 'SUCCESS' : 'FAILED'})`);

  // 実験2: p-afterの直後セレクタではなく、p-after自身のbreak-before: columnを取り除いたらどうなるか？
  // つまり、.page-break + * のCSSルールが本当に効いているのかを確認。
  // JavaScriptで .page-break + * に相当するスタイルを無効化、あるいは別名のIDに切り替えてみる。
  await page.evaluate(() => {
    const content = document.getElementById('reader-content');
    content.innerHTML = `
      <p id="p-before-no">${"これは改ページ前の非常に長い段落テキストです。".repeat(40)}</p>
      <div class="no-page-break" id="test-page-break-no"></div>
      <p id="p-after-no">${"これは改ページ後の非常に長い段落テキストです。".repeat(40)}</p>
    `;
  });

  await page.waitForTimeout(500);

  let rectBeforeNo = await page.locator('#p-before-no').boundingBox();
  let rectAfterNo = await page.locator('#p-after-no').boundingBox();
  let diffXNo = rectAfterNo.x - rectBeforeNo.x;
  console.log(`\n[Test 2 - Without page-break class (just two paragraphs with a no-class div)]`);
  console.log(`  Before: x=${rectBeforeNo.x.toFixed(2)}, y=${rectBeforeNo.y.toFixed(2)}, w=${rectBeforeNo.width.toFixed(2)}`);
  console.log(`  After : x=${rectAfterNo.x.toFixed(2)}, y=${rectAfterNo.y.toFixed(2)}, w=${rectAfterNo.width.toFixed(2)}`);
  console.log(`  Diff X: ${diffXNo.toFixed(2)}px (Column break: ${diffXNo < -150 ? 'SUCCESS' : 'FAILED'})`);

  // 実験3: テキストが「短い」場合でも改カラムされるか？
  // (これが実験用HTMLでFAILEDになった主要原因か？)
  await page.evaluate(() => {
    const content = document.getElementById('reader-content');
    content.innerHTML = `
      <p id="p-before-short">これは短い段落です。</p>
      <div class="page-break" id="test-page-break-short"></div>
      <p id="p-after-short">これは改ページ後の短い段落です。</p>
    `;
  });

  await page.waitForTimeout(500);

  let rectBeforeShort = await page.locator('#p-before-short').boundingBox();
  let rectAfterShort = await page.locator('#p-after-short').boundingBox();
  let diffXShort = rectAfterShort.x - rectBeforeShort.x;
  console.log(`\n[Test 3 - Short text with page-break + *]`);
  console.log(`  Before: x=${rectBeforeShort.x.toFixed(2)}, y=${rectBeforeShort.y.toFixed(2)}, w=${rectBeforeShort.width.toFixed(2)}`);
  console.log(`  After : x=${rectAfterShort.x.toFixed(2)}, y=${rectAfterShort.y.toFixed(2)}, w=${rectAfterShort.width.toFixed(2)}`);
  console.log(`  Diff X: ${diffXShort.toFixed(2)}px (Column break: ${diffXShort < -150 ? 'SUCCESS' : 'FAILED'})`);

  // 実験4: もし、.page-breakの直後に段落がない（例えば、テキストノードがコンテナ直下にある）場合や、
  // .page-breakの直後に p がない場合。
  // 例えば、.page-break の直後に別の page-break が連続していたり、
  // 改ページの手前にインライン要素がある場合は？

  await browser.close();
})();
