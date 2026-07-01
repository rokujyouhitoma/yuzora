/**
 * Yuzora - Service Locator Module
 */
"use strict";

/**
 * @implements {LocatorInterface}
 */
class Locator {
    /**
     * @param {Map<Function, Object>} [container]
     */
    constructor(container) {
        /**
         * @private
         * @type {Map<Function, Object>}
         */
        this.container = container || new Map();
    }

    /**
     * Register an instance for a Class constructor.
     * @param {!Function} Class
     * @param {!Object} instance
     * @override
     */
    register(Class, instance) {
        this.container.set(Class, instance);
    }

    /**
     * Resolve and return the registered instance for a Class.
     * Throws an error if the class is not registered.
     * @param {!Function} Class
     * @return {!Object}
     * @override
     */
    resolve(Class) {
        if (!this.container.has(Class)) {
            throw new Error(`Class ${Class.name || Class} is not registered in Locator.`);
        }
        const instance = this.container.get(Class);
        if (!instance) {
            throw new Error(`Class ${Class.name || Class} instance is null or undefined.`);
        }
        return instance;
    }

    /**
     * Reference-style locating: resolves or auto-instantiates if not registered.
     * Throws an error if auto-instantiation fails.
     * @param {!Function} Class
     * @return {!Object}
     * @override
     */
    locate(Class) {
        if (!this.container.has(Class)) {
            try {
                this.container.set(Class, new Class());
            } catch (e) {
                throw new Error(`Failed to auto-instantiate Class ${Class.name || Class} in Locator: ${e.message}`);
            }
        }
        const instance = this.container.get(Class);
        if (!instance) {
            throw new Error(`Class ${Class.name || Class} instance is null or undefined.`);
        }
        return instance;
    }
}

// Global locator singleton instance
const locator = new Locator();
window['locator'] = locator;
