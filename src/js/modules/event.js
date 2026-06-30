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

// Expose classes on window for test accessibility and property preservation
window['YuzoraEvent'] = YuzoraEvent;
window['YuzoraEventTarget'] = YuzoraEventTarget;
