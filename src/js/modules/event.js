/**
 * Yuzora - Event Driven Architecture Module (Application Bindings)
 */
"use strict";

// Alias the generic framework classes to the application names
const YuzoraEvent = AppEvent;
const YuzoraEventTarget = AppEventTarget;

// Register event bus singleton in Locator
locator.register(YuzoraEventTarget, new YuzoraEventTarget());

/**
 * @const
 * @enum {string}
 */
const YuzoraEventType = {
    BOOK_LOAD_START: 'book-load-start',
    BOOK_LOADED: 'book-loaded',
    BOOK_RENDERED: 'book-rendered',
    BOOK_LOAD_FAILED: 'book-load-failed',
    NAVIGATE_PAGE: 'navigate-page',
    PAGE_CHANGED: 'page-changed',
    CONFIG_CHANGED: 'config-changed',
    TOC_GENERATED: 'toc-generated',
    TOC_ACTIVE_CHANGED: 'toc-active-changed',
    TOGGLE_DEBUG_MODAL: 'toggle-debug-modal',
    TOGGLE_CONTROLS: 'toggle-controls',
    TOGGLE_DRAWER: 'toggle-drawer',
    HISTORY_UPDATED: 'history-updated',
    DIAGNOSE_RUN: 'diagnose-run',
    DIAGNOSE_COMPLETED: 'diagnose-completed'
};

// Expose classes on window for test accessibility and property preservation
window['YuzoraEvent'] = YuzoraEvent;
window['YuzoraEventTarget'] = YuzoraEventTarget;
window['YuzoraEventType'] = YuzoraEventType;
