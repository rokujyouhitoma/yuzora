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
    BOOK_LOAD_START: 'document:load-start',
    BOOK_LOADED: 'document:loaded',
    BOOK_RENDERED: 'document:rendered',
    BOOK_LOAD_FAILED: 'document:load-failed',
    NAVIGATE_PAGE: 'ui:navigate-page',
    PAGE_CHANGED: 'ui:page-changed',
    CONFIG_CHANGED: 'ui:config-changed',
    TOC_GENERATED: 'ui:toc-generated',
    TOC_ACTIVE_CHANGED: 'ui:toc-active-changed',
    TOGGLE_DEBUG_MODAL: 'ui:toggle-debug-modal',
    TOGGLE_CONTROLS: 'ui:toggle-controls',
    TOGGLE_DRAWER: 'ui:toggle-drawer',
    HISTORY_UPDATED: 'system:history-updated',
    DIAGNOSE_RUN: 'system:diagnose-run',
    DIAGNOSE_COMPLETED: 'system:diagnose-completed'
};

// Expose classes on window for test accessibility and property preservation
window['YuzoraEvent'] = YuzoraEvent;
window['YuzoraEventTarget'] = YuzoraEventTarget;
window['YuzoraEventType'] = YuzoraEventType;
