/**
 * Yuzora - Scene Transition Framework
 */
"use strict";

/**
 * Base Scene Class
 * @implements {SceneInterface}
 */
class Scene {
    /**
     * Enter the scene.
     * @param {*=} data Optional context data passed to the scene.
     * @override
     */
    enter(data) {
        throw new Error("enter() must be implemented");
    }

    /**
     * Exit the scene.
     * @override
     */
    exit() {
        throw new Error("exit() must be implemented");
    }
}

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

/**
 * SceneDirector manages the transitions between scenes
 * @implements {SceneDirectorInterface}
 */
class SceneDirector {
    constructor() {
        /**
         * Registered Scenes
         * @private
         * @type {!Object<string, !Scene>}
         */
        this.scenes = {
            "initialize": new InitializeScene(),
            "welcome": new WelcomeScene(),
            "reader": new ReaderScene()
        };

        /**
         * Current Active Scene Name
         * @public
         * @type {?string}
         * @override
         */
        this.currentSceneName = null;

        /**
         * Transition Guard Flag
         * @public
         * @type {boolean}
         * @override
         */
        this.isTransitioning = false;
    }

    /**
     * Transition to the specified scene.
     * @param {string} sceneName Name of the target scene.
     * @param {*=} data Data payload to pass to the scene enter lifecycle.
     * @override
     */
    transitionTo(sceneName, data) {
        if (this.isTransitioning) {
            return;
        }

        const nextScene = this.scenes[sceneName];
        if (!nextScene) {
            throw new Error(`Scene not found: ${sceneName}`);
        }

        this.isTransitioning = true;

        try {
            if (this.currentSceneName) {
                const currentScene = this.scenes[this.currentSceneName];
                currentScene.exit();
            }

            nextScene.enter(data);
            this.currentSceneName = sceneName;
        } finally {
            this.isTransitioning = false;
        }
    }
}
