/**
 * ASTNode base class and specific node classes for Aozora Bunko Parser
 */
"use strict";

/**
 * @implements {ASTNodeInterface}
 */
class ASTNode {
    /**
     * @param {string} type
     * @param {string|undefined} value
     * @param {string|undefined} rt
     * @param {!Array<!ASTNode>|undefined} children
     */
    constructor(type, value = undefined, rt = undefined, children = undefined) {
        /** @type {string} */
        this.type = type;
        /** @type {string|undefined} */
        this.value = value;
        /** @type {string|undefined} */
        this.rt = rt;
        /** @type {!Array<!ASTNode>|undefined} */
        this.children = children;
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class RootNode extends ASTNode {
    /**
     * @param {!Array<!ASTNode>} children
     */
    constructor(children) {
        super('Root', undefined, undefined, children);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class TextNode extends ASTNode {
    /**
     * @param {string} value
     */
    constructor(value) {
        super('Text', value, undefined, undefined);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class RubyNode extends ASTNode {
    /**
     * @param {string} value
     * @param {string} rt
     */
    constructor(value, rt) {
        super('Ruby', value, rt, undefined);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class BoldNode extends ASTNode {
    /**
     * @param {!Array<!ASTNode>} children
     */
    constructor(children) {
        super('Bold', undefined, undefined, children);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class ItalicNode extends ASTNode {
    /**
     * @param {!Array<!ASTNode>} children
     */
    constructor(children) {
        super('Italic', undefined, undefined, children);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class BoutenNode extends ASTNode {
    /**
     * @param {!Array<!ASTNode>} children
     */
    constructor(children) {
        super('Bouten', undefined, undefined, children);
    }
}

// Export for global exposure
window['ASTNode'] = ASTNode;
window['RootNode'] = RootNode;
window['TextNode'] = TextNode;
window['RubyNode'] = RubyNode;
window['BoldNode'] = BoldNode;
window['ItalicNode'] = ItalicNode;
window['BoutenNode'] = BoutenNode;
