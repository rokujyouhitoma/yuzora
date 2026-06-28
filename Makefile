COMPILER = tools/closure-compiler/closure-compiler-v20240317.jar
SRC = src/js/app.js
OUT = main-min.js

all: $(OUT)

$(OUT): $(SRC)
	java -jar $(COMPILER) --compilation_level SIMPLE_OPTIMIZATIONS --js $(SRC) --js_output_file $(OUT)

clean:
	rm -f $(OUT)

.PHONY: all clean
