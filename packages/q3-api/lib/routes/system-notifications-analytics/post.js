const {
  compose,
  check,
  verify,
} = require('q3-core-composer');
const mongoose = require('mongoose');
const { isString, size } = require('lodash');

const { ObjectId } = mongoose.Types;

const SystemNotificationsAnalytics = async (
  { body: { documentId, subDocumentId }, user },
  res,
) => {
  const query = {
    documentId: ObjectId(documentId),
    userId: ObjectId(user._id),
    localUrl: {
      $exists: true,
    },
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
    $set: {
      hasSeen: true,
      hasDownloaded: true,
    },
  });

  res.acknowledge();
};

SystemNotificationsAnalytics.authorization = [verify];

SystemNotificationsAnalytics.validation = [
  check('documentId').isString(),
  check('subDocumentId').isString().optional(),
];

module.exports = compose(SystemNotificationsAnalytics);
