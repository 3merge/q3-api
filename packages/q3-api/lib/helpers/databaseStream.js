const EventEmitter = require('events');
const { get, isObject, omit, size } = require('lodash');
const mongoose = require('mongoose');

const REFRESH = 'REFRESH';

const getDocumentKey = (op) => get(op, 'documentKey._id');

const getTimeStamp = (args) =>
  get(args, 'updateDescription.updatedFields.updatedAt');

const getModelCollectionName = (model) =>
  get(model, 'collection.collectionName', '');

const isNoop = (args = {}) => {
  const { operationType, updateDescription } = args;
  if (
    operationType !== 'update' ||
    !isObject(updateDescription)
  )
    return false;

  const { removedFields, truncatedArrays, updatedFields } =
    updateDescription;

  const updatedFieldsKeys = isObject(updatedFields)
    ? Object.keys(omit(updatedFields, ['updatedAt']))
    : [];

  return ![
    removedFields,
    truncatedArrays,
    updatedFieldsKeys,
  ].some(size);
};

class CollectionWatch extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
  }

  init() {
    Object.values(mongoose.models).forEach((Model) => {
      if (Model.baseModelName) return;
      const collection = getModelCollectionName(Model);

      // this collection changes WAY to frequently.
      if (collection === 'queues') return;

      Model.watch()
        .on('change', (args) => {
          if (!isNoop(args))
            this.emit(REFRESH, {
              updatedAt: getTimeStamp(args),
              id: getDocumentKey(args),
              collection,
            });
        })
        .on('error', () => {
          // noop
        });
    });

    return this;
  }

  onLeave(next) {
    this.off(REFRESH, next);
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

CollectionWatch.utils = {
  isNoop,
};

module.exports = CollectionWatch;
