const { compose } = require('q3-core-composer');
const { Notifications } = require('../../models');

module.exports = compose(async (req, res) => {
  await Notifications.acknowledge(
    req.params.systemnotificationsID,
  );

  res.acknowledge();
});
