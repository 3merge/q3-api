const mongoose = require('mongoose');

module.exports = class ModelProxy {
  constructor(coll, fn) {
    this.__$collectionName = coll;
    this.__$collectionNameResolvingFunc = fn;
    this.__$model = mongoose.model(coll);
  }

  get inst() {
    return this.__$model;
  }

  includeCollectionInfo(query) {
    return {
      ...query,
      ...(typeof this.__$collectionNameResolvingFunc ===
      'function'
        ? this.__$collectionNameResolvingFunc(
            this.__$collectionName,
          )
        : {}),
    };
  }

  async proxyUpdate(query, update, options) {
    if (update && Object.keys(update).length)
      return this.__$model.updateMany(
        this.includeCollectionInfo(query),
        update,
        options,
      );

    return null;
  }
};
