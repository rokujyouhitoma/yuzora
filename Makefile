COMPILER = tools/closure-compiler/closure-compiler-v20240317.jar
JS_SRCS = src/js/frameworks/locator.js \
          src/js/frameworks/event.js \
          src/js/frameworks/publisher.js \
          src/js/frameworks/scene.js \
          src/js/frameworks/router.js \
          src/js/modules/locator.js \
          src/js/modules/scene.js \
          src/js/modules/repository.js \
          src/js/modules/event.js \
          src/js/modules/publisher.js \
          src/js/modules/config.js \
          src/js/modules/asset.js \
          src/js/modules/resource-director.js \
          src/js/modules/commands.js \
          src/js/modules/ast-nodes.js \
          src/js/modules/tokenizer.js \
          src/js/modules/semantic-analyzer.js \
          src/js/modules/evaluator.js \
          src/js/modules/parser.js \
          src/js/modules/diagnostics.js \
          src/js/modules/renderer.js \
          src/js/modules/viewer.js \
          src/js/modules/ui.js \
          src/js/modules/yuzora.js
JS_OUT = main-min.js

CSS_SRCS = src/css/modules/reset.css \
           src/css/modules/base.css \
           src/css/modules/welcome.css \
           src/css/modules/reader.css \
           src/css/modules/drawers.css \
           src/css/modules/debug.css
CSS_OUT = src/css/style.css

# Build ID: Git short hash (falls back to "dev" when not in a git repo)
BUILD_ID   := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
# Build date: Always UTC to ensure consistency between local and CI environments
BUILD_DATE := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

all: lint $(JS_OUT) $(CSS_OUT) embed-build-info

lint:
	npm run lint

$(JS_OUT): $(JS_SRCS)
	java -jar $(COMPILER) \
		--compilation_level ADVANCED_OPTIMIZATIONS \
		--warning_level VERBOSE \
		--jscomp_error=* \
		--jscomp_off=lintChecks \
		--language_in ECMASCRIPT_NEXT \
		--language_out ECMASCRIPT_NEXT \
		--strict_mode_input=true \
		--externs src/externs.js \
		--js $(JS_SRCS) \
		--js_output_file $(JS_OUT)

$(CSS_OUT): $(CSS_SRCS)
	cat $(CSS_SRCS) > $(CSS_OUT)

# Embed build information into index.html:
#   1. Replace <meta> placeholder values with actual BUILD_ID / BUILD_DATE
#   2. Append ?v=BUILD_ID cache-buster to all <script src="src/js/..."> tags
embed-build-info:
	sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"$(BUILD_ID)\"|" index.html
	sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"$(BUILD_DATE)\"|" index.html
	sed -i 's|src/js/\([^"]*\)\.js"|src/js/\1.js?v=$(BUILD_ID)"|g' index.html
	sed -i 's|src/css/\([^"]*\)\.css"|src/css/\1.css?v=$(BUILD_ID)"|g' index.html

clean:
	rm -f $(JS_OUT) $(CSS_OUT)
	# WARNING: This discards ALL uncommitted changes to index.html.
	# Do not run 'make clean' if you have manual edits to index.html that haven't been committed.
	git checkout -- index.html

.PHONY: all clean lint embed-build-info
