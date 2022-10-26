const {
  compose,
  check,
  verify,
} = require('q3-core-composer');
const mongoose = require('mongoose');
const { isString } = require('lodash');

const { ObjectId } = mongoose.Types;

const SystemNotificationsAnalytics = async (
  { body: { documentId, subDocumentId }, user },
  res,
) => {
  await mongoose.models.notifications.updateMany(
    {
      documentId: ObjectId(documentId),
      userId: ObjectId(user._id),
      localUrl: {
        $exists: true,
      },
      subDocumentId: isString(subDocumentId)
        ? {
            $in: subDocumentId
              .split(',')
              .map((id) => ObjectId(id.trim())),
          }
        : null,
    },
    {
      $set: {
        hasSeen: true,
        hasDownloaded: true,
      },
    },
  );

  res.acknowledge();
};

SystemNotificationsAnalytics.authorization = [verify];

SystemNotificationsAnalytics.validation = [
  check('documentId').isString(),
  check('subDocumentId').isString().optional(),
];

module.exports = compose(SystemNotificationsAnalytics);
