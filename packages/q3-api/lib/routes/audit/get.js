const { compose, check } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const { model } = require('../..');

const AuditController = compose(
  async ({ query, user }, res) => {
    const { id, collectionName } = query;
    let inst = model(collectionName);

    if (
      !new Grant(user).can('Read').on('changelog').test({})
    )
      exception('Authorization')
        .msg('cannotAuditChanges')
        .throw();

    if (query.id) {
      inst = await inst.findStrictly(id);
    }

    res.ok({
      changes: await inst.getHistory(),
    });
  },
);

AuditController.validation = [
  check('collectionName').isString(),
  check('id').isMongoId().optional(),
];

module.exports = AuditController;
