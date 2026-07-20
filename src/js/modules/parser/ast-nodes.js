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
     * @param {!Array<!ASTNodeInterface>|undefined} children
     */
    constructor(type, value = undefined, rt = undefined, children = undefined) {
        /** @type {string} */
        this.type = type;
        /** @type {string|undefined} */
        this.value = value;
        /** @type {string|undefined} */
        this.rt = rt;
        /** @type {!Array<!ASTNodeInterface>|undefined} */
        this.children = children;
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class RootNode extends ASTNode {
    /**
     * @param {!Array<!ASTNodeInterface>} children
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
     * @param {!Array<!ASTNodeInterface>} children
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
     * @param {!Array<!ASTNodeInterface>} children
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
     * @param {!Array<!ASTNodeInterface>} children
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

/**
 * @implements {ASTNodeInterface}
 */
class DocumentNode extends ASTNode {
    /**
     * @param {!Array<!ASTNodeInterface>} children
     */
    constructor(children) {
        super('Document', undefined, undefined, children);
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class CoverPageNode extends ASTNode {
    /**
     * @param {string} title
     * @param {string} author
     */
    constructor(title, author) {
        super('CoverPage');
        /** @type {string} */
        this.title = title;
        /** @type {string} */
        this.author = author;
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class PageBreakNode extends ASTNode {
    constructor() {
        super('PageBreak');
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class EmptyLineNode extends ASTNode {
    constructor() {
        super('EmptyLine');
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class HeadingNode extends ASTNode {
    /**
     * @param {number} level
     * @param {string} headingId
     * @param {!Array<!ASTNodeInterface>} children
     * @param {string=} jisageClass
     * @param {string=} alignmentClass
     */
    constructor(level, headingId, children, jisageClass = undefined, alignmentClass = undefined) {
        super('Heading', undefined, undefined, children);
        /** @type {number} */
        this.level = level;
        /** @type {string} */
        this.headingId = headingId;
        /** @type {string|undefined} */
        this.jisageClass = jisageClass;
        /** @type {string|undefined} */
        this.alignmentClass = alignmentClass;
    }
}

/**
 * @implements {ASTNodeInterface}
 */
class ParagraphNode extends ASTNode {
    /**
     * @param {string} jisageClass
     * @param {string} alignmentClass
     * @param {!Array<!ASTNodeInterface>} children
     */
    constructor(jisageClass, alignmentClass, children) {
        super('Paragraph', undefined, undefined, children);
        /** @type {string} */
        this.jisageClass = jisageClass;
        /** @type {string} */
        this.alignmentClass = alignmentClass;
    }
}

window['DocumentNode'] = DocumentNode;
window['CoverPageNode'] = CoverPageNode;
window['PageBreakNode'] = PageBreakNode;
window['EmptyLineNode'] = EmptyLineNode;
window['HeadingNode'] = HeadingNode;
window['ParagraphNode'] = ParagraphNode;
