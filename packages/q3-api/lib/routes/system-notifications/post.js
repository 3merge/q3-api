const mongoose = require('mongoose');
const { compose, verify } = require('q3-core-composer');
const { compact, get, map, size } = require('lodash');
const { Notifications } = require('../../models');

const NotificationsPostController = compose(
  async (req, res) => {
    const ids = map(
      compact(get(req, 'body.ids')),
      mongoose.Types.ObjectId,
    );

    if (size(ids))
      await Notifications.updateMany(
        {
          _id: { $in: ids },
          userId: get(req, 'user._id'),
          // stops it from updating unnecessarily
          $or: [
            { hasDownloaded: false },
            { hasSeen: false },
          ],
        },
        {
          $set: {
            hasSeen: true,
            hasDownloaded: true,
            dismissedOn: new Date(),
          },
        },
      );

    res.acknowledge();
  },
);

NotificationsPostController.authorization = [verify];

module.exports = NotificationsPostController;
