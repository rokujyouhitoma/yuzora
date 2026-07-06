/**
 * @fileoverview Asset and its subclasses representing localized immutable resources.
 */

"use strict";

/**
 * Base Asset class.
 */
class Asset {
  /**
   * @param {string} id
   * @param {string} type
   */
  constructor(id, type) {
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.type = type;
    /** @type {string} */
    this.status = 'loading'; // 'loading', 'ready', 'failed'
    /** @type {?Error} */
    this.error = null;
  }

  /**
   * Disposes resource data held by this asset.
   */
  dispose() {
    this.id = '';
    this.type = '';
    this.status = 'failed';
    this.error = null;
  }
}

/**
 * BookAsset representing parsed Aozora book content.
 * @extends {Asset}
 * @implements {BookAssetInterface}
 */
class BookAsset extends Asset {
  /**
   * @param {string} id
   * @param {string} rawData
   */
  constructor(id, rawData) {
    super(id, 'book');
    /** @type {string} */
    this.title = '';
    /** @type {string} */
    this.content = rawData || '';
    /** @type {!Array} */
    this.toc = [];
  }

  /**
   * @override
   */
  dispose() {
    super.dispose();
    this.title = '';
    this.content = '';
    this.toc = [];
  }
}

window['Asset'] = Asset;
window['BookAsset'] = BookAsset;
