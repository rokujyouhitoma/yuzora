/**
 * @fileoverview Asset and its subclasses representing localized immutable resources.
 */

"use strict";

/**
 * Base Asset class.
 * @param {string} id
 * @param {string} type
 * @constructor
 * @implements {AssetInterface}
 */
function Asset(id, type) {
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
 * @override
 */
Asset.prototype.dispose = function() {
  this.id = '';
  this.type = '';
  this.status = 'failed';
  this.error = null;
};

/**
 * BookAsset representing parsed Aozora book content.
 * @param {string} id
 * @param {string} rawData
 * @constructor
 * @extends {Asset}
 * @implements {BookAssetInterface}
 */
function BookAsset(id, rawData) {
  Asset.call(this, id, 'book');
  /** @type {string} */
  this.title = '';
  /** @type {string} */
  this.content = rawData || '';
  /** @type {!Array} */
  this.toc = [];
}

// Inherit from Asset
BookAsset.prototype = Object.create(Asset.prototype);
BookAsset.prototype.constructor = BookAsset;

/** @override */
BookAsset.prototype.dispose = function() {
  Asset.prototype.dispose.call(this);
  this.title = '';
  this.content = '';
  this.toc = [];
};

window['Asset'] = Asset;
window['BookAsset'] = BookAsset;
