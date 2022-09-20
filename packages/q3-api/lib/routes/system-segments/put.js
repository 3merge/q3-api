const { compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { get } = require('lodash');
const { Segments } = require('../../models');

const SystemSegmentsPutController = async (req, res) => {
  const { action, collectionName, payload } = req;

  if (!get(req, 'user.developer'))
    exception('Authorization')
      .msg('requiresDeveloper')
      .throw();

  const s = await Segments.findOne({
    collectionName,
  });

  await s.execCmd(action, payload);

  res.ok({
    // just the collection's segments back
    segments: s.mapEntries(req.user),
  });
};

module.exports = compose(SystemSegmentsPutController);
