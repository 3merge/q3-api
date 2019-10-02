const Q3 = require('q3-api').default;
const { MODEL_NAME } = require('../constants');

const GetAll = async (req, res) => {
  const docs = Q3.model(MODEL_NAME).find();
  const permissions = docs.map((doc) =>
    doc.toJSON({
      virtuals: true,
    }),
  );
  res.ok({
    permissions,
  });
};

module.exports = Q3.define(GetAll);
