const { compose } = require('q3-core-composer');
const { map } = require('lodash');
const { Segments } = require('../../models');

const SystemSegmentsGetController = async (req, res) => {
  const segments = map(await Segments.find({}), (s) =>
    s.mapEntries(req.user),
  ).flat();

  res.ok({
    segments,
  });
};

module.exports = compose(SystemSegmentsGetController);
