/**
 * @fileoverview ResourceDirector manages loading, caching, and disposal of Assets.
 */

"use strict";

/**
 * ResourceDirector class.
 * @constructor
 * @implements {ResourceDirectorInterface}
 */
function ResourceDirector() {
  /** @type {!Map<string, !Asset>} */
  this.assets = new Map();
}

/**
 * Safe maximum size for book texts (2MB in characters) to prevent browser freeze.
 * @const {number}
 */
ResourceDirector.MAX_BOOK_SIZE = 2 * 1024 * 1024;

/**
 * Validates if the target URL complies with Same-Origin policy.
 * @param {string} url
 * @return {boolean}
 * @private
 */
ResourceDirector.prototype._isAllowedOrigin = function(url) {
  // Relative paths are always allowed
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
    return true;
  }
  try {
    var target = new URL(url, window.location.href);
    return target.origin === window.location.origin;
  } catch (e) {
    return false;
  }
};

/**
 * @override
 */
ResourceDirector.prototype.loadBook = function(id, source, loaderFn) {
  // T-S2: Check Origin validation before fetching
  if (!this._isAllowedOrigin(source)) {
    var err = new Error('Security Error: Fetching from external origin is blocked.');
    var failedAsset = new BookAsset(id, '');
    failedAsset.status = 'failed';
    failedAsset.error = err;
    this.assets.set(id, failedAsset);
    return Promise.reject(err);
  }

  if (this.assets.has(id)) {
    var cached = this.assets.get(id);
    if (cached instanceof BookAsset) {
      if (cached.status === 'ready') {
        return Promise.resolve(cached);
      }
      if (cached.status === 'loading') {
        // Return placeholder load
        return Promise.reject(new Error('Asset is currently loading.'));
      }
    }
  }

  var asset = new BookAsset(id, '');
  this.assets.set(id, asset);

  return loaderFn()
    .then(function(rawData) {
      // T-D2: Validate file size before processing to prevent DoS
      if (rawData && rawData.length > ResourceDirector.MAX_BOOK_SIZE) {
        var sizeErr = new Error('File size exceeds the 2MB safety limit.');
        asset.status = 'failed';
        asset.error = sizeErr;
        throw sizeErr;
      }
      asset.content = rawData;
      asset.status = 'ready';
      return asset;
    })
    .catch(function(error) {
      asset.status = 'failed';
      asset.error = /** @type {!Error} */ (error);
      throw error;
    });
};

/**
 * @override
 */
ResourceDirector.prototype.unload = function(id) {
  if (this.assets.has(id)) {
    var asset = this.assets.get(id);
    asset.dispose();
    this.assets.delete(id);
  }
};

/**
 * @override
 */
ResourceDirector.prototype.clear = function() {
  this.assets.forEach(function(asset, id) {
    asset.dispose();
  });
  this.assets.clear();
};

window['ResourceDirector'] = ResourceDirector;
