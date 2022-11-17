const { get, isFunction } = require('lodash');
const Schema = require('./schema');
const Counters = require('../counters');
const {
  convertMiddlewareParameterIntoArray,
  getFileDownload,
} = require('./utils');

async function appendUrlToDownload(doc) {
  return Promise.all(
    convertMiddlewareParameterIntoArray(doc).map(
      async (item) => {
        if (!item) return;
        const url = get(
          await getFileDownload(item),
          'url',
          null,
        );

        if (isFunction(item.set))
          item.set('url', url, {
            strict: false,
          });
        else
          Object.assign(item, {
            url,
          });
      },
    ),
  );
}

async function incrementInternalCounter(doc) {
  await Promise.allSettled(
    convertMiddlewareParameterIntoArray(doc).map(
      async (noti) => {
        await Counters.calculateByNotificationObject(noti);
      },
    ),
  );
}

Schema.post('find', appendUrlToDownload);
Schema.post('findOne', appendUrlToDownload);
Schema.post('save', incrementInternalCounter);

module.exports = {
  appendUrlToDownload,
  incrementInternalCounter,
};
