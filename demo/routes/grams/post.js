const { compose } = require('q3-core-composer');
const mongoose = require('mongoose');

module.exports = compose(async (req, res) => {
  await mongoose.models[
    req.body.model
  ].initializeFuzzySearching();

  res.acknowledge();
});
