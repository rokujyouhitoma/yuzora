COMPILER = tools/closure-compiler/closure-compiler-v20240317.jar
JS_SRCS = src/js/modules/locator.js \
          src/js/modules/config.js \
          src/js/modules/commands.js \
          src/js/modules/parser.js \
          src/js/modules/diagnostics.js \
          src/js/modules/viewer.js \
          src/js/modules/ui.js
JS_OUT = main-min.js

CSS_SRCS = src/css/modules/base.css \
           src/css/modules/welcome.css \
           src/css/modules/reader.css \
           src/css/modules/drawers.css \
           src/css/modules/debug.css
CSS_OUT = src/css/style.css

all: $(JS_OUT) $(CSS_OUT)

$(JS_OUT): $(JS_SRCS)
	java -jar $(COMPILER) \
		--compilation_level ADVANCED_OPTIMIZATIONS \
		--warning_level VERBOSE \
		--jscomp_error=* \
		--jscomp_off=lintChecks \
		--language_in ECMASCRIPT_NEXT \
		--language_out ECMASCRIPT_NEXT \
		--strict_mode_input=true \
		--externs tools/externs.js \
		--js $(JS_SRCS) \
		--js_output_file $(JS_OUT)

$(CSS_OUT): $(CSS_SRCS)
	cat $(CSS_SRCS) > $(CSS_OUT)

clean:
	rm -f $(JS_OUT) $(CSS_OUT)

.PHONY: all clean
