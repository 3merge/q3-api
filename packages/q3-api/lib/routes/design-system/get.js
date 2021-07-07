const { compose } = require('q3-core-composer');
const { compact, map } = require('lodash');
const mongoose = require('../../config/mongoose');

const DesignSystemGet = async (
  { query: { collectionName, fields } },
  res,
) => {
  const M = mongoose.models[collectionName];
  res.ok({
    system: compact(
      map(
        String(fields).split(','),
        M.getFieldDesignInstructions.bind(M),
      ),
    ),
  });
};

DesignSystemGet.authorization = [];
DesignSystemGet.validation = [];

const Ctrl = compose(DesignSystemGet);
module.exports = Ctrl;
