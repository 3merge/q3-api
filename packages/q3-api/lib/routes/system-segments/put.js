const { check, compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { get } = require('lodash');
const { Segments } = require('../../models');

const SystemSegmentsPutController = async (req, res) => {
  const { action, collectionName, payload } = req.body;

  if (!get(req, 'user.developer', false))
    exception('Authorization')
      .msg('requiresDeveloper')
      .throw();

  const s =
    (await Segments.findOne({
      collectionName,
    })) ||
    new Segments({
      collectionName,
    });

  await s.execCmd(action, payload);

  res.ok({
    // just the collection's segments back
    segments: s.mapEntries(req.user),
  });
};

SystemSegmentsPutController.validation = [
  check('action').isString(),
  check('collectionName').isString(),
  check('payload').isObject(),
];

module.exports = compose(SystemSegmentsPutController);
