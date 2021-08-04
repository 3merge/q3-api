const { compose } = require('q3-core-composer');
const { model } = require('../..');

module.exports = compose(async ({ query }, res) => {
  let inst = model(query.collectionName);

  if (query.id) {
    inst = await model.findStrictly(query.id);
  }

  res.ok({
    changes: await inst.getHistory(),
  });
});

// Validation....access control.
