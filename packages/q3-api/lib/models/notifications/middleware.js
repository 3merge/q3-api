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

function identifyNewNotifications() {
  if (this.$locals)
    this.$locals.shouldIncrement =
      // either new or recently marked as unread
      this.isNew || (this.isModified('read') && !this.read);
}

async function incrementInternalCounter(doc) {
  const seeIncrementLocal = (d, value) => {
    // eslint-disable-next-line
    if (d.$locals) d.$locals.didIncrement = value;
  };

  const incrementUserCounter = async (d) => {
    try {
      const { userId } = d;
      await Counters.findOneAndUpdate(
        { userId },
        { $inc: { notifications: 1 } },
        { upsert: true },
      );

      seeIncrementLocal(d, true);
    } catch (e) {
      // noop
    }
  };

  await Promise.all(
    convertMiddlewareParameterIntoArray(doc).map((d) =>
      get(d, '$locals.shouldIncrement')
        ? incrementUserCounter(d)
        : seeIncrementLocal(d, false),
    ),
  );
}

Schema.pre('save', identifyNewNotifications);

Schema.post('find', appendUrlToDownload);
Schema.post('findOne', appendUrlToDownload);
Schema.post('save', incrementInternalCounter);

module.exports = {
  appendUrlToDownload,
  identifyNewNotifications,
  incrementInternalCounter,
};
