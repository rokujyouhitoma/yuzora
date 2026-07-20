/**
 * Yuzora - Scene Transition Framework (Application Scenes)
 */
"use strict";

/**
 * Initialize Scene (Start up / screen reset scene)
 * @extends {Scene}
 */
class InitializeScene extends Scene {
    /**
     * @param {*=} data
     * @override
     */
    enter(data) {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.welcomeScreen) {
            viewContext.welcomeScreen.classList.add("hidden");
        }
        if (viewContext.readerScreen) {
            viewContext.readerScreen.classList.add("hidden");
        }
    }

    /**
     * @override
     */
    exit() {
        // Do nothing on exit
    }
}

/**
 * Welcome Scene (Initial View / File Selector)
 * @extends {Scene}
 */
class WelcomeScene extends Scene {
    /**
     * @param {*=} data
     * @override
     */
    enter(data) {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.welcomeScreen) {
            viewContext.welcomeScreen.classList.remove("hidden");
        }
        setupWelcomeEvents();
    }

    /**
     * @override
     */
    exit() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.welcomeScreen) {
            viewContext.welcomeScreen.classList.add("hidden");
        }
        cleanupWelcomeEvents();
    }
}

/**
 * Reader Scene (Book View Screen)
 * @extends {Scene}
 */
class ReaderScene extends Scene {
    /**
     * @param {*=} data
     * @override
     */
    enter(data) {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.readerScreen) {
            viewContext.readerScreen.classList.remove("hidden");
        }
        setupReaderEvents();
    }

    /**
     * @override
     */
    exit() {
        const viewContext = /** @type {!ViewContextInterface} */ (Yuzora.locator.resolve(ViewContext));
        if (viewContext.readerScreen) {
            viewContext.readerScreen.classList.add("hidden");
        }
        cleanupReaderEvents();
    }
}
