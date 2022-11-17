const { compose } = require('q3-core-composer');
const { get } = require('lodash');
const { Counters } = require('../../models');

const SystemCountersController = async (req, res) => {
  const counters = await Counters.findOne({
    tenant: get(req, 'user.tenant', null),
    userId: get(req, 'user._id'),
  });

  res.ok({
    counters,
  });
};

SystemCountersController.authorization = [];

module.exports = compose(SystemCountersController);
