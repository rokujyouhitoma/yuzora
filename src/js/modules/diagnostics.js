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

function diagnoseParagraphCoordinateInfo(viewportRect, childNodes) {
    let report = `### 📏 可視要素の境界座標分布 (Y: ${viewportRect.top.toFixed(1)}px)\n`;
    let visibleParagraphsCount = 0;
    
    childNodes.forEach((child, index) => {
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

function diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage) {
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

    // eslint-disable-next-line complexity
    childNodes.forEach((child, index) => {
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

        const intersectsLeft = rect.left < boundaryLeft && rect.right > boundaryLeft;
        const intersectsRight = rect.left < boundaryRight && rect.right > boundaryRight;
        const childStyle = window.getComputedStyle(child);
        const fontInfo = `[font-size: ${childStyle.fontSize}, line-height: ${childStyle.lineHeight}, font-family: ${childStyle.fontFamily}]`;

        if (intersectsLeft) {
            leftBoundaryOverlapCount++;
            const boundaryCharInfo = findCharAtBoundary(child, boundaryLeft);
            overlapDetails += `- **左境界線との交差**: 段落 ${index + 1} (${child.tagName.toLowerCase()}) が左ページ境界 (X: ${boundaryLeft.toFixed(1)}px) をまたいでいます。 ${fontInfo}\n`;
            if (boundaryCharInfo && boundaryCharInfo.char) {
                const ctx = boundaryCharInfo.context;
                const charL = boundaryCharInfo.rect.left - viewportRect.left;
                const charR = boundaryCharInfo.rect.right - viewportRect.left;
                const overrun = viewportRect.left - boundaryCharInfo.rect.left;
                overlapDetails += `  - 境界上の文字: 「${ctx.before}**[${boundaryCharInfo.char}]**${ctx.after}」\n`;
                overlapDetails += `  - 文字座標 (viewport基準): left: ${charL.toFixed(1)}px, right: ${charR.toFixed(1)}px (幅: ${boundaryCharInfo.rect.width.toFixed(1)}px)\n`;
                overlapDetails += `  - 左境界はみ出し量 (overrun): **${overrun.toFixed(1)}px**\n`;
            } else {
                overlapDetails += `  - テキスト抜粋: 「${child.textContent.substring(0, 30)}...」\n`;
            }
        }

        if (intersectsRight) {
            rightBoundaryOverlapCount++;
            const boundaryCharInfo = findCharAtBoundary(child, boundaryRight);
            overlapDetails += `- **右境界線との交差**: 段落 ${index + 1} (${child.tagName.toLowerCase()}) が右ページ境界 (X: ${boundaryRight.toFixed(1)}px) をまたいでいます。 ${fontInfo}\n`;
            if (boundaryCharInfo && boundaryCharInfo.char) {
                const ctx = boundaryCharInfo.context;
                const charL = boundaryCharInfo.rect.left - viewportRect.left;
                const charR = boundaryCharInfo.rect.right - viewportRect.left;
                const overrun = boundaryCharInfo.rect.right - viewportRect.right;
                overlapDetails += `  - 境界上の文字: 「${ctx.before}**[${boundaryCharInfo.char}]**${ctx.after}」\n`;
                overlapDetails += `  - 文字座標 (viewport基準): left: ${charL.toFixed(1)}px, right: ${charR.toFixed(1)}px (幅: ${boundaryCharInfo.rect.width.toFixed(1)}px)\n`;
                overlapDetails += `  - 右境界はみ出し量 (overrun): **${overrun.toFixed(1)}px**\n`;
            } else {
                overlapDetails += `  - テキスト抜粋: 「${child.textContent.substring(0, 30)}...」\n`;
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

function runLayoutDiagnosis() {
    const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
    if (!viewContext.readerViewport || !viewContext.readerContent) {
        return "エラー: ビューアーが初期化されていません。";
    }

    const { currentPage, pageCount } = getCurrentPageAndCount(viewContext.readerViewport);
    const cStyle = window.getComputedStyle(viewContext.readerContent);
    const viewportRect = viewContext.readerViewport.getBoundingClientRect();
    const childNodes = Array.from(viewContext.readerContent.children);

    let report = '';
    report += diagnoseEnvironmentInfo(currentPage, pageCount);
    report += diagnoseColumnsInfo(cStyle);
    report += diagnoseColumnWidthCheck(cStyle);
    report += diagnoseVerticalLayoutInfo(viewportRect, cStyle);
    report += diagnoseParagraphCoordinateInfo(viewportRect, childNodes);
    report += diagnoseBoundaryOverlap(viewportRect, childNodes, currentPage);

    // Render diagnostic report to debug diagnostics tab textarea
    if (viewContext.diagnoseReportOutput) {
        viewContext.diagnoseReportOutput.textContent = report;
    }

    return report;
}

function findCharAtBoundary(element, boundaryX) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }

    let closestMatch = null;
    let minDiff = Infinity;

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
            
            if (rect.left <= boundaryX && rect.right >= boundaryX) {
                const before = text.substring(Math.max(0, i - 10), i);
                const after = text.substring(i + 1, Math.min(text.length, i + 11));
                return {
                    char: text[i],
                    rect: rect,
                    context: { before, after }
                };
            }

            const diff = Math.min(Math.abs(rect.left - boundaryX), Math.abs(rect.right - boundaryX));
            if (diff < minDiff) {
                minDiff = diff;
                closestMatch = {
                    char: text[i],
                    rect: rect,
                    node: node,
                    index: i
                };
            }
        }
    }

    if (closestMatch) {
        const text = closestMatch.node.textContent;
        const i = closestMatch.index;
        const before = text.substring(Math.max(0, i - 10), i);
        const after = text.substring(i + 1, Math.min(text.length, i + 11));
        return {
            char: closestMatch.char,
            rect: closestMatch.rect,
            context: { before, after }
        };
    }

    return null;
}
