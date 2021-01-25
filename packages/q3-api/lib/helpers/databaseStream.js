const EventEmitter = require('events');
const { get } = require('lodash');
const mongoose = require('mongoose');

const REFRESH = 'REFRESH';

const getDocumentKey = (op) => get(op, 'documentKey._id');

const getTimeStamp = (args) =>
  get(args, 'updateDescription.updatedFields.updatedAt');

const getModelCollectionName = (model) =>
  get(model, 'collection.collectionName', '');

class CollectionWatch extends EventEmitter {
  init() {
    Object.values(mongoose.models).forEach((Model) =>
      Model.watch()
        .on('change', (args) => {
          this.emit(REFRESH, {
            updatedAt: getTimeStamp(args),
            collection: getModelCollectionName(Model),
            id: getDocumentKey(args),
          });
        })
        .on('error', () => {
          // noop
        }),
    );

    return this;
  }

  onRefresh(next) {
    this.on(REFRESH, next);
    return this;
  }
}

CollectionWatch.CONSTANTS = {
  REFRESH,
};

module.exports = CollectionWatch;