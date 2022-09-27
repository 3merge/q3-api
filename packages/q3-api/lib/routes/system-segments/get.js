const { compose, verify } = require('q3-core-composer');
const { get, map } = require('lodash');
const { Segments } = require('../../models');

const SystemSegmentsGetController = async (req, res) => {
  const segments = map(await Segments.find({}), (s) =>
    s.mapEntries(get(req, 'user', {})),
  ).flat();

  res.ok({
    segments,
  });
};

SystemSegmentsGetController.authorization = [verify];

module.exports = compose(SystemSegmentsGetController);
