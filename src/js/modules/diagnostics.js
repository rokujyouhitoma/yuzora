/**
 * Yuzora - Layout Diagnostics & Boundary Checks Module
 */

function diagnoseEnvironmentInfo(currentPage, pageCount) {
    let html = "<h3>【診断レポート】</h3>";
    html += `<h4>[環境・基本情報]</h4>`;
    html += `- ビューポートサイズ (Width x Height): ${readerViewport.clientWidth}px x ${readerViewport.clientHeight}px\n`;
    html += `- スクロール可能幅 (scrollWidth): ${readerViewport.scrollWidth}px\n`;
    html += `- 現在の位置 (scrollLeft): ${readerViewport.scrollLeft}px\n`;
    html += `- 現在のページ / 総ページ数: ${currentPage} / ${pageCount}\n`;
    html += `- 表示方向 (Writing Mode / Direction): vertical-rl / ${config.direction}\n`;
    html += `- 設定 (Theme/Font/Size): theme-${config.theme} / ${config.font} / ${config.size}\n\n`;
    return html;
}

function diagnoseColumnsInfo(cStyle) {
    let html = `<h4>[段組み（Column）設定]</h4>`;
    html += `- column-width: ${cStyle.columnWidth}\n`;
    html += `- column-gap: ${cStyle.columnGap}\n`;
    html += `- column-count (計算値): ${cStyle.columnCount}\n`;
    html += `- column-fill: ${cStyle.columnFill}\n\n`;
    return html;
}

function diagnoseColumnWidthCheck(cStyle) {
    let html = `<h4>[段組み幅とビューポート整合性検証]</h4>`;
    const colWidth = parseFloat(cStyle.columnWidth);
    const vpWidth = readerViewport.clientWidth;
    
    if (!isNaN(colWidth) && colWidth > 0) {
        if (colWidth > vpWidth) {
            html += `[WARNING] 列幅 (${colWidth}px) がビューポート幅 (${vpWidth}px) を超えています。見切れの原因になります。\n`;
        } else {
            html += `[PASS] 列幅 (${colWidth}px) はビューポート内 (${vpWidth}px) に収まっています。\n`;
        }
    } else {
        html += `[INFO] column-width が具体的なピクセル値で設定されていません（自動レイアウト）。\n`;
    }
    html += `\n`;
    return html;
}

function diagnoseVerticalLayoutInfo(viewportRect, cStyle) {
    let html = `<h4>[縦書きレイアウト・コンテキスト情報]</h4>`;
    html += `- writing-mode: ${cStyle.writingMode}\n`;
    html += `- padding (Top/Right/Bottom/Left): ${cStyle.paddingTop} / ${cStyle.paddingRight} / ${cStyle.paddingBottom} / ${cStyle.paddingLeft}\n`;
    html += `- viewportBoundingRect (Top/Left/Width/Height): ${viewportRect.top}px / ${viewportRect.left}px / ${viewportRect.width}px / ${viewportRect.height}px\n\n`;
    return html;
}

function diagnoseParagraphCoordinateInfo(viewportRect, childNodes) {
    let html = `<h4>[段落ごとの絶対座標情報]</h4>`;
    let elementIndex = 0;
    
    childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const rect = child.getBoundingClientRect();
            html += `Element[${elementIndex}] (${child.tagName}.${child.className || "none"}):\n`;
            html += `  - Rect (Top/Left/Width/Height): ${rect.top.toFixed(1)}px / ${rect.left.toFixed(1)}px / ${rect.width.toFixed(1)}px / ${rect.height.toFixed(1)}px\n`;
            
            // Calc absolute position relative to document
            const absLeft = rect.left + readerViewport.scrollLeft;
            html += `  - Calc Absolute Left (rect.left + scrollLeft): ${absLeft.toFixed(1)}px\n`;
            elementIndex++;
        }
    });
    html += `\n`;
    return html;
}

function diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage) {
    let html = `<h4>[表示領域境界チェック（見切れ・重なり検証）]</h4>`;
    const colGap = 20; // Column gap buffer matching standard styles
    let elementIndex = 0;
    let overlapDetected = false;

    childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const rect = child.getBoundingClientRect();
            
            // Check top / bottom boundaries
            const isClippedTop = rect.top < viewportRect.top - 1;
            const isClippedBottom = rect.bottom > viewportRect.bottom + 1;
            
            if (isClippedTop || isClippedBottom) {
                html += `[FAIL] Element[${elementIndex}] (${child.tagName}) がビューポートの上下境界からはみ出しています！\n`;
                html += `  - Element Top/Bottom: ${rect.top.toFixed(1)}px / ${rect.bottom.toFixed(1)}px\n`;
                html += `  - Viewport Top/Bottom: ${viewportRect.top.toFixed(1)}px / ${viewportRect.bottom.toFixed(1)}px\n`;
                overlapDetected = true;
            }

            // Check if element left border crosses layout limits (horizontal scroll boundary check)
            // On page boundary, elements should align inside column rules
            const absLeft = rect.left - viewportRect.left;
            const absRight = rect.right - viewportRect.left;

            if (absLeft < -1 || absRight > viewportRect.width + 1) {
                // This means element is located outside the active visible page viewport segment
                // which is normal for other pages, but we only check for overlaps inside active column gaps
            }
            elementIndex++;
        }
    });

    if (!overlapDetected) {
        html += `[PASS] 検出されたすべての段落要素は、現在ページの上下表示境界内に収まっています。\n`;
    }
    
    html += `\n`;
    return html;
}

function runLayoutDiagnosis() {
    if (!readerViewport || !readerContent) return;

    const viewportRect = readerViewport.getBoundingClientRect();
    const childNodes = readerContent.childNodes;
    const cStyle = window.getComputedStyle(readerContent);

    const clientWidth = readerViewport.clientWidth;
    const currentScroll = Math.abs(readerViewport.scrollLeft);
    const currentPage = Math.round(currentScroll / clientWidth) + 1;
    const pageCount = Math.round(readerViewport.scrollWidth / clientWidth);

    let html = "";
    html += diagnoseEnvironmentInfo(currentPage, pageCount);
    html += diagnoseColumnsInfo(cStyle);
    html += diagnoseColumnWidthCheck(cStyle);
    html += diagnoseVerticalLayoutInfo(viewportRect, cStyle);
    html += diagnoseParagraphCoordinateInfo(viewportRect, childNodes);
    html += diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage);

    // Render diagnostic report to debug diagnostics tab textarea
    if (diagnoseReportOutput) {
        diagnoseReportOutput.value = html.replace(/<[^>]*>/g, ""); // Strip HTML markers for clean output log
    }

    console.log("Layout diagnosis execution finished.");
}

function findCharAtBoundary(element, boundaryX) {
    const range = document.createRange();
    const textNodes = [];

    // Extract all text nodes inside element
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node = walk.nextNode();
    while (node) {
        textNodes.push(node);
        node = walk.nextNode();
    }

    // Binary search over characters inside all text nodes
    for (const tNode of textNodes) {
        const text = tNode.textContent;
        for (let i = 0; i < text.length; i++) {
            range.setStart(tNode, i);
            range.setEnd(tNode, i + 1);
            const rect = range.getBoundingClientRect();
            
            // Check if character bounding rect covers boundary coordinates
            if (config.direction === "rtl") {
                if (rect.left <= boundaryX && rect.right >= boundaryX) {
                    return text.charAt(i);
                }
            } else {
                if (rect.left <= boundaryX && rect.right >= boundaryX) {
                    return text.charAt(i);
                }
            }
        }
    }
    return null;
}
