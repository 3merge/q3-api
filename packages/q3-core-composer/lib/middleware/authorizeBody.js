const { Redact } = require('q3-core-access');
const { pick, get } = require('lodash');
const {
  moveWithinPropertyName,
  toJSON,
} = require('../utils');

module.exports = (req) =>
  Object.assign(req, {
    authorizeBody: (
      contextDocument = {},
      collectionName = req.collectionName,
      fieldName = req.fieldName,
    ) => {
      const baseInput = moveWithinPropertyName(
        fieldName,
        req.body,
      );

      const output = Redact.flattenAndReduceByFields(
        {
          ...toJSON(contextDocument),
          ...baseInput,
        },
        req.authorize(collectionName),
      );

      return pick(
        fieldName ? get(output, fieldName, output) : output,
        Object.keys(req.body),
      );
    },
  });
