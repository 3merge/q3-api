const { compose } = require('q3-core-composer');
const { get } = require('lodash');
const { Counters } = require('../../models');

const SystemCountersController = async (req, res) => {
  const counter = await Counters.findOne({
    userId: get(req, 'user._id'),
  });

  res.ok(counter);
};

SystemCountersController.authorization = [];

module.exports = compose(SystemCountersController);
