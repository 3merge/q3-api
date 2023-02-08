const { get, map, size, set, isObject } = require('lodash');
const session = require('q3-core-session');

const plugin = (Schema, messageType = null) => {
  // virtuals not working
  // will get overwritten anyway
  Schema.add({ read: Boolean });

  async function assignLocal() {
    let ids = get(this, '$locals.notificationIds');

    if (!Array.isArray(ids)) {
      // eslint-disable-next-line
      const { Notifications } = require('../models');

      ids = map(
        await Notifications.getUnreadIds(messageType),
        String,
      );

      set(this, '$locals.notificationIds', ids);
    }

    return ids;
  }

  // eslint-disable-next-line
  async function assignReadValue(resp) {
    return session.hydrate(this, async () => {
      const ids = await assignLocal.call(this);

      return [resp]
        .flat()
        .filter(isObject)
        .forEach((item) => {
          // eslint-disable-next-line
          item.read = !ids.includes(String(item._id));
        });
    });
  }

  async function assignFuncParam() {
    const ids = await assignLocal.call(this);
    const q = this.getQuery();

    if (get(q, 'func') === 'unread') {
      // eslint-disable-next-line
      q._id = size(ids) ? { $in: ids } : { $eq: null };
      delete q.func;
    }

    this.setQuery(q);
  }

  Schema.pre('countDocuments', assignFuncParam);
  Schema.pre('find', assignFuncParam);
  Schema.post('find', assignReadValue);
  Schema.post('findOne', assignReadValue);
};

module.exports = plugin;
