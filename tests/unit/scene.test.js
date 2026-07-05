const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test.describe('Yuzora Scene Transition Framework Unit Tests', () => {
    let window;
    let document;

    test.before(() => {
        // Setup JSDOM
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="welcome-screen"></div><div id="reader-screen" class="hidden"></div></body></html>', {
            url: "http://localhost",
            runScripts: "dangerously"
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;

        // Mock locator and Yuzora objects
        // Scene.js uses Yuzora.locator.resolve(...)
        class MockLocator {
            constructor() {
                this.registry = new Map();
            }
            register(Class, instance) {
                this.registry.set(Class, instance);
            }
            resolve(Class) {
                if (this.registry.has(Class)) {
                    return this.registry.get(Class);
                }
                if (Class.name === "ViewContext") {
                    return {
                        welcomeScreen: document.getElementById("welcome-screen"),
                        readerScreen: document.getElementById("reader-screen")
                    };
                }
                throw new Error(`Unregistered mock class: ${Class.name}`);
            }
        }

        const mockLocator = new MockLocator();
        
        // Define Yuzora global mock
        global.Yuzora = {
            locator: mockLocator
        };

        // Bind fake global classes for resolve reference
        global.ViewContext = class ViewContext {};
        global.SceneDirector = class SceneDirector {};

        // Load scene.js code
        const sceneJsPath = path.resolve(__dirname, '../../src/js/modules/scene.js');
        const sceneJsCode = fs.readFileSync(sceneJsPath, 'utf8');
        
        const sceneContainer = {};
        const evalCode = sceneJsCode + `
            sceneContainer.Scene = Scene;
            sceneContainer.InitializeScene = InitializeScene;
            sceneContainer.WelcomeScene = WelcomeScene;
            sceneContainer.ReaderScene = ReaderScene;
            sceneContainer.SceneDirector = SceneDirector;
        `;
        eval(evalCode);
        
        global.Scene = sceneContainer.Scene;
        global.InitializeScene = sceneContainer.InitializeScene;
        global.WelcomeScene = sceneContainer.WelcomeScene;
        global.ReaderScene = sceneContainer.ReaderScene;
        global.SceneDirector = sceneContainer.SceneDirector;
    });

    test.after(() => {
        delete global.window;
        delete global.document;
        delete global.Yuzora;
        delete global.ViewContext;
        delete global.SceneDirector;
        delete global.Scene;
        delete global.InitializeScene;
        delete global.WelcomeScene;
        delete global.ReaderScene;
    });

    test('should transition to initialize, welcome, and reader scenes and only manipulate their own elements', () => {
        const welcomeScreen = document.getElementById("welcome-screen");
        const readerScreen = document.getElementById("reader-screen");

        // Initial state
        welcomeScreen.className = "";
        readerScreen.className = "";

        const director = new SceneDirector();

        // 1. Transition to initialize
        director.transitionTo("initialize");
        assert.strictEqual(welcomeScreen.classList.contains("hidden"), true, "welcomeScreen should be hidden on initialize");
        assert.strictEqual(readerScreen.classList.contains("hidden"), true, "readerScreen should be hidden on initialize");
        assert.strictEqual(director.currentSceneName, "initialize");

        // 2. Transition to welcome
        director.transitionTo("welcome");
        assert.strictEqual(welcomeScreen.classList.contains("hidden"), false, "welcomeScreen should be shown on welcome");
        assert.strictEqual(readerScreen.classList.contains("hidden"), true, "readerScreen should remain hidden on welcome");
        assert.strictEqual(director.currentSceneName, "welcome");

        // 3. Transition to reader
        director.transitionTo("reader");
        assert.strictEqual(welcomeScreen.classList.contains("hidden"), true, "welcomeScreen should be hidden on reader");
        assert.strictEqual(readerScreen.classList.contains("hidden"), false, "readerScreen should be shown on reader");
        assert.strictEqual(director.currentSceneName, "reader");
    });

    test('should prevent double transition during transitionTo execution (isTransitioning guard)', () => {
        const director = new SceneDirector();
        
        // We will mock one scene's enter method to call transitionTo again
        // to verify that it blocks nested calls.
        let nestedCallBypassed = false;
        
        // Let's spy on reader scene enter
        const originalReaderEnter = director.scenes["reader"].enter;
        director.scenes["reader"].enter = function(data) {
            originalReaderEnter.call(this, data);
            
            // Nested transition attempt
            director.transitionTo("welcome");
            if (director.currentSceneName === "welcome") {
                nestedCallBypassed = true;
            }
        };

        director.transitionTo("reader");
        assert.strictEqual(nestedCallBypassed, false, "Nested transitionTo should have been prevented");
        assert.strictEqual(director.currentSceneName, "reader", "Should stay in reader scene");
    });
});
