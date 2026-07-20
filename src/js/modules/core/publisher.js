/**
 * Yuzora - Publish/Subscribe Publisher Module (Application Bindings)
 */
"use strict";

// Alias the generic framework class to the application name
// Publisher is defined in frameworks/publisher.js, so we use it directly here.

// Register Publisher singleton in Locator using resolved YuzoraEventTarget
window['Yuzora'].locator.register(Publisher, new Publisher(
    /** @type {!YuzoraEventTargetInterface} */ (window['Yuzora'].locator.resolve(YuzoraEventTarget))
));

// Expose on window for test accessibility and property preservation
window['Publisher'] = Publisher;
