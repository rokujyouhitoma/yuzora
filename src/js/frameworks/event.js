/**
 * Generic Event Driven Architecture Module
 */
"use strict";

/**
 * AppEvent class.
 */
class AppEvent {
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
 * AppEventTarget class.
 * @implements {YuzoraEventTargetInterface}
 */
class AppEventTarget {
    constructor() {
        /**
         * @private
         * @type {!Object<string, !Array<function(!YuzoraEventInterface): void>>}
         */
        this.listeners_ = {};
    }

    /**
     * Add an event listener callback function.
     * @param {string} type The event type.
     * @param {function(!YuzoraEventInterface): void} listener The event listener function.
     * @override
     */
    // @ts-expect-error
    addEventListener(type, listener) {
        if (!this.listeners_[type]) {
            this.listeners_[type] = [];
        }
        this.listeners_[type].push(listener);
    }

    /**
     * Remove a registered event listener callback function.
     * @param {string} type The event type.
     * @param {function(!YuzoraEventInterface): void} listener The event listener function.
     * @override
     */
    // @ts-expect-error
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
    // @ts-expect-error
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
