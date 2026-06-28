module.exports = [
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                FileReader: "readonly",
                TextDecoder: "readonly",
                DOMParser: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                // Node.js/CommonJS globals (for tests and build)
                process: "readonly",
                require: "readonly",
                module: "readonly"
            }
        },
        rules: {
            "complexity": ["error", 10]
        }
    }
];
