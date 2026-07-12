/**
 * Aozora Bunko Semantic Analyzer
 */
"use strict";

/**
 * @implements {AozoraSemanticAnalyzerInterface}
 */
class AozoraSemanticAnalyzer {
    constructor() {}

    /**
     * @param {!ASTNodeInterface} astRoot
     * @return {!ASTNodeInterface}
     * @override
     */
    // @ts-expect-error
    analyze(astRoot) {
        this.validateNode(astRoot, false);
        return astRoot;
    }

    /**
     * @private
     * @param {!ASTNodeInterface} node
     * @param {boolean} insideRuby
     */
    validateNode(node, insideRuby) {
        if (!node.children) return;

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];

            if (child.type === 'Ruby') {
                if (insideRuby) {
                    // Rule violation: nested ruby is not allowed.
                    // Fallback: convert the nested ruby to a plain text node.
                    console.warn(`Semantic Warning: Nested ruby tag detected for "${child.value}". Flatting it to plain text.`);
                    node.children[i] = new TextNode(child.value || '');
                } else {
                    this.validateNode(child, true);
                }
            } else {
                this.validateNode(child, insideRuby);
            }
        }
    }
}

window['AozoraSemanticAnalyzer'] = AozoraSemanticAnalyzer;
