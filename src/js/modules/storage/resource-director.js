/**
 * @fileoverview ResourceDirector manages loading, caching, and disposal of Assets.
 */

"use strict";

/**
 * ResourceDirector class.
 * @implements {ResourceDirectorInterface}
 */
class ResourceDirector {
  constructor() {
    /** @type {!Map<string, !Asset>} */
    this.assets = new Map();
  }

  /**
   * Validates if the target URL complies with Same-Origin policy.
   * @param {string} url
   * @return {boolean}
   * @private
   */
  _isAllowedOrigin(url) {
    if (!url || typeof url !== 'string') return false;
    var lower = url.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('blob:')) {
      return false;
    }
    // Relative paths are allowed
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
      return true;
    }
    try {
      var target = new URL(url, window.location.href);
      return target.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  /**
   * Loads a book.
   * @override
   */
  // @ts-expect-error
  loadBook(id, source, loaderFn) {
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

    // LRU Cache Eviction: dispose old assets if cache size exceeds limit
    if (this.assets.size >= ResourceDirector.MAX_CACHE_COUNT && !this.assets.has(id)) {
      var oldestKey = this.assets.keys().next().value;
      if (oldestKey) {
        this.unload(oldestKey);
      }
    }

    var asset = new BookAsset(id, '');
    this.assets.set(id, asset);

    return loaderFn()
      .then((rawData) => {
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
      .catch((error) => {
        asset.status = 'failed';
        asset.error = /** @type {!Error} */ (error);
        throw error;
      });
  }

  /**
   * Unloads an asset.
   * @override
   */
  // @ts-expect-error
  unload(id) {
    if (this.assets.has(id)) {
      var asset = this.assets.get(id);
      asset.dispose();
      this.assets.delete(id);
    }
  }

  /**
   * Clears assets.
   * @override
   */
  // @ts-expect-error
  clear() {
    this.assets.forEach((asset) => {
      asset.dispose();
    });
    this.assets.clear();
  }
}

/**
 * Safe maximum size for book texts (2MB in characters) to prevent browser freeze.
 * @const {number}
 */
ResourceDirector.MAX_BOOK_SIZE = 2 * 1024 * 1024;

/**
 * Maximum number of book assets held in LRU memory cache before eviction.
 * @const {number}
 */
ResourceDirector.MAX_CACHE_COUNT = 5;

window['ResourceDirector'] = ResourceDirector;
