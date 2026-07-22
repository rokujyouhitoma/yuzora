/**
 * Yuzora - Layout Diagnostics & Boundary Checks Module
 */
"use strict";

function getCurrentPageAndCount(viewport) {
    if (!viewport) {
        return { currentPage: 0, pageCount: 0 };
    }
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const currentScroll = Math.abs(viewport.scrollLeft);
    const pageCount = Math.round(viewport.scrollWidth / viewport.clientWidth) || 0;
    const currentPage = maxScroll > 0 
        ? (Math.round(currentScroll / viewport.clientWidth) + 1) 
        : (pageCount > 0 ? 1 : 0);
    return { currentPage, pageCount };
}

function diagnoseEnvironmentInfo(currentPage, pageCount) {
    const bookModel = /** @type {!BookModelInterface} */ (Yuzora.locator.resolve(BookModel));
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    const bookmarkModel = /** @type {!BookmarkModelInterface} */ (Yuzora.locator.resolve(BookmarkModel));
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));

    let report = `### 📖 ゆうぞら レイアウト診断レポート\n`;
    report += `- **日時**: ${new Date().toLocaleString()}\n`;
    report += `- **ファイル名**: ${bookModel.title || '(未ロード)'}\n`;
    report += `- **ファイル種別**: ${bookModel.type || '(なし)'}\n`;
    report += `- **表示設定**:\n`;
    report += `  - テーマ: ${configModel.theme}\n`;
    report += `  - 書体: ${configModel.font === 'font-mincho' ? '明朝体' : 'ゴシック体'}\n`;
    report += `  - 送り方向: ${configModel.direction === 'rtl' ? '右から左 (RTL)' : '左から右 (LTR)'}\n`;
    report += `  - 文字サイズ: ${configModel.size}\n`;
    report += `  - 行間: ${configModel.lh}\n`;
    report += `  - 文字間: ${configModel.spacing}\n`;
    report += `- **画面サイズ**:\n`;
    report += `  - ビューポート幅(clientWidth): ${viewContext.readerViewport.clientWidth}px\n`;
    report += `  - ビューポート高(clientHeight): ${viewContext.readerViewport.clientHeight}px\n`;
    report += `  - コンテンツ全体幅(scrollWidth): ${viewContext.readerViewport.scrollWidth}px\n`;
    report += `- **スクロール状態**:\n`;
    report += `  - scrollLeft: ${viewContext.readerViewport.scrollLeft}px\n`;
    report += `  - 進捗割合(bookmarkProgress): ${(bookmarkModel.bookmarkProgress * 100).toFixed(1)}%\n`;
    report += `  - ページ数: 現在 ${currentPage} / ${pageCount} ページ\n\n`;
    return report;
}

function diagnoseColumnsInfo(cStyle) {
    const colWidthStr = cStyle.columnWidth || 'auto';
    const colGapStr = cStyle.columnGap || 'normal';
    const marginLeftStr = cStyle.marginLeft || '0px';
    const marginRightStr = cStyle.marginRight || '0px';

    let report = `### 📐 カラム＆ビューポート計算検証\n`;
    report += `- **コンテンツ配置スタイル**:\n`;
    report += `  - column-width: ${colWidthStr}\n`;
    report += `  - column-gap: ${colGapStr}\n`;
    report += `  - margin-left: ${marginLeftStr}\n`;
    report += `  - margin-right: ${marginRightStr}\n`;
    report += `\n`;
    return report;
}

// eslint-disable-next-line complexity
function diagnoseColumnWidthCheck(cStyle) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const colWidthStr = cStyle.columnWidth || 'auto';
    const marginLeftStr = cStyle.marginLeft || '0px';
    const marginRightStr = cStyle.marginRight || '0px';
    const viewportW = viewContext.readerViewport.clientWidth;
    const colWidthVal = parseFloat(colWidthStr) || 0;
    const mLeftVal = parseFloat(marginLeftStr) || 0;
    const mRightVal = parseFloat(marginRightStr) || 0;
    const isMobile = window.innerWidth < 768;
    const expectedColWidth = isMobile ? (viewportW - mLeftVal - mRightVal) : (viewportW / 2 - mLeftVal - mRightVal);
    const colWidthDiff = Math.abs(colWidthVal - expectedColWidth);

    let report = `- **カラム仕様チェック**:\n`;
    report += `  - デバイス環境: ${isMobile ? 'モバイル (1段組み)' : 'PC (見開き2段組み)'}\n`;
    report += `  - 理論上の理想カラム幅: ${expectedColWidth.toFixed(1)}px (計算式: ${isMobile ? 'W - margins' : 'W/2 - margins'})\n`;
    report += `  - 実際のカラム幅: ${colWidthVal.toFixed(1)}px\n`;
    if (colWidthDiff > 2) {
        report += `  - ⚠️ **警告**: 実際のカラム幅が理想の幅と ${colWidthDiff.toFixed(1)}px ズレています。改段ずれの原因となります。\n`;
    } else {
        report += `  - ✅ **正常**: カラム幅はレイアウト設計通りです。\n`;
    }
    report += `\n`;
    return report;
}

function diagnoseVerticalLayoutInfo(viewportRect, cStyle) {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    let report = `### 📐 縦方向レイアウト配置\n`;
    const header = document.querySelector('.reader-header');
    const footer = document.querySelector('.reader-footer');
    if (header && footer) {
        const hRect = header.getBoundingClientRect();
        const fRect = footer.getBoundingClientRect();
        const cRect = viewContext.readerContent.getBoundingClientRect();
        
        report += `- **ヘッダー Y座標範囲**: ${hRect.top.toFixed(1)}px 〜 ${hRect.bottom.toFixed(1)}px (高さ: ${hRect.height.toFixed(1)}px)\n`;
        report += `- **フッター Y座標範囲**: ${fRect.top.toFixed(1)}px 〜 ${fRect.bottom.toFixed(1)}px (高さ: ${fRect.height.toFixed(1)}px)\n`;
        report += `- **ビューポート高**: ${viewportRect.height.toFixed(1)}px\n`;
        report += `- **コンテンツ Y座標範囲**: ${cRect.top.toFixed(1)}px 〜 ${cRect.bottom.toFixed(1)}px (高さ: ${cRect.height.toFixed(1)}px)\n`;
        report += `  - margin-top: ${cStyle.marginTop}\n`;
        report += `  - margin-bottom: ${cStyle.marginBottom}\n`;
        report += `  - margin-left: ${cStyle.marginLeft}\n`;
        report += `  - margin-right: ${cStyle.marginRight}\n`;
        const overlapHeader = cRect.top < hRect.bottom;
        const overlapFooter = cRect.bottom > fRect.top;
        report += `  - ヘッダーとの重複: ${overlapHeader ? `⚠️ あり (重複高: ${(hRect.bottom - cRect.top).toFixed(1)}px)` : '✅ なし'}\n`;
        report += `  - フッターとの重複: ${overlapFooter ? `⚠️ あり (重複高: ${(cRect.bottom - fRect.top).toFixed(1)}px)` : '✅ なし'}\n`;
        report += `  - フッターとの間の余白: ${(fRect.top - cRect.bottom).toFixed(1)}px\n\n`;
    }
    return report;
}

/**
 * Time-slice array iteration helper to prevent main thread blocking.
 * @template T
 * @param {!Array<T>} array
 * @param {number} batchSize
 * @param {function(number):void} onProgress Called with percentage (0 to 100).
 * @param {function(T, number):void} callback
 * @return {!Promise<void>}
 */
async function timeSliceEach(array, batchSize, onProgress, callback) {
    for (let i = 0; i < array.length; i += batchSize) {
        const chunk = array.slice(i, i + batchSize);
        chunk.forEach((item, j) => {
            callback(item, i + j);
        });
        
        const progress = Math.round(((i + chunk.length) / array.length) * 100);
        onProgress(progress);
        
        await new Promise(resolve => {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => {
                    setTimeout(resolve, 0);
                });
            } else {
                setTimeout(resolve, 0);
            }
        });
    }
}

/**
 * @param {!ClientRect|!DOMRect} viewportRect
 * @param {!Array<!Element>} childNodes
 * @param {function(string):void} onProgressText Called to update intermediate progress text.
 * @return {!Promise<string>}
 */
async function diagnoseParagraphCoordinateInfo(viewportRect, childNodes, onProgressText) {
    let report = `### 📏 可視要素の境界座標分布 (Y: ${viewportRect.top.toFixed(1)}px)\n`;
    let visibleParagraphsCount = 0;
    
    await timeSliceEach(childNodes, 20, (pct) => {
        onProgressText(`レイアウト座標診断中... ${pct}%`);
    }, (child, index) => {
        if (child.classList.contains('empty-line') || child.classList.contains('page-break')) {
            return;
        }
        const rect = child.getBoundingClientRect();
        const leftOffset = rect.left - viewportRect.left;
        const rightOffset = rect.right - viewportRect.left;
        
        const isVisible = rect.right >= viewportRect.left - 5 && rect.left <= viewportRect.right + 5;
        if (isVisible) {
            visibleParagraphsCount++;
            const bleedsLeft = leftOffset < -1;
            const bleedsRight = rightOffset > viewportRect.width + 1;
            const pText = child.textContent.trim().substring(0, 15);
            report += `- **段落 ${index + 1} (${child.tagName.toLowerCase()})**: X範囲: ${leftOffset.toFixed(1)}px 〜 ${rightOffset.toFixed(1)}px (幅: ${rect.width.toFixed(1)}px) 「${pText}...」\n`;
            if (bleedsLeft) {
                report += `  - ⚠️ **はみ出し**: 左境界を ${(-leftOffset).toFixed(1)}px 超過しています (次のページに回り込んでいるか、見切れています)\n`;
            }
            if (bleedsRight) {
                report += `  - ⚠️ **はみ出し**: 右境界を ${(rightOffset - viewportRect.width).toFixed(1)}px 超過しています (前のページから回り込んでいるか、見切れています)\n`;
            }
        }
    });
    if (visibleParagraphsCount === 0) {
        report += `- (可視段落は検出されませんでした)\n`;
    }
    report += `\n`;
    return report;
}

/**
 * @param {!ClientRect|!DOMRect} viewportRect
 * @param {!Array<!Element>} childNodes
 * @param {number} currentPage
 * @param {function(string):void} onProgressText Called to update intermediate progress text.
 * @return {!Promise<string>}
 */
async function diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage, onProgressText) {
    const configModel = /** @type {!ConfigModelInterface} */ (Yuzora.locator.resolve(ConfigModel));
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    const expectedScrollMultiplier = currentPage - 1;
    const idealScrollLeft = configModel.direction === 'rtl' 
        ? -(expectedScrollMultiplier * viewContext.readerViewport.clientWidth)
        : (expectedScrollMultiplier * viewContext.readerViewport.clientWidth);
    
    const scrollDifference = Math.abs(viewContext.readerViewport.scrollLeft - idealScrollLeft);

    let report = `### 📐 アライメント検証\n`;
    report += `- **現在のページの理想スクロール位置**: ${idealScrollLeft}px\n`;
    report += `- **実際のスクロール位置とのズレ**: ${scrollDifference}px\n`;
    if (scrollDifference > 5) {
        report += `  - ⚠️ **警告**: スクロール位置がページの区切りから ${scrollDifference}px ズレています。文字が見切れる原因になっている可能性があります。\n`;
    } else {
        report += `  - ✅ **正常**: スクロール位置は正しく配置されています。\n`;
    }
    report += `\n`;

    report += `### ⚠️ 境界線上でのテキスト見切れ検出\n`;
    
    const boundaryLeft = viewportRect.left;
    const boundaryRight = viewportRect.right;
    let leftBoundaryOverlapCount = 0;
    let rightBoundaryOverlapCount = 0;
    let verticalBoundaryOverlapCount = 0;
    let overlapDetails = '';

    await timeSliceEach(childNodes, 20, (pct) => {
        onProgressText(`境界見切れ診断中... ${pct}%`);
    }, // eslint-disable-next-line complexity
    (child, index) => {
        if (child.classList.contains('empty-line') || child.classList.contains('page-break')) {
            return;
        }

        const rect = child.getBoundingClientRect();
        const isNearViewport = rect.right >= viewportRect.left - 50 && rect.left <= viewportRect.right + 50;
        if (!isNearViewport) return;

        const overflowTop = rect.top < viewportRect.top - 2;
        const overflowBottom = rect.bottom > viewportRect.bottom + 2;
        if (overflowTop || overflowBottom) {
            overlapDetails += `- **縦方向はみ出し**: 段落 ${index + 1} (${child.tagName.toLowerCase()}) がビューポートの上下境界からはみ出しています。\n`;
            overlapDetails += `  - 要素 of Y座標範囲: ${rect.top.toFixed(1)}px 〜 ${rect.bottom.toFixed(1)}px (ビューポート: ${viewportRect.top.toFixed(1)}px 〜 ${viewportRect.bottom.toFixed(1)}px)\n`;
            overlapDetails += `  - テキスト抜粋: 「${child.textContent.substring(0, 30)}...」\n`;
            verticalBoundaryOverlapCount++;
        }

        const childStyle = window.getComputedStyle(child);
        const fontInfo = `[font-size: ${childStyle.fontSize}, line-height: ${childStyle.lineHeight}, font-family: ${childStyle.fontFamily}]`;

        // In RTL multi-column layout, a paragraph on page 1 may naturally extend past
        // the viewport's left edge (boundaryLeft ≈ 0px) due to column wrapping.
        // This is not a true overrun — the content flows into the next column on the same page.
        // Exclude this false positive when we are on page 1 and the scroll position is at origin.
        const isFirstPageLeftEdge = currentPage === 1 && Math.abs(viewContext.readerViewport.scrollLeft) < 1;
        const intersectsLeft = rect.left < boundaryLeft && rect.right > boundaryLeft && !isFirstPageLeftEdge;
        if (intersectsLeft) {
            const boundaryCharInfo = findCharAtBoundary(child, boundaryLeft);
            if (boundaryCharInfo) {
                leftBoundaryOverlapCount++;
                const ctx = boundaryCharInfo.context;
                const charL = boundaryCharInfo.rect.left - viewportRect.left;
                const charR = boundaryCharInfo.rect.right - viewportRect.left;
                const overrun = viewportRect.left - boundaryCharInfo.rect.left;
                overlapDetails += `- **左境界線との交差**: 段落 ${index + 1} (${child.tagName.toLowerCase()}) が左ページ境界 (X: ${boundaryLeft.toFixed(1)}px) をまたいでいます。 ${fontInfo}\n`;
                overlapDetails += `  - 境界上の文字: 「${ctx.before}**[${boundaryCharInfo.char}]**${ctx.after}」\n`;
                overlapDetails += `  - 文字座標 (viewport基準): left: ${charL.toFixed(1)}px, right: ${charR.toFixed(1)}px (幅: ${boundaryCharInfo.rect.width.toFixed(1)}px)\n`;
                overlapDetails += `  - 左境界はみ出し量 (overrun): **${overrun.toFixed(1)}px**\n`;
            }
        }

        const intersectsRight = rect.left < boundaryRight && rect.right > boundaryRight;
        if (intersectsRight) {
            const boundaryCharInfo = findCharAtBoundary(child, boundaryRight);
            if (boundaryCharInfo) {
                rightBoundaryOverlapCount++;
                const ctx = boundaryCharInfo.context;
                const charL = boundaryCharInfo.rect.left - viewportRect.left;
                const charR = boundaryCharInfo.rect.right - viewportRect.left;
                const overrun = boundaryCharInfo.rect.right - viewportRect.right;
                overlapDetails += `- **右境界線との交差**: 段落 ${index + 1} (${child.tagName.toLowerCase()}) が右ページ境界 (X: ${boundaryRight.toFixed(1)}px) をまたいでいます。 ${fontInfo}\n`;
                overlapDetails += `  - 境界上の文字: 「${ctx.before}**[${boundaryCharInfo.char}]**${ctx.after}」\n`;
                overlapDetails += `  - 文字座標 (viewport基準): left: ${charL.toFixed(1)}px, right: ${charR.toFixed(1)}px (幅: ${boundaryCharInfo.rect.width.toFixed(1)}px)\n`;
                overlapDetails += `  - 右境界はみ出し量 (overrun): **${overrun.toFixed(1)}px**\n`;
            }
        }
    });

    if (leftBoundaryOverlapCount === 0 && rightBoundaryOverlapCount === 0 && verticalBoundaryOverlapCount === 0) {
        report += `- ✅ 境界線上の見切れやはみ出しは検出されませんでした。\n`;
    } else {
        report += `- 検出サマリー: 左境界またぎ ${leftBoundaryOverlapCount}件, 右境界またぎ ${rightBoundaryOverlapCount}件, 上下はみ出し ${verticalBoundaryOverlapCount}件\n\n`;
        report += overlapDetails;
    }
    return report;
}

/**
 * @return {string}
 */
function diagnosePerformanceSLO() {
    const renderer = Yuzora.locator.resolve(VerticalRenderer);
    const lastMetrics = renderer ? renderer.lastRepairMetrics : null;

    let report = `### ⚡ パフォーマンス SLA / SLO 計測\n`;
    const targetRenderMs = 1000;
    if (lastMetrics) {
        const renderMs = lastMetrics.durationMs;
        const passRender = renderMs <= targetRenderMs;
        report += `- **初回レイアウト描画時間 SLO (<= 1000ms)**: ${renderMs.toFixed(1)}ms (${passRender ? '✅ PASS' : '⚠️ SLO_VIOLATION'})\n`;
    } else {
        report += `- **初回レイアウト描画時間 SLO**: 未計測\n`;
    }
    report += `\n`;
    return report;
}

async function runLayoutDiagnosis() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (!viewContext.readerViewport || !viewContext.readerContent) {
        return Promise.resolve("エラー: ビューアーが初期化されていません。");
    }

    const updateProgressText = (text) => {
        if (viewContext.diagnoseReportOutput) {
            viewContext.diagnoseReportOutput.textContent = text;
        }
    };

    updateProgressText("診断中... 環境情報を取得しています。");

    const { currentPage, pageCount } = getCurrentPageAndCount(viewContext.readerViewport);
    const cStyle = window.getComputedStyle(viewContext.readerContent);
    const viewportRect = viewContext.readerViewport.getBoundingClientRect();
    const childNodes = Array.from(viewContext.readerContent.children);

    let report = '';
    report += diagnoseEnvironmentInfo(currentPage, pageCount);
    report += diagnosePerformanceSLO();
    report += diagnoseColumnsInfo(cStyle);
    report += diagnoseColumnWidthCheck(cStyle);
    report += diagnoseVerticalLayoutInfo(viewportRect, cStyle);

    // Asynchronous diagnosis sections with time-slicing
    report += await diagnoseParagraphCoordinateInfo(viewportRect, childNodes, updateProgressText);
    report += await diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage, updateProgressText);

    // Retrieve layout repair metrics from renderer
    const renderer = Yuzora.locator.resolve(VerticalRenderer);
    if (renderer && renderer.lastRepairMetrics) {
        const metrics = renderer.lastRepairMetrics;
        report += `### 🛠️ レイアウト自己修復ステータス\n`;
        report += `- **修復状態**: ${metrics.passesCount >= 30 ? '⚠️ ループ上限到達 (未収束)' : '✅ 収束完了 (正常)'}\n`;
        report += `- **実行パス数**: ${metrics.passesCount}回\n`;
        report += `- **挿入された改ページ数**: ${metrics.insertedCount}個\n`;
        report += `- **処理所要時間**: ${metrics.durationMs.toFixed(1)}ms\n\n`;
    }

    // Render final diagnostic report
    updateProgressText(report);

    return report;
}

function findCharAtBoundary(element, boundaryX) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }

    for (const node of textNodes) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
            const range = document.createRange();
            try {
                range.setStart(node, i);
                range.setEnd(node, i + 1);
            } catch (e) {
                continue;
            }
            const rect = range.getBoundingClientRect();
            
            if (rect.left < boundaryX - 0.5 && rect.right > boundaryX + 0.5) {
                const before = text.substring(Math.max(0, i - 10), i);
                const after = text.substring(i + 1, Math.min(text.length, i + 11));
                return {
                    char: text[i],
                    rect: rect,
                    context: { before, after }
                };
            }
        }
    }

    return null;
}

class ErrorBoundary {
    constructor() {
        /** @type {!Array<!Object>} */
        this.capturedErrors = [];
    }

    setup() {
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error ? event.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: event.reason ? (event.reason.message || String(event.reason)) : 'Unhandled Rejection',
                error: event.reason ? event.reason.stack : null
            });
        });
    }

    logError(info) {
        this.capturedErrors.push(Object.assign({
            timestamp: new Date().toISOString()
        }, info));
    }

    exportDiagnosticReport() {
        let commandManager = null;
        try {
            commandManager = Yuzora.locator.resolve(CommandManager);
        } catch (e) {
            commandManager = null;
        }
        const reportData = {
            appName: 'Yuzora',
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
            errors: this.capturedErrors,
            history: commandManager ? commandManager.exportJSON() : null
        };
        return JSON.stringify(reportData, null, 2);
    }
}

ErrorBoundary.prototype['setup'] = ErrorBoundary.prototype.setup;
ErrorBoundary.prototype['logError'] = ErrorBoundary.prototype.logError;
ErrorBoundary.prototype['exportDiagnosticReport'] = ErrorBoundary.prototype.exportDiagnosticReport;

if (typeof window !== 'undefined') {
    window.ErrorBoundary = ErrorBoundary;
}

