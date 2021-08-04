const { compose } = require('q3-core-composer');
const { Notifications } = require('../../models');

module.exports = compose(async (req, res) =>
  res.ok({
    notifications: await Notifications.recent(
      req.user,
      req.query.numberOfDays,
    ),
  }),
);
