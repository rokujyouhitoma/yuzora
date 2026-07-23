COMPILER = tools/closure-compiler/closure-compiler-v20240317.jar
JS_SRCS = src/js/frameworks/locator.js \
          src/js/frameworks/event.js \
          src/js/frameworks/publisher.js \
          src/js/frameworks/scene.js \
          src/js/frameworks/router.js \
          src/js/modules/core/locator.js \
          src/js/modules/ui/scene.js \
          src/js/modules/storage/repository.js \
          src/js/modules/core/event.js \
          src/js/modules/core/publisher.js \
          src/js/modules/core/config.js \
          src/js/modules/storage/asset.js \
          src/js/modules/storage/resource-director.js \
          src/js/modules/core/commands.js \
          src/js/modules/parser/ast-nodes.js \
          src/js/modules/parser/tokenizer.js \
          src/js/modules/parser/semantic-analyzer.js \
          src/js/modules/parser/evaluator.js \
          src/js/modules/parser/parser.js \
          src/js/modules/core/diagnostics.js \
          src/js/modules/ui/renderer.js \
          src/js/modules/ui/viewer.js \
          src/js/modules/ui/ui.js \
          src/js/modules/core/yuzora.js
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

all: install-git-hooks lint $(JS_OUT) $(CSS_OUT) embed-build-info

install-git-hooks:
	@if [ -d .git ]; then \
		mkdir -p .git/hooks; \
		cp tools/git-hooks/pre-commit .git/hooks/pre-commit; \
		chmod +x .git/hooks/pre-commit; \
	fi

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

# Embed build information into index.html and sw.js:
#   1. Replace <meta> placeholder values with actual BUILD_ID / BUILD_DATE
#   2. Append ?v=BUILD_ID cache-buster to all <script src="src/js/..."> tags
#   3. Replace CACHE_NAME version in sw.js
embed-build-info:
	sed -i "s|content=\"BUILD_ID_PLACEHOLDER\"|content=\"$(BUILD_ID)\"|" index.html
	sed -i "s|content=\"BUILD_DATE_PLACEHOLDER\"|content=\"$(BUILD_DATE)\"|" index.html
	sed -i 's|src/js/\([^"]*\)\.js"|src/js/\1.js?v=$(BUILD_ID)"|g' index.html
	sed -i 's|src/css/\([^"]*\)\.css"|src/css/\1.css?v=$(BUILD_ID)"|g' index.html
	sed -i "s|yuzora-cache-vBUILD_ID_PLACEHOLDER|yuzora-cache-v$(BUILD_ID)|" sw.js

clean:
	rm -f $(JS_OUT) $(CSS_OUT)
	# WARNING: This discards ALL uncommitted changes to index.html.
	# Do not run 'make clean' if you have manual edits to index.html that haven't been committed.
	git checkout -- index.html

.PHONY: all clean lint embed-build-info install-git-hooks
