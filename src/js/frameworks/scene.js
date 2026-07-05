/**
 * Generic Scene Transition Framework
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
 * SceneDirector manages the transitions between scenes
 * @implements {SceneDirectorInterface}
 */
class SceneDirector {
    constructor() {
        /**
         * Registered Scenes
         * @private
         * @type {!Object<string, !SceneInterface>}
         */
        this.scenes = {};

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
     * Register a scene.
     * @param {string} sceneName
     * @param {!SceneInterface} sceneInstance
     * @override
     */
    register(sceneName, sceneInstance) {
        this.scenes[sceneName] = sceneInstance;
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
