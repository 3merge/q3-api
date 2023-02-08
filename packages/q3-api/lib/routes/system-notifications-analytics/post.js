const {
  compose,
  check,
  verify,
} = require('q3-core-composer');
const mongoose = require('mongoose');
const { isString, size } = require('lodash');
const { Counters } = require('../../models');

const { ObjectId } = mongoose.Types;

const SystemNotificationsAnalytics = async (
  {
    body: { documentId, subDocumentId, read = true },
    user,
  },
  res,
) => {
  const query = {
    documentId: ObjectId(documentId),
    userId: ObjectId(user._id),
    localUrl: {
      $exists: true,
    },

    // will overwrite below
    subDocumentId: null,
  };

  if (isString(subDocumentId)) {
    /**
     * If we don't exit here,
     * then the script indirectly marks all notifications as seen.
     */
    if (!size(subDocumentId)) {
      res.acknowledge();
      return;
    }

    query.subDocumentId = {
      $in: subDocumentId
        .split(',')
        .map((id) => ObjectId(id.trim())),
    };
  }

  await mongoose.models.notifications.updateMany(query, {
    $set: read
      ? { read }
      : {
          active: true,
          archived: false,
          read,
        },
  });

  await Counters.calculateByNotificationObject({
    userId: ObjectId(user._id),
    tenant: user.tenant,
  });

  res.acknowledge();
};

SystemNotificationsAnalytics.authorization = [verify];

SystemNotificationsAnalytics.validation = [
  check('documentId').isString(),
  check('subDocumentId').isString().optional(),
  check('read').isBoolean().optional(),
];

module.exports = compose(SystemNotificationsAnalytics);
