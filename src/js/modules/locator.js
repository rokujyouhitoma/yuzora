/**
 * Yuzora - Service Locator Module
 */
"use strict";

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
     */
    register(Class, instance) {
        this.container.set(Class, instance);
    }

    /**
     * Resolve and return the registered instance for a Class.
     * Throws an error if the class is not registered.
     * @param {!Function} Class
     * @return {!Object}
     */
    resolve(Class) {
        if (!this.container.has(Class)) {
            throw new Error(`Class ${Class.name || Class} is not registered in Locator.`);
        }
        return this.container.get(Class);
    }

    /**
     * Reference-style locating: resolves or auto-instantiates if not registered.
     * Throws an error if auto-instantiation fails.
     * @param {!Function} Class
     * @return {!Object}
     */
    locate(Class) {
        if (!this.container.has(Class)) {
            try {
                this.container.set(Class, new Class());
            } catch (e) {
                throw new Error(`Failed to auto-instantiate Class ${Class.name || Class} in Locator: ${e.message}`);
            }
        }
        return this.container.get(Class);
    }
}

// Global locator singleton instance
window.locator = new Locator();
