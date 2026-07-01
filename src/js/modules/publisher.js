/**
 * Yuzora - Publish/Subscribe Publisher Module
 */
"use strict";

/**
 * @implements {PublisherInterface}
 */
class Publisher {
    /**
     * @param {!YuzoraEventTarget} eventTarget The underlying event target.
     */
    constructor(eventTarget) {
        /**
         * @private
         * @type {!YuzoraEventTarget}
         */
        this.eventTarget_ = eventTarget;

        /**
         * Map subscriber callbacks to event listener wrappers.
         * @private
         * @type {!Map<string, !Map<function(*), function(!YuzoraEventInterface)>>}
         */
        this.wrappers_ = new Map();
    }

    /**
     * Subscribe to a topic.
     * @param {string} topic The topic to subscribe to.
     * @param {function(*)} callback The callback function when the topic is published.
     * @override
     */
    subscribe(topic, callback) {
        let topicMap = this.wrappers_.get(topic);
        if (!topicMap) {
            topicMap = new Map();
            this.wrappers_.set(topic, topicMap);
        }

        // Avoid duplicate subscriptions of the exact same callback for the same topic
        if (topicMap.has(callback)) {
            return;
        }

        /** @type {function(!YuzoraEventInterface)} */
        const wrapper = (event) => {
            callback(event.detail);
        };
        topicMap.set(callback, wrapper);
        this.eventTarget_.addEventListener(topic, wrapper);
    }

    /**
     * Unsubscribe from a topic.
     * @param {string} topic The topic to unsubscribe from.
     * @param {function(*)} callback The callback function.
     * @override
     */
    unsubscribe(topic, callback) {
        const topicMap = this.wrappers_.get(topic);
        if (!topicMap) return;

        const wrapper = topicMap.get(callback);
        if (wrapper) {
            this.eventTarget_.removeEventListener(topic, wrapper);
            topicMap.delete(callback);
        }
        if (topicMap.size === 0) {
            this.wrappers_.delete(topic);
        }
    }

    /**
     * Publish data to all subscribers of a topic.
     * @param {string} topic The topic to publish.
     * @param {*=} data The data payload.
     * @override
     */
    publish(topic, data) {
        this.eventTarget_.dispatchEvent(new YuzoraEvent(topic, data));
    }
}

// Register Publisher singleton in Locator using resolved YuzoraEventTarget
locator.register(Publisher, new Publisher(
    /** @type {!YuzoraEventTarget} */ (locator.resolve(YuzoraEventTarget))
));

// Expose on window for test accessibility and property preservation
window['Publisher'] = Publisher;
