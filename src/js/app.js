/**
 * ゆうぞら - 青空文庫 縦書きビューアー JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const app = document.getElementById('app');
    const welcomeScreen = document.getElementById('welcome-screen');
    const readerScreen = document.getElementById('reader-screen');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const readerViewport = document.getElementById('reader-viewport');
    const readerContent = document.getElementById('reader-content');
    const bookTitle = document.getElementById('book-title');
    
    // Controls & Navigation
    const btnBack = document.getElementById('btn-back');
    const btnSettings = document.getElementById('btn-settings');
    const btnTOC = document.getElementById('btn-toc');
    const btnFirstPage = document.getElementById('btn-first-page');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnCloseTOC = document.getElementById('btn-close-toc');
    const settingsDrawer = document.getElementById('settings-drawer');
    const tocDrawer = document.getElementById('toc-drawer');
    const tocList = document.getElementById('toc-list');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const pageNavLeft = document.getElementById('page-nav-left');
    const pageNavRight = document.getElementById('page-nav-right');
    const readerHeader = document.querySelector('.reader-header');
    const readerFooter = document.querySelector('.reader-footer');
    
    // Progress
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const readingPercentage = document.getElementById('reading-percentage');
    const readingIndex = document.getElementById('reading-index');
    
    // Predefined Books Grid
    const developerBooksGrid = document.getElementById('developer-books-grid');
    const readerBooksGrid = document.getElementById('reader-books-grid');

    // Debug Modal Elements
    const btnOpenDebug = document.getElementById('btn-open-debug');
    const debugModal = document.getElementById('debug-modal');
    const btnCloseDebug = document.getElementById('btn-close-debug');
    const debugModalOverlay = document.getElementById('debug-modal-overlay');
    const debugMonitor = document.getElementById('debug-monitor');
    const btnClearBookmarks = document.getElementById('btn-clear-bookmarks');
    const btnClearConfig = document.getElementById('btn-clear-config');
    const btnClearAll = document.getElementById('btn-clear-all');

    // Layout Diagnostics Elements
    const btnDiagnoseLayout = document.getElementById('btn-diagnose-layout');
    const btnCopyDebugReport = document.getElementById('btn-copy-debug-report');
    const diagnoseReportOutput = document.getElementById('diagnose-report-output');

    // Debug Tabs Elements
    const tabBtnMonitor = document.getElementById('tab-btn-monitor');
    const tabBtnDiagnose = document.getElementById('tab-btn-diagnose');
    const tabContentMonitor = document.getElementById('debug-tab-content-monitor');
    const tabContentDiagnose = document.getElementById('debug-tab-content-diagnose');

    const PREDEFINED_BOOKS = [
        // 開発者のオススメ本
        { id: "kokoro", title: "こころ", shortTitle: "こころ", cardId: 773, path: "src/books/773_yoko.txt", category: "developer", author: "夏目漱石", meta: "夏目漱石" },
        { id: "gokyo", title: "故郷", shortTitle: "故郷", cardId: 42939, path: "src/books/42939_yoko.txt", category: "developer", author: "魯迅", meta: "魯迅" },

        // 読書家のオススメ本
        { id: "musashi_01", title: "宮本武蔵 01 序、はしがき", shortTitle: "序、はしがき", cardId: 52395, path: "src/books/52395_yoko.txt", category: "reader", author: "吉川英治", meta: "01" },
        { id: "musashi_02", title: "宮本武蔵 02 地の巻", shortTitle: "地の巻", cardId: 52396, path: "src/books/52396_yoko.txt", category: "reader", author: "吉川英治", meta: "02" },
        { id: "musashi_03", title: "宮本武蔵 03 水の巻", shortTitle: "水の巻", cardId: 52397, path: "src/books/52397_yoko.txt", category: "reader", author: "吉川英治", meta: "03" },
        { id: "musashi_04", title: "宮本武蔵 04 火の巻", shortTitle: "火の巻", cardId: 52398, path: "src/books/52398_yoko.txt", category: "reader", author: "吉川英治", meta: "04" },
        { id: "musashi_05", title: "宮本武蔵 05 風の巻", shortTitle: "風の巻", cardId: 52399, path: "src/books/52399_yoko.txt", category: "reader", author: "吉川英治", meta: "05" },
        { id: "musashi_06", title: "宮本武蔵 06 空の巻", shortTitle: "空の巻", cardId: 52400, path: "src/books/52400_yoko.txt", category: "reader", author: "吉川英治", meta: "06" },
        { id: "musashi_07", title: "宮本武蔵 07 二天の巻", shortTitle: "二天の巻", cardId: 52401, path: "src/books/52401_yoko.txt", category: "reader", author: "吉川英治", meta: "07" },
        { id: "musashi_08", title: "宮本武蔵 08 円明の巻", shortTitle: "円明の巻", cardId: 52402, path: "src/books/52402_yoko.txt", category: "reader", author: "吉川英治", meta: "08" }
    ];

    // ==========================================================================
    // State Variables
    // ==========================================================================
    let currentFileName = '';
    let currentFileContent = '';
    let currentFileType = ''; // 'txt' or 'html'
    let bookmarkProgress = 0; // 0 to 1 scroll percentage
    let headerTimeout = null;
    let isReflowing = false;
    let currentTOC = [];

    // Viewport layout configurations
    const config = {
        theme: 'sepia',
        font: 'font-mincho',
        direction: 'rtl',
        size: 'size-md',
        lh: 'line-height-normal',
        spacing: 'spacing-normal'
    };

    // ==========================================================================
    // Initialization & Event Listeners
    // ==========================================================================
    loadSettings();
    applySettings();

    // File Drop & Select Events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drawer settings & TOC toggle
    if (btnSettings) btnSettings.addEventListener('click', openSettings);
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
    
    if (btnTOC) btnTOC.addEventListener('click', openTOC);
    if (btnCloseTOC) btnCloseTOC.addEventListener('click', closeTOC);

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', () => {
            closeSettings();
            closeTOC();
        });
    }

    // Back to Welcome Screen
    btnBack.addEventListener('click', () => {
        saveBookmark();
        readerScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        currentFileName = '';
        currentFileContent = '';
        document.title = 'ゆうぞら - 青空文庫縦書きビューアー';
    });

    // Debug Modal toggle & actions
    if (btnOpenDebug) {
        btnOpenDebug.addEventListener('click', () => {
            closeSettings(); // close drawer
            debugModal.classList.remove('hidden');
            debugModalOverlay.classList.remove('hidden');
            updateDebugMonitor();
        });
    }

    function closeDebugModal() {
        debugModal.classList.add('hidden');
        debugModalOverlay.classList.add('hidden');
    }

    if (btnCloseDebug) {
        btnCloseDebug.addEventListener('click', closeDebugModal);
    }
    if (debugModalOverlay) {
        debugModalOverlay.addEventListener('click', closeDebugModal);
    }

    function updateDebugMonitor() {
        if (!debugMonitor) return;
        
        let currentPage = 0;
        let pageCount = 0;
        if (readerViewport) {
            const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
            const currentScroll = Math.abs(readerViewport.scrollLeft);
            pageCount = Math.round(readerViewport.scrollWidth / readerViewport.clientWidth) || 0;
            currentPage = maxScroll > 0 ? (Math.round(currentScroll / readerViewport.clientWidth) + 1) : (pageCount > 0 ? 1 : 0);
        }

        const monitorData = {
            state: {
                currentFileName: currentFileName || '(未ロード)',
                currentFileType: currentFileType || '(なし)',
                bookmarkProgress: bookmarkProgress ? `${(bookmarkProgress * 100).toFixed(1)}%` : '0%',
                currentPage: currentPage,
                pageCount: pageCount
            },
            viewport: {
                clientWidth: readerViewport ? readerViewport.clientWidth : 0,
                clientHeight: readerViewport ? readerViewport.clientHeight : 0,
                scrollWidth: readerViewport ? readerViewport.scrollWidth : 0,
                scrollLeft: readerViewport ? readerViewport.scrollLeft : 0
            },
            config: config,
            localStorageKeys: Object.keys(localStorage)
        };
        debugMonitor.textContent = JSON.stringify(monitorData, null, 2);
    }

    // Periodically update debug monitor if visible
    setInterval(() => {
        if (debugModal && !debugModal.classList.contains('hidden')) {
            updateDebugMonitor();
        }
    }, 1000);

    // Layout Diagnostics Logic
    let lastGeneratedReport = '';

    function runLayoutDiagnosis() {
        if (!readerViewport || !readerContent) {
            return "エラー: ビューアーが初期化されていません。";
        }

        const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
        const currentScroll = Math.abs(readerViewport.scrollLeft);
        const pageCount = Math.round(readerViewport.scrollWidth / readerViewport.clientWidth) || 0;
        const currentPage = maxScroll > 0 ? (Math.round(currentScroll / readerViewport.clientWidth) + 1) : (pageCount > 0 ? 1 : 0);

        // 1. 環境情報
        let report = `### 📖 ゆうぞら レイアウト診断レポート\n`;
        report += `- **日時**: ${new Date().toLocaleString()}\n`;
        report += `- **ファイル名**: ${currentFileName || '(未ロード)'}\n`;
        report += `- **ファイル種別**: ${currentFileType || '(なし)'}\n`;
        report += `- **表示設定**:\n`;
        report += `  - テーマ: ${config.theme}\n`;
        report += `  - 書体: ${config.font === 'font-mincho' ? '明朝体' : 'ゴシック体'}\n`;
        report += `  - 送り方向: ${config.direction === 'rtl' ? '右から左 (RTL)' : '左から右 (LTR)'}\n`;
        report += `  - 文字サイズ: ${config.size}\n`;
        report += `  - 行間: ${config.lh}\n`;
        report += `  - 文字間: ${config.spacing}\n`;
        report += `- **画面サイズ**:\n`;
        report += `  - ビューポート幅(clientWidth): ${readerViewport.clientWidth}px\n`;
        report += `  - ビューポート高(clientHeight): ${readerViewport.clientHeight}px\n`;
        report += `  - コンテンツ全体幅(scrollWidth): ${readerViewport.scrollWidth}px\n`;
        report += `- **スクロール状態**:\n`;
        report += `  - scrollLeft: ${readerViewport.scrollLeft}px\n`;
        report += `  - 進捗割合(bookmarkProgress): ${(bookmarkProgress * 100).toFixed(1)}%\n`;
        report += `  - ページ数: 現在 ${currentPage} / ${pageCount} ページ\n\n`;

        // 1.2. カラム＆ビューポート計算検証
        report += `### 📐 カラム＆ビューポート計算検証\n`;
        const cStyle = window.getComputedStyle(readerContent);
        const colWidthStr = cStyle.columnWidth || 'auto';
        const colGapStr = cStyle.columnGap || 'normal';
        const marginLeftStr = cStyle.marginLeft || '0px';
        const marginRightStr = cStyle.marginRight || '0px';
        
        report += `- **コンテンツ配置スタイル**:\n`;
        report += `  - column-width: ${colWidthStr}\n`;
        report += `  - column-gap: ${colGapStr}\n`;
        report += `  - margin-left: ${marginLeftStr}\n`;
        report += `  - margin-right: ${marginRightStr}\n`;

        const viewportW = readerViewport.clientWidth;
        const colWidthVal = parseFloat(colWidthStr) || 0;
        const mLeftVal = parseFloat(marginLeftStr) || 0;
        const mRightVal = parseFloat(marginRightStr) || 0;
        
        const isMobile = window.innerWidth < 768;
        const expectedColWidth = isMobile ? (viewportW - mLeftVal - mRightVal) : (viewportW / 2 - mLeftVal - mRightVal);
        report += `- **カラム仕様チェック**:\n`;
        report += `  - デバイス環境: ${isMobile ? 'モバイル (1段組み)' : 'PC (見開き2段組み)'}\n`;
        report += `  - 理論上の理想カラム幅: ${expectedColWidth.toFixed(1)}px (計算式: ${isMobile ? 'W - margins' : 'W/2 - margins'})\n`;
        report += `  - 実際のカラム幅: ${colWidthVal.toFixed(1)}px\n`;
        const colWidthDiff = Math.abs(colWidthVal - expectedColWidth);
        if (colWidthDiff > 2) {
            report += `  - ⚠️ **警告**: 実際のカラム幅が理想の幅と ${colWidthDiff.toFixed(1)}px ズレています。改段ずれの原因となります。\n`;
        } else {
            report += `  - ✅ **正常**: カラム幅はレイアウト設計通りです。\n`;
        }
        report += `\n`;

        // 1.5. 縦方向レイアウト配置
        report += `### 📐 縦方向レイアウト配置\n`;
        const header = document.querySelector('.reader-header');
        const footer = document.querySelector('.reader-footer');
        const viewportRect = readerViewport.getBoundingClientRect();
        if (header && footer) {
            const hRect = header.getBoundingClientRect();
            const fRect = footer.getBoundingClientRect();
            const cRect = readerContent.getBoundingClientRect();
            
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

        // 1.8. 可視要素の境界座標分布
        report += `### 📏 可視要素の境界座標分布 (Y: ${viewportRect.top.toFixed(1)}px)\n`;
        const childNodes = Array.from(readerContent.children);
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
                    report += `  - ⚠️ **はみ出し**: 左境界を ${( -leftOffset).toFixed(1)}px 超過しています (次のページに回り込んでいるか、見切れています)\n`;
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

        // 2. アライメント検証
        const expectedScrollMultiplier = currentPage - 1;
        const idealScrollLeft = config.direction === 'rtl' 
            ? -(expectedScrollMultiplier * readerViewport.clientWidth)
            : (expectedScrollMultiplier * readerViewport.clientWidth);
        
        const scrollDifference = Math.abs(readerViewport.scrollLeft - idealScrollLeft);

        report += `### 📐 アライメント検証\n`;
        report += `- **現在のページの理想スクロール位置**: ${idealScrollLeft}px\n`;
        report += `- **実際のスクロール位置とのズレ**: ${scrollDifference}px\n`;
        if (scrollDifference > 5) {
            report += `  - ⚠️ **警告**: スクロール位置がページの区切りから ${scrollDifference}px ズレています。文字が見切れる原因になっている可能性があります。\n`;
        } else {
            report += `  - ✅ **正常**: スクロール位置は正しく配置されています。\n`;
        }
        report += `\n`;

        // 3. 境界線上の見切れ文字検出
        report += `### ⚠️ 境界線上でのテキスト見切れ検出\n`;
        
        const boundaryLeft = viewportRect.left;
        const boundaryRight = viewportRect.right;
        let leftBoundaryOverlapCount = 0;
        let rightBoundaryOverlapCount = 0;
        let verticalBoundaryOverlapCount = 0;
        let overlapDetails = '';

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
                overlapDetails += `  - 要素のY座標範囲: ${rect.top.toFixed(1)}px 〜 ${rect.bottom.toFixed(1)}px (ビューポート: ${viewportRect.top.toFixed(1)}px 〜 ${viewportRect.bottom.toFixed(1)}px)\n`;
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

    // Bind layout diagnostic events
    if (btnDiagnoseLayout) {
        btnDiagnoseLayout.addEventListener('click', () => {
            diagnoseReportOutput.textContent = '診断を実行中...';
            
            setTimeout(() => {
                try {
                    lastGeneratedReport = runLayoutDiagnosis();
                    diagnoseReportOutput.textContent = lastGeneratedReport;
                    
                    if (btnCopyDebugReport) {
                        btnCopyDebugReport.removeAttribute('disabled');
                    }
                } catch (err) {
                    console.error("Diagnosis error:", err);
                    diagnoseReportOutput.textContent = `診断中にエラーが発生しました: ${err.message}`;
                }
            }, 50);
        });
    }

    if (btnCopyDebugReport) {
        btnCopyDebugReport.addEventListener('click', () => {
            if (!lastGeneratedReport) return;
            
            navigator.clipboard.writeText(lastGeneratedReport)
                .then(() => {
                    const originalText = btnCopyDebugReport.textContent;
                    btnCopyDebugReport.textContent = 'コピー完了！';
                    btnCopyDebugReport.style.background = '#28a745';
                    btnCopyDebugReport.style.color = '#fff';
                    
                    setTimeout(() => {
                        btnCopyDebugReport.textContent = originalText;
                        btnCopyDebugReport.style.background = '';
                        btnCopyDebugReport.style.color = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error("Clipboard copy failed:", err);
                    alert("クリップボードへのコピーに失敗しました。お手数ですが、テキストエリアから手動でコピーしてください。");
                });
        });
    }

    // Debug Tabs Logic
    if (tabBtnMonitor && tabBtnDiagnose && tabContentMonitor && tabContentDiagnose) {
        tabBtnMonitor.addEventListener('click', () => {
            tabBtnMonitor.classList.add('active');
            tabBtnDiagnose.classList.remove('active');
            tabContentMonitor.classList.remove('hidden');
            tabContentDiagnose.classList.add('hidden');
        });

        tabBtnDiagnose.addEventListener('click', () => {
            tabBtnDiagnose.classList.add('active');
            tabBtnMonitor.classList.remove('active');
            tabContentDiagnose.classList.remove('hidden');
            tabContentMonitor.classList.add('hidden');
            
            // Auto run diagnose if it hasn't been run yet
            if (diagnoseReportOutput && diagnoseReportOutput.textContent === '診断を実行してください。') {
                if (btnDiagnoseLayout) {
                    btnDiagnoseLayout.click();
                }
            }
        });
    }

    // localStorage operations
    if (btnClearBookmarks) {
        btnClearBookmarks.addEventListener('click', () => {
            if (confirm('しおりデータ（読書履歴および進捗）をすべて初期化しますか？')) {
                // Delete last read info
                localStorage.removeItem('last_read_file_name');
                localStorage.removeItem('last_read_file_type');
                localStorage.removeItem('last_read_file_content');
                // Loop and remove bookmark_* keys
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('bookmark_')) {
                        localStorage.removeItem(key);
                    }
                });
                alert('しおりデータを初期化しました。');
                window.location.reload();
            }
        });
    }

    if (btnClearConfig) {
        btnClearConfig.addEventListener('click', () => {
            if (confirm('表示設定（テーマ、文字サイズ、行間等）をすべて初期化しますか？')) {
                localStorage.removeItem('yuzora_config');
                localStorage.removeItem('koizora_config');
                alert('表示設定を初期化しました。');
                window.location.reload();
            }
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (confirm('すべてのデータ（しおり・設定等）を完全に削除してリロードしますか？\nこの操作は取り消せません。')) {
                localStorage.clear();
                alert('すべてのデータを削除しました。');
                window.location.reload();
            }
        });
    }

    // First Page Navigation
    if (btnFirstPage) {
        btnFirstPage.addEventListener('click', () => {
            bookmarkProgress = 0;
            restoreScrollPositionSmooth();
            updateProgress();
            saveBookmark();
        });
    }

    // Progress Bar drag/scrub to jump
    let isDraggingProgress = false;

    function handleProgressScrub(clientX) {
        const rect = progressBarContainer.getBoundingClientRect();
        const clickX = clientX - rect.left;
        let clickProgress = Math.min(1, Math.max(0, clickX / rect.width));
        
        if (config.direction === 'rtl') {
            clickProgress = 1 - clickProgress;
        }
        
        bookmarkProgress = clickProgress;
        restoreScrollPosition(); // Instant feedback for real-time scrub
        updateProgress();
    }

    if (progressBarContainer) {
        progressBarContainer.addEventListener('mousedown', (e) => {
            isDraggingProgress = true;
            progressBarContainer.classList.add('dragging');
            handleProgressScrub(e.clientX);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgress) {
                handleProgressScrub(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingProgress) {
                isDraggingProgress = false;
                progressBarContainer.classList.remove('dragging');
                saveBookmark();
            }
        });

        // Touch support
        progressBarContainer.addEventListener('touchstart', (e) => {
            isDraggingProgress = true;
            progressBarContainer.classList.add('dragging');
            if (e.touches.length > 0) {
                handleProgressScrub(e.touches[0].clientX);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDraggingProgress && e.touches.length > 0) {
                handleProgressScrub(e.touches[0].clientX);
            }
        });

        document.addEventListener('touchend', () => {
            if (isDraggingProgress) {
                isDraggingProgress = false;
                progressBarContainer.classList.remove('dragging');
                saveBookmark();
            }
        });
    }

    // Page number specify jump
    if (readingIndex) {
        readingIndex.title = "クリックしてページ移動";
        readingIndex.addEventListener('click', () => {
            const clientWidth = readerViewport.clientWidth;
            const scrollWidth = readerViewport.scrollWidth;
            const pageCount = Math.round(scrollWidth / clientWidth);
            
            const targetPageStr = prompt(`移動先ページ番号を入力してください (1 〜 ${pageCount}):`);
            if (targetPageStr === null) return; // cancelled
            
            const targetPage = parseInt(targetPageStr, 10);
            if (isNaN(targetPage) || targetPage < 1 || targetPage > pageCount) {
                alert("正しくないページ番号です。");
                return;
            }
            
            const newProgress = pageCount > 1 ? (targetPage - 1) / (pageCount - 1) : 0;
            
            bookmarkProgress = newProgress;
            restoreScrollPositionSmooth();
            updateProgress();
            saveBookmark();
        });
    }

    // Navigation Buttons
    pageNavLeft.addEventListener('click', () => {
        if (config.direction === 'rtl') {
            nextPage(); // Left goes forward in RTL
        } else {
            prevPage(); // Left goes backward in LTR
        }
    });
    pageNavRight.addEventListener('click', () => {
        if (config.direction === 'rtl') {
            prevPage(); // Right goes backward in RTL
        } else {
            nextPage(); // Right goes forward in LTR
        }
    });

    // Scroll & Window Resize Events
    let scrollSaveTimeout = null;
    let isSnapping = false;

    function handleScrollDebounced() {
        handleScroll();
        clearTimeout(scrollSaveTimeout);
        scrollSaveTimeout = setTimeout(() => {
            if (!isReflowing && !isDraggingProgress && !isSnapping) {
                snapScrollPosition();
            }
            saveBookmark();
        }, 300);
    }

    function snapScrollPosition() {
        if (!readerViewport) return;

        const clientWidth = readerViewport.clientWidth;
        const currentScroll = Math.abs(readerViewport.scrollLeft);
        const maxScroll = readerViewport.scrollWidth - clientWidth;

        if (maxScroll <= 0) return;

        // Find the closest page boundary
        const closestPageIndex = Math.round(currentScroll / clientWidth);
        let targetScroll = closestPageIndex * clientWidth;

        // Bound check with max scroll
        if (targetScroll > maxScroll) {
            targetScroll = maxScroll;
        }

        const signedTargetScroll = config.direction === 'rtl' ? -targetScroll : targetScroll;
        const diff = Math.abs(readerViewport.scrollLeft - signedTargetScroll);

        // Only snap if there is a noticeable alignment offset to prevent loops
        if (diff >= 0.5) {
            isSnapping = true;
            
            readerViewport.scrollTo({
                left: signedTargetScroll,
                behavior: 'smooth'
            });

            // Reset snapping state after the smooth scroll animation completes
            setTimeout(() => {
                isSnapping = false;
                handleScroll();
                saveBookmark();
            }, 350);
        }
    }
    
    readerViewport.addEventListener('scroll', handleScrollDebounced);
    window.addEventListener('resize', handleResize);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (readerScreen.classList.contains('hidden')) return;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            toggleControls();
            e.preventDefault();
            return;
        }
        if (config.direction === 'rtl') {
            if (e.key === 'ArrowLeft') {
                nextPage(); // RTL: left is forward
            } else if (e.key === 'ArrowRight') {
                prevPage(); // RTL: right is backward
            }
        } else {
            if (e.key === 'ArrowRight') {
                nextPage(); // LTR: right is forward
            } else if (e.key === 'ArrowLeft') {
                prevPage(); // LTR: left is backward
            }
        }
    });

    // Keyboard shortcuts for debug menu (PC only)
    document.addEventListener('keydown', (e) => {
        // Prevent key events from triggering while typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        const isModalOpen = debugModal && !debugModal.classList.contains('hidden');

        // Toggle debug modal with 'd' or 'D'
        if (e.key === 'd' || e.key === 'D') {
            if (isModalOpen) {
                closeDebugModal();
            } else {
                if (btnOpenDebug) btnOpenDebug.click();
            }
            e.preventDefault();
            return;
        }

        // Handle keys when debug modal is open
        if (isModalOpen) {
            // Close with Escape key
            if (e.key === 'Escape') {
                closeDebugModal();
                e.preventDefault();
                return;
            }

            // Switch to System Monitor tab with '1'
            if (e.key === '1') {
                if (tabBtnMonitor) tabBtnMonitor.click();
                e.preventDefault();
                return;
            }

            // Switch to Layout Diagnosis tab with '2'
            if (e.key === '2') {
                if (tabBtnDiagnose) tabBtnDiagnose.click();
                e.preventDefault();
                return;
            }

            // Trigger Layout Diagnosis run with 'r' or 'R'
            if (e.key === 'r' || e.key === 'R') {
                if (btnDiagnoseLayout) btnDiagnoseLayout.click();
                e.preventDefault();
                return;
            }

            // Copy Layout Diagnosis Report with 'c' or 'C'
            if (e.key === 'c' || e.key === 'C') {
                if (btnCopyDebugReport && !btnCopyDebugReport.hasAttribute('disabled')) {
                    btnCopyDebugReport.click();
                }
                e.preventDefault();
                return;
            }
        }
    });

    // Controls Toggle & Auto-Hide Behaviour
    readerViewport.addEventListener('click', toggleControls);

    // Touch Swipe Navigation for precisely 1 page navigation
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    readerViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
        }
    }, { passive: true });

    readerViewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }
    }, { passive: true });

    readerViewport.addEventListener('touchend', () => {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const swipeThreshold = 50;

        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (config.direction === 'rtl') {
                if (deltaX > 0) {
                    nextPage(); // Swipe right -> Next Page
                } else {
                    prevPage(); // Swipe left -> Prev Page
                }
            } else {
                if (deltaX > 0) {
                    prevPage(); // Swipe right -> Prev Page
                } else {
                    nextPage(); // Swipe left -> Next Page
                }
            }
        }
    }, { passive: true });

    // Button controls in Drawer
    setupDrawerControls();

    // Render Predefined Books Grid
    if (developerBooksGrid || readerBooksGrid) {
        PREDEFINED_BOOKS.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.setAttribute('data-id', book.id);
            card.innerHTML = `
                <div class="book-card-cover">
                    <div class="book-card-title">${book.shortTitle}</div>
                </div>
                <div class="book-card-meta">${book.meta}</div>
            `;
            card.addEventListener('click', () => {
                loadPredefinedBook(book);
            });
            
            if (book.category === 'developer' && developerBooksGrid) {
                developerBooksGrid.appendChild(card);
            } else if (book.category === 'reader' && readerBooksGrid) {
                readerBooksGrid.appendChild(card);
            }
        });
    }

    // Save bookmark on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveBookmark();
        }
    });

    // Try to auto-load last session if available
    checkLastSession();

    // ==========================================================================
    // File Handling & Parsing
    // ==========================================================================
    function handleFile(file) {
        currentFileName = file.name;
        currentFileType = file.name.split('.').pop().toLowerCase();
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            let text = '';
            try {
                const decoder = new TextDecoder('shift-jis', { fatal: true });
                text = decoder.decode(arrayBuffer);
            } catch (err) {
                console.warn("Shift_JIS decode failed (fatal=true), falling back to UTF-8", err);
                const utf8Decoder = new TextDecoder('utf-8');
                text = utf8Decoder.decode(arrayBuffer);
            }

            currentFileContent = text;
            displayBook();
        };

        reader.readAsArrayBuffer(file);
    }

    function loadPredefinedBook(book) {
        currentFileName = `${book.cardId}_yoko.txt`;
        currentFileType = 'txt';
        
        fetch(book.path)
            .then(res => {
                if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
                return res.arrayBuffer();
            })
            .then(arrayBuffer => {
                let text = '';
                try {
                    const decoder = new TextDecoder('shift-jis', { fatal: true });
                    text = decoder.decode(arrayBuffer);
                } catch (err) {
                    console.warn("Shift_JIS decode failed (fatal=true), falling back to UTF-8 for predefined book", err);
                    const utf8Decoder = new TextDecoder('utf-8');
                    text = utf8Decoder.decode(arrayBuffer);
                }
                currentFileContent = text;
                displayBook();
            })
            .catch(err => {
                console.error(err);
                alert(`作品の読み込みに失敗しました: ${err.message}`);
            });
    }

    function displayBook() {
        let parsedHTML = '';
        let title = currentFileName;

        if (currentFileType === 'txt') {
            // Parse plain text with Aozora annotation
            const parsed = parseAozoraText(currentFileContent);
            parsedHTML = parsed.body;
            title = parsed.title || currentFileName.replace('.txt', '');
        } else {
            // XHTML/HTML
            const parsed = parseAozoraHTML(currentFileContent);
            parsedHTML = parsed.body;
            title = parsed.title || currentFileName.replace(/\.(x?html)/, '');
        }

        // Override with predefined book title if matched
        const predefinedBook = PREDEFINED_BOOKS.find(b => currentFileName.includes(b.cardId.toString()));
        if (predefinedBook) {
            title = predefinedBook.title;
        }

        // Apply to viewer
        bookTitle.textContent = title;
        document.title = `${title} - ゆうぞら`;
        readerContent.innerHTML = parsedHTML;

        // Display Reader, Hide Welcome Screen
        welcomeScreen.classList.add('hidden');
        readerScreen.classList.remove('hidden');

        // Check if there is a saved bookmark for this file
        const savedProgress = localStorage.getItem(`bookmark_${currentFileName}`);
        if (savedProgress) {
            bookmarkProgress = parseFloat(savedProgress);
        } else {
            bookmarkProgress = 0;
        }

        // Wait a tick for rendering to complete before restoring scroll position
        isReflowing = true;
        setTimeout(() => {
            restoreScrollPosition();
            updateProgress();
            triggerHeaderShow();
            setTimeout(() => {
                isReflowing = false;
            }, 50);
        }, 100);
    }

    /**
     * Parses Plain Text Aozora Formatting (Rubies, Page breaks, etc.)
     */
    function parseAozoraText(text) {
        // XSS対策 (T-E1): 文字列処理の最優先ステップとして特殊文字を一括エスケープ
        text = text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

        currentTOC = [];
        let headingIndex = 0;

        let lines = text.split(/\r?\n/);
        let parsedLines = [];
        let title = '';
        let author = '';
        let inHeader = true;
        let mainBodyStarted = false;
        
        // Remove Aozora metadata headers and footers (lines before first long line or metadata separator)
        // Usually, the first line is the title, the second is the author.
        if (lines.length > 2) {
            title = lines[0].trim();
            author = lines[1].trim();
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Detect end of header metadata (often dashes or empty lines)
            if (inHeader) {
                if (line.includes('-------------------------------------------------------')) {
                    inHeader = false;
                    continue;
                }
                // Skip introduction headers
                if (line.includes('［＃') && (line.includes('始まり') || line.includes('目次'))) {
                    inHeader = false;
                }
                // If we hit a very long line or paragraph without ［＃, start main body
                if (line.trim().length > 0 && !line.startsWith('［＃') && i > 5) {
                    inHeader = false;
                }
                if (inHeader) continue; // Skip header lines
            }

            // Detect Aozora footer metadata separator
            if (line.includes('底本：') || line.includes('青空文庫作成ファイル：')) {
                break;
            }

            // Handle page breaks
            if (line.includes('［＃改ページ］')) {
                parsedLines.push('PAGE_BREAK');
                continue;
            }

            // Detect indentation (jisage) markup
            let jisageClass = '';
            const jisageMatch = line.match(/［＃([０-９0-9]+)字下げ］/);
            if (jisageMatch) {
                const rawNum = jisageMatch[1];
                const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                const n = parseInt(cleanNum, 10);
                jisageClass = `jisage${n}`;
                line = line.replace(/［＃[０-９0-9]+字下げ］/, '');
            }

            // Detect headings before formatting the markup
            let isHeading = false;
            let headingLevel = 2; // Default to h2 for large heading
            let headingText = '';
            const headingMatch = line.match(/［＃「([^」]+)」は(大|中|小)見出し］/);
            if (headingMatch) {
                isHeading = true;
                headingText = headingMatch[1];
                const levelChar = headingMatch[2];
                if (levelChar === '大') headingLevel = 2;
                else if (levelChar === '中') headingLevel = 3;
                else if (levelChar === '小') headingLevel = 4;
                
                // Remove the heading annotation so it doesn't get processed as regular text
                line = line.replace(/［＃「[^」]+」は(?:大|中|小)見出し］/, '');
            }

            // Convert Aozora rubies and formatting
            line = formatAozoraMarkup(line);

            // Output lines
            if (line.trim().length === 0) {
                // Keep empty lines as spacing paragraph or combine
                parsedLines.push('<p class="empty-line">&nbsp;</p>');
            } else {
                if (isHeading) {
                    const headingId = `toc-heading-${headingIndex++}`;
                    let cleanText = headingText
                        .replace(/[｜|]/g, '')
                        .replace(/《[^》]+》/g, '')
                        .trim();
                    currentTOC.push({
                        id: headingId,
                        text: cleanText,
                        level: headingLevel
                    });
                    parsedLines.push(`<h${headingLevel} id="${headingId}"${jisageClass ? ` class="${jisageClass}"` : ''}>${line}</h${headingLevel}>`);
                } else if (line.startsWith('<h2>') || line.startsWith('<h3>')) {
                    parsedLines.push(line);
                } else {
                    parsedLines.push(`<p${jisageClass ? ` class="${jisageClass}"` : ''}>${line}</p>`);
                }
            }
        }

        // Trim empty lines from the end of parsedLines to prevent trailing blank spaces
        while (parsedLines.length > 0 && parsedLines[parsedLines.length - 1] === '<p class="empty-line">&nbsp;</p>') {
            parsedLines.pop();
        }
        // Also trim from the start to clean up leading empty space
        while (parsedLines.length > 0 && parsedLines[0] === '<p class="empty-line">&nbsp;</p>') {
            parsedLines.shift();
        }

        // Wrap sections and paragraphs
        let bodyContent = parsedLines.join('\n');
        bodyContent = bodyContent.replace(/PAGE_BREAK/g, '<div class="page-break"></div>');

        return {
            title: title + (author ? ` (${author})` : ''),
            body: bodyContent
        };
    }

    function formatAozoraMarkup(line) {
        // 1. Ruby with explicit delimiter: ｜漢字《かんじ》 or |漢字《かんじ》
        // Match both full-width ｜ and half-width |
        line = line.replace(/[｜|]([^《\r\n]+)《([^》]+)》/g, '<ruby>$1<rt>$2</rt></ruby>');

        // 2. Ruby without explicit delimiter: 漢字《かんじ》
        // Match Chinese characters (Kanji, including iteration marks like 々)
        line = line.replace(/([一-龠々〆ヶ]+)《([^》]+)》/g, '<ruby>$1<rt>$2</rt></ruby>');


        // 4. Accent notes: ［＃「...」に傍点］
        // (Simplified placeholder handling: highlight text)
        line = line.replace(/［＃「([^」]+)」に傍点］/g, '<span class="bouten">$1</span>');

        // 5. General annotations (usually clean up for clean reading)
        // e.g. ［＃ここから１字下げ］ -> Remove from display but keep formatting if possible
        line = line.replace(/［＃ここから([^］]+)］/g, '');
        line = line.replace(/［＃ここで([^］]+)］/g, '');
        line = line.replace(/［＃([^］]+)］/g, ''); // Remove other Aozora system annotations

        // Remove input control characters (like Form Feed or byte order marks)
        line = line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        return line;
    }

    /**
     * Sanitizes a DOM element to prevent XSS (T-E2)
     */
    function sanitizeDOM(rootElement) {
        const allowedTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'a', 'ruby', 'rt', 'rp', 'br', 'img', 'b', 'i', 'strong', 'em'
        ]);
        const allowedAttrs = new Set(['class', 'id', 'src', 'alt', 'href']);

        // Sanitize root element attributes
        const rootAttributes = Array.from(rootElement.attributes);
        for (const attr of rootAttributes) {
            const attrName = attr.name.toLowerCase();
            if (attrName.startsWith('on') || !allowedAttrs.has(attrName)) {
                rootElement.removeAttribute(attr.name);
            } else if (attrName === 'href' || attrName === 'src') {
                const val = attr.value.trim().toLowerCase();
                if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
                    rootElement.removeAttribute(attr.name);
                }
            }
        }

        function sanitize(element) {
            const childNodes = Array.from(element.childNodes);
            for (const child of childNodes) {
                if (child.nodeType === 1) { // Node.ELEMENT_NODE
                    const tagName = child.tagName.toLowerCase();
                    if (!allowedTags.has(tagName)) {
                        const unsafeTagsToDiscardContent = new Set([
                            'script', 'style', 'iframe', 'noscript', 'object', 'embed', 'link'
                        ]);
                        if (unsafeTagsToDiscardContent.has(tagName)) {
                            child.remove();
                        } else {
                            // Unwrap: pull children up and remove the element itself
                            while (child.firstChild) {
                                child.parentNode.insertBefore(child.firstChild, child);
                            }
                            child.remove();
                        }
                    } else {
                        // Sanitize attributes
                        const attributes = Array.from(child.attributes);
                        for (const attr of attributes) {
                            const attrName = attr.name.toLowerCase();
                            if (attrName.startsWith('on') || !allowedAttrs.has(attrName)) {
                                child.removeAttribute(attr.name);
                            } else if (attrName === 'href' || attrName === 'src') {
                                const val = attr.value.trim().toLowerCase();
                                if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
                                    child.removeAttribute(attr.name);
                                }
                            }
                        }
                        // Recurse
                        sanitize(child);
                    }
                }
            }
        }

        sanitize(rootElement);
    }

    /**
     * Parses XHTML Aozora Formatting
     */
    function parseAozoraHTML(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        const titleEl = doc.querySelector('title');
        let title = titleEl ? titleEl.textContent : '';

        // Extract main body
        let mainBody = doc.querySelector('.main_body');
        if (!mainBody) {
            mainBody = doc.querySelector('body');
        }

        // Clean up metadata section if present in the HTML (usually near bottom or inside wrapper)
        const bibliographicalInfo = mainBody.querySelector('.bibliographical_information');
        if (bibliographicalInfo) bibliographicalInfo.remove();
        
        const cardLink = mainBody.querySelector('.card_link');
        if (cardLink) cardLink.remove();

        // Sanitize DOM to prevent XSS (T-E2)
        sanitizeDOM(mainBody);

        return {
            title: title,
            body: mainBody.innerHTML
        };
    }


    // ==========================================================================
    // Scrolling, Paging, and Bookmarks
    // ==========================================================================
    function handleScroll() {
        if (isReflowing) return;
        
        const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
        
        if (maxScroll <= 0) return;

        // In RTL writing mode, scrollLeft is negative or zero.
        // Convert to absolute value for progress calculation.
        const currentScroll = Math.abs(readerViewport.scrollLeft);
        bookmarkProgress = currentScroll / maxScroll;
        
        updateProgress();
    }

    function updateProgress() {
        const clientWidth = readerViewport.clientWidth;
        const scrollWidth = readerViewport.scrollWidth;
        const maxScroll = scrollWidth - clientWidth;
        const currentScroll = Math.abs(readerViewport.scrollLeft);

        // Progress bar percentage (0 to 100)
        const percentage = Math.min(100, Math.max(0, Math.round(bookmarkProgress * 100)));
        progressBar.style.width = `${percentage}%`;
        readingPercentage.textContent = `${percentage}%`;

        // Calculate pages based on viewport clientWidth and gaps
        // Gap is 80px, so effective page width is clientWidth + gap.
        const pageCount = Math.round(scrollWidth / clientWidth);
        const currentPage = Math.min(pageCount, Math.max(1, Math.round(currentScroll / clientWidth) + 1));
        readingIndex.textContent = `${currentPage} / ${pageCount} ページ`;
    }

    function restoreScrollPosition() {
        const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
        if (config.direction === 'rtl') {
            // In vertical-rl, scrolling forward is in the negative direction.
            readerViewport.scrollLeft = -(bookmarkProgress * maxScroll);
        } else {
            // In vertical-lr, scrolling forward is in the positive direction.
            readerViewport.scrollLeft = bookmarkProgress * maxScroll;
        }
    }

    function restoreScrollPositionSmooth() {
        const maxScroll = readerViewport.scrollWidth - readerViewport.clientWidth;
        const targetScroll = config.direction === 'rtl' ? -(bookmarkProgress * maxScroll) : (bookmarkProgress * maxScroll);
        readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    function nextPage() {
        const amount = readerViewport.clientWidth;
        if (config.direction === 'rtl') {
            // Forward in RTL layout means scrolling Left (negative direction)
            readerViewport.scrollBy({ left: -amount, behavior: 'smooth' });
        } else {
            // Forward in LTR layout means scrolling Right (positive direction)
            readerViewport.scrollBy({ left: amount, behavior: 'smooth' });
        }
    }

    function prevPage() {
        const amount = readerViewport.clientWidth;
        if (config.direction === 'rtl') {
            // Backward in RTL layout means scrolling Right (positive direction)
            readerViewport.scrollBy({ left: amount, behavior: 'smooth' });
        } else {
            // Backward in LTR layout means scrolling Left (negative direction)
            readerViewport.scrollBy({ left: -amount, behavior: 'smooth' });
        }
    }

    function handleResize() {
        // Layout columns width changes, so we must restore scroll position based on percentage
        if (!readerScreen.classList.contains('hidden')) {
            isReflowing = true;
            restoreScrollPosition();
            updateProgress();
            setTimeout(() => {
                isReflowing = false;
            }, 150);
        }
    }

    // Bookmark saving
    function saveBookmark() {
        if (currentFileName) {
            localStorage.setItem(`bookmark_${currentFileName}`, bookmarkProgress.toString());
            localStorage.setItem('last_read_file_name', currentFileName);
            localStorage.setItem('last_read_file_type', currentFileType);
            localStorage.setItem('last_read_file_content', currentFileContent);
        }
    }

    // Auto save bookmark on tab close
    window.addEventListener('beforeunload', saveBookmark);

    function checkLastSession() {
        const lastName = localStorage.getItem('last_read_file_name');
        const lastContent = localStorage.getItem('last_read_file_content');
        const lastType = localStorage.getItem('last_read_file_type');

        if (lastName && lastContent && lastType) {
            currentFileName = lastName;
            currentFileContent = lastContent;
            currentFileType = lastType;
            displayBook();
        }
    }

    // ==========================================================================
    // UI Setting Controls & Customizations
    // ==========================================================================
    function setupDrawerControls() {
        // Theme Selector
        setupButtonGroup('.theme-selector button', 'theme', (val) => {
            applySettings();
        });

        // Font Family
        setupButtonGroup('.font-selector button', 'font', (val) => {
            isReflowing = true;
            applySettings();
            setTimeout(() => {
                restoreScrollPosition();
                updateProgress();
                isReflowing = false;
            }, 150);
        });

        // Reading Direction
        setupButtonGroup('.direction-selector button', 'direction', (val) => {
            isReflowing = true;
            applySettings();
            setTimeout(() => {
                restoreScrollPosition();
                updateProgress();
                isReflowing = false;
            }, 150);
        });

        // Font Size
        setupButtonGroup('.size-selector button', 'size', (val) => {
            isReflowing = true;
            applySettings();
            setTimeout(() => {
                restoreScrollPosition();
                updateProgress();
                isReflowing = false;
            }, 150);
        });

        // Line Height
        setupButtonGroup('.lh-selector button', 'lh', (val) => {
            isReflowing = true;
            applySettings();
            setTimeout(() => {
                restoreScrollPosition();
                updateProgress();
                isReflowing = false;
            }, 150);
        });

        // Letter Spacing
        setupButtonGroup('.spacing-selector button', 'spacing', (val) => {
            isReflowing = true;
            applySettings();
            setTimeout(() => {
                restoreScrollPosition();
                updateProgress();
                isReflowing = false;
            }, 150);
        });
    }

    function setupButtonGroup(selector, configKey, callback) {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const value = btn.getAttribute(`data-${configKey}`);
                config[configKey] = value;
                
                callback(value);
                saveSettings();
            });
        });
    }

    function saveSettings() {
        localStorage.setItem('yuzora_config', JSON.stringify(config));
    }

    function loadSettings() {
        const saved = localStorage.getItem('yuzora_config') || localStorage.getItem('koizora_config');
        if (saved) {
            try {
                Object.assign(config, JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
    }

    function applySettings() {
        // Apply settings config values to target elements
        document.body.className = '';
        document.body.classList.add(`theme-${config.theme}`, `layout-direction-${config.direction}`);

        // Update CSS direction dynamically to align scroll origin with text flow direction
        readerViewport.style.direction = config.direction;

        readerContent.className = 'reader-content';
        readerContent.classList.add(config.font, `direction-${config.direction}`, config.size, config.lh, config.spacing);

        // Update navigation overlays page titles based on direction
        if (config.direction === 'rtl') {
            pageNavLeft.title = "次のページへ";
            pageNavRight.title = "前のページへ";
        } else {
            pageNavLeft.title = "前のページへ";
            pageNavRight.title = "次のページへ";
        }

        // Update first page button chevron icon direction
        const btnFirstPagePath = btnFirstPage ? btnFirstPage.querySelector('path') : null;
        if (btnFirstPagePath) {
            if (config.direction === 'rtl') {
                // Point Right >>
                btnFirstPagePath.setAttribute('d', 'M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5');
            } else {
                // Point Left <<
                btnFirstPagePath.setAttribute('d', 'M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5');
            }
        }

        // Update Button States in Drawer UI
        syncButtonState('.theme-selector button', 'theme', config.theme);
        syncButtonState('.font-selector button', 'font', config.font);
        syncButtonState('.direction-selector button', 'direction', config.direction);
        syncButtonState('.size-selector button', 'size', config.size);
        syncButtonState('.lh-selector button', 'lh', config.lh);
        syncButtonState('.spacing-selector button', 'spacing', config.spacing);
    }

    function syncButtonState(selector, attrName, value) {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
            if (btn.getAttribute(`data-${attrName}`) === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function openSettings() {
        settingsDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
    }

    function closeSettings() {
        settingsDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        triggerHeaderShow();
    }

    function openTOC() {
        tocDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        buildTOCList();
    }

    function closeTOC() {
        tocDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        triggerHeaderShow();
    }

    function buildTOCList() {
        tocList.innerHTML = '';
        if (currentTOC.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'toc-item';
            emptyMsg.style.cursor = 'default';
            emptyMsg.style.color = 'var(--text-muted)';
            emptyMsg.textContent = '目次情報はありません。';
            tocList.appendChild(emptyMsg);
            return;
        }

        const clientWidth = readerViewport.clientWidth;
        const currentScroll = Math.abs(readerViewport.scrollLeft);

        currentTOC.forEach((item) => {
            const element = document.getElementById(item.id);
            let isActive = false;
            if (element) {
                const rect = element.getBoundingClientRect();
                const containerRect = readerViewport.getBoundingClientRect();
                
                let pageIndex = 0;
                if (config.direction === 'rtl') {
                    const absolutePosition = (containerRect.right - rect.right) + Math.abs(readerViewport.scrollLeft);
                    pageIndex = Math.floor(absolutePosition / clientWidth);
                } else {
                    const absolutePosition = (rect.left - containerRect.left) + readerViewport.scrollLeft;
                    pageIndex = Math.floor(absolutePosition / clientWidth);
                }
                const currentScrollPage = Math.round(currentScroll / clientWidth);
                if (pageIndex === currentScrollPage) {
                    isActive = true;
                }
            }

            const itemDiv = document.createElement('div');
            itemDiv.className = `toc-item toc-item-level-${item.level}${isActive ? ' active' : ''}`;
            itemDiv.textContent = item.text;
            itemDiv.addEventListener('click', () => {
                jumpToHeading(item.id);
                closeTOC();
            });
            tocList.appendChild(itemDiv);
        });
    }

    function jumpToHeading(headingId) {
        const targetElement = document.getElementById(headingId);
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const containerRect = readerViewport.getBoundingClientRect();
        const viewportWidth = readerViewport.clientWidth;

        let pageIndex = 0;
        if (config.direction === 'rtl') {
            const absolutePosition = (containerRect.right - rect.right) + Math.abs(readerViewport.scrollLeft);
            pageIndex = Math.floor(absolutePosition / viewportWidth);
        } else {
            const absolutePosition = (rect.left - containerRect.left) + readerViewport.scrollLeft;
            pageIndex = Math.floor(absolutePosition / viewportWidth);
        }

        let targetScroll = 0;
        if (config.direction === 'rtl') {
            targetScroll = -(pageIndex * viewportWidth);
        } else {
            targetScroll = pageIndex * viewportWidth;
        }

        readerViewport.scrollTo({ left: targetScroll, behavior: 'smooth' });

        // Focus the target element after smooth scroll completes to prevent layout jump or scroll interruption
        setTimeout(() => {
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
        }, 400);
    }

    // ==========================================================================
    // Header & Footer UI Toggle/Auto-Hide
    // ==========================================================================
    function hideControls() {
        if (!settingsDrawer.classList.contains('open') && !tocDrawer.classList.contains('open')) {
            readerHeader.classList.add('hidden');
            if (readerFooter) {
                readerFooter.classList.add('hidden');
            }
        }
    }

    function triggerHeaderShow() {
        readerHeader.classList.remove('hidden');
        if (readerFooter) {
            readerFooter.classList.remove('hidden');
        }
        
        clearTimeout(headerTimeout);
        headerTimeout = setTimeout(() => {
            hideControls();
        }, 3000); // Hide after 3 seconds of inactivity
    }

    function toggleControls(e) {
        // Prevent toggle if clicking interactive elements inside reader viewport
        if (e && e.type === 'click' && (e.target.closest('a') || e.target.closest('ruby') || e.target.closest('button'))) {
            return;
        }

        if (readerHeader.classList.contains('hidden')) {
            triggerHeaderShow();
        } else {
            clearTimeout(headerTimeout);
            hideControls();
        }
    }

    // Expose core functions for testing/debugging
    window.Yuzora = {
        parseAozoraText,
        parseAozoraHTML,
        formatAozoraMarkup,
        config,
        runLayoutDiagnosis,
        getCurrentTOC: () => currentTOC
    };
});
