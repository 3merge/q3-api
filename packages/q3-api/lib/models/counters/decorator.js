const mongoose = require('mongoose');
const { get, first } = require('lodash');
const { MODEL_NAMES } = require('../../constants');
const Schema = require('./schema');

class CountersDecorator {
  static async calculateByNotificationObject({
    tenant = null,
    userId,
  }) {
    const notifications = get(
      first(
        await mongoose.models[
          MODEL_NAMES.NOTIFICATIONS
        ].aggregate([
          {
            $match: {
              active: true,
              archived: { $ne: true },
              read: { $ne: true },
              tenant,
              userId,
            },
          },
          {
            $count: 'current',
          },
        ]),
      ),
      'current',
      0,
    );

    await this.findOneAndUpdate(
      { tenant, userId },
      { $set: { notifications } },
      { upsert: true },
    );
  }
}

Schema.loadClass(CountersDecorator);
module.exports = CountersDecorator;
