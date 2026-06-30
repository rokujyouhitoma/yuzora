/**
 * Yuzora - Event Driven Architecture Module
 */
"use strict";

/**
 * @implements {YuzoraEventInterface}
 */
class YuzoraEvent {
    /**
     * @param {string} type The event type.
     * @param {*} [detail] Optional event payload data.
     */
    constructor(type, detail = null) {
        /**
         * @public
         * @type {string}
         */
        this.type = type;
        /**
         * @public
         * @type {*}
         */
        this.detail = detail;
        /**
         * @public
         * @type {?Object}
         */
        this.target = null;
    }
}

/**
 * @implements {YuzoraEventTargetInterface}
 */
class YuzoraEventTarget {
    constructor() {
        /**
         * @private
         * @type {!Object<string, !Array<function(!YuzoraEventInterface)>>}
         */
        this.listeners_ = {};
    }

    /**
     * Add an event listener callback function.
     * @param {string} type The event type.
     * @param {function(!YuzoraEventInterface)} listener The event listener function.
     * @override
     */
    addEventListener(type, listener) {
        if (!this.listeners_[type]) {
            this.listeners_[type] = [];
        }
        this.listeners_[type].push(listener);
    }

    /**
     * Remove a registered event listener callback function.
     * @param {string} type The event type.
     * @param {function(!YuzoraEventInterface)} listener The event listener function.
     * @override
     */
    removeEventListener(type, listener) {
        if (!this.listeners_[type]) {
            return;
        }
        this.listeners_[type] = this.listeners_[type].filter(l => l !== listener);
    }

    /**
     * Dispatch an event to all registered listeners.
     * @param {!YuzoraEventInterface} event The event instance to dispatch.
     * @override
     */
    dispatchEvent(event) {
        const type = event.type;
        if (!this.listeners_[type]) {
            return;
        }
        event.target = this;
        // Copy listener array to prevent mutations during loop dispatch
        const targets = [...this.listeners_[type]];
        for (const listener of targets) {
            listener(event);
        }
    }
}

// Register event bus singleton in Locator
window.locator.register(YuzoraEventTarget, new YuzoraEventTarget());

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
