interface YuzoraEventInterface {
    type: string;
    detail: any;
    target: any;
}

interface YuzoraEventTargetInterface {
    addEventListener(type: string, listener: (event: YuzoraEventInterface) => void): void;
    removeEventListener(type: string, listener: (event: YuzoraEventInterface) => void): void;
    dispatchEvent(event: YuzoraEventInterface): void;
    scoped(scopePrefix: string): YuzoraEventTargetInterface;
}

interface LocatorInterface {
    resolve(Class: any): any;
    locate(Class: any): any;
    register(Class: any, instance: any): void;
}

interface PublisherInterface {
    subscribe(topic: string, callback: (data: any) => void): void;
    unsubscribe(topic: string, callback: (data: any) => void): void;
    publish(topic: string, data?: any): void;
}

interface RouterInterface {
    currentHash: string | null;
    register(pattern: string, callback: Function): void;
    resolve(hash: string): boolean;
    listen(): void;
    navigate(hash: string): void;
}

interface SceneInterface {
    enter(data?: any): void;
    exit(): void;
}

interface SceneDirectorInterface {
    currentSceneName: string | null;
    isTransitioning: boolean;
    register(sceneName: string, sceneInstance: SceneInterface): void;
    transitionTo(sceneName: string, data?: any): void;
}

interface ViewContextInterface {
    headerTimeout: number | null;
    isReflowing: boolean;
    activeHeadingId: string | null;
    tocObserver: any;
    config: any;
    app: HTMLElement | null;
    welcomeScreen: HTMLElement | null;
    readerScreen: HTMLElement | null;
    dropZone: HTMLElement | null;
    fileInput: HTMLInputElement | null;
    readerViewport: HTMLElement | null;
    readerContent: HTMLElement | null;
    bookTitle: HTMLElement | null;
    btnBack: HTMLElement | null;
    btnSettings: HTMLElement | null;
    btnTOC: HTMLElement | null;
    btnFirstPage: HTMLElement | null;
    btnCloseSettings: HTMLElement | null;
    btnCloseTOC: HTMLElement | null;
    settingsDrawer: HTMLElement | null;
    tocDrawer: HTMLElement | null;
    tocList: HTMLElement | null;
    drawerOverlay: HTMLElement | null;
    pageNavLeft: HTMLElement | null;
    pageNavRight: HTMLElement | null;
    readerHeader: HTMLElement | null;
    readerFooter: HTMLElement | null;
    progressBarContainer: HTMLElement | null;
    progressBar: HTMLElement | null;
    readingPercentage: HTMLElement | null;
    readingIndex: HTMLElement | null;
    developerBooksGrid: HTMLElement | null;
    readerBooksGrid: HTMLElement | null;
    btnOpenDebug: HTMLElement | null;
    debugModal: HTMLElement | null;
    btnCloseDebug: HTMLElement | null;
    debugModalOverlay: HTMLElement | null;
    debugMonitor: HTMLElement | null;
    btnClearBookmarks: HTMLElement | null;
    btnClearConfig: HTMLElement | null;
    btnClearAll: HTMLElement | null;
    btnDiagnoseLayout: HTMLElement | null;
    btnCopyDebugReport: HTMLElement | null;
    diagnoseReportOutput: HTMLTextAreaElement | null;
    debugHistoryJSON: HTMLTextAreaElement | null;
    btnExportHistory: HTMLElement | null;
    btnImportHistory: HTMLElement | null;
    tabBtnMonitor: HTMLElement | null;
    tabBtnDiagnose: HTMLElement | null;
    tabContentMonitor: HTMLElement | null;
    tabContentDiagnose: HTMLElement | null;
}

interface CommandInterface {
    execute(): void;
    serialize(): any;
}

interface CommandManagerInterface {
    execute(command: any, isFromReplay?: boolean): void;
    exportJSON(): string;
    importJSON(jsonString: string): boolean;
    undo(): void;
    redo(): void;
    isReplaying: boolean;
    commandHistory: any[];
    updateDebugMonitor(): void;
}

interface RepositoryInterface {
    get(key: string): Promise<string | null>;
    save(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
}

interface BookmarkRepositoryInterface {
    load(fileName: string): Promise<number>;
    save(fileName: string, pageProgress: number): Promise<void>;
    clearAll(): Promise<void>;
}

interface SettingsRepositoryInterface {
    load(): Promise<any>;
    save(config: any): Promise<void>;
    clear(): Promise<void>;
}

interface SessionRepositoryInterface {
    load(): Promise<any>;
    save(name: string, content: string, type: string): Promise<void>;
    clear(): Promise<void>;
}

interface BookModelInterface {
    title: string;
    author: string;
    content: string;
    type: string;
    totalPages: number;
    currentPage: number;
    toc: any[];
    isEmpty(): boolean;
    clear(): void;
}

interface ConfigModelInterface {
    theme: string;
    font: string;
    direction: string;
    size: string;
    lh: string;
    spacing: string;
    load(): Promise<void>;
    save(): Promise<void>;
    apply(): void;
}

interface BookmarkModelInterface {
    bookmarkProgress: number;
    save(fileName: string, progress: number): Promise<void>;
    load(fileName: string): Promise<number>;
    clear(): void;
}

interface AssetInterface {
    id: string;
    type: string;
    status: string;
    error: Error | null;
    dispose(): void;
}

interface BookAssetInterface extends AssetInterface {
    title: string;
    content: string;
    toc: any[];
}

interface ResourceDirectorInterface {
    assets: Map<string, AssetInterface>;
    loadBook(id: string, source: string, loaderFn: () => Promise<string>): Promise<BookAssetInterface>;
    unload(id: string): void;
    clear(): void;
}

interface YuzoraInterface {
    locator: LocatorInterface;
    publisher: PublisherInterface;
    config: any;
    boot(): Promise<void>;
    parseAozoraText(text: string): { title: string; body: string };
    parseAozoraHTML(html: string): { title: string; body: string };
    formatAozoraMarkup(markup: string): string;
    runLayoutDiagnosis(): Promise<string>;
    getCurrentTOC(): any[];
    AozoraTokenizer: any;
    AozoraParser: any;
    AozoraSemanticAnalyzer: any;
    AozoraEvaluator: any;
    ASTNode: any;
    CommandManager: any;
    BookModel: any;
    ConfigModel: any;
    BookmarkModel: any;
    LoadBookCommand: any;
    NavigatePageCommand: any;
    UpdateConfigCommand: any;
    SyncBookmarkCommand: any;
    VerticalRenderer: any;
    ViewContext: any;
}

interface Window {
    locator: LocatorInterface;
    Yuzora: YuzoraInterface;
    yuzora: YuzoraInterface;
    YuzoraEvent: any;
    YuzoraEventTarget: any;
    Publisher: any;
    YuzoraEventType: any;
    initializeDOMElements(): void;
}
interface RendererInterface {
    render(htmlContent: string): void;
    restoreScrollPosition(progress: number, smooth?: boolean): void;
    scrollToPage(pageNumber: number): Promise<void>;
    handleResize(progress: number): Promise<void>;
    adjustPageBreaksForOverrun(): void;
    hasOverrunNearCurrentPage(): boolean;
    lastRepairMetrics: any;
}

declare var yuzora: YuzoraInterface;

interface ASTNodeInterface {
    type: string;
    value?: string;
    rt?: string;
    children?: ASTNodeInterface[];
}

interface AozoraTokenizerInterface {
    tokenizeInline(text: string): any[];
}

interface AozoraParserInterface {
    parseTokensToAST(tokens: any[]): ASTNodeInterface;
    parseAozoraText(text: string): { title: string; body: string };
    parseAozoraHTML(htmlString: string): { title: string; body: string };
    formatAozoraMarkup(line: string): string;
}

interface AozoraSemanticAnalyzerInterface {
    analyze(astRoot: ASTNodeInterface): ASTNodeInterface;
}

interface AozoraEvaluatorInterface {
    evaluate(astRoot: ASTNodeInterface): string;
    escapeHTML(str: string): string;
    sanitizeDOM(rootElement: any): void;
}


