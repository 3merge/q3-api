const { Redact } = require('q3-core-access');
const { merge, isObject, pick, get } = require('lodash');
const {
  clean,
  moveWithinPropertyName,
  toJSON,
} = require('../utils');

module.exports = (req) =>
  Object.assign(req, {
    authorizeBody: (
      contextDocument = {},
      collectionName = req.collectionName,
      fieldName = req.fieldName,
      fieldId = get(req, 'params.fieldID'),
    ) => {
      const parent = toJSON(contextDocument);
      const baseInput = moveWithinPropertyName(
        fieldName,
        req.body,
      );

      if (
        fieldName &&
        fieldId &&
        isObject(parent) &&
        Array.isArray(parent[fieldName])
      )
        parent[fieldName] = parent[fieldName].find(
          (item) => {
            try {
              return item._id.equals(fieldId);
            } catch (e) {
              return item._id === fieldId;
            }
          },
        );

      const output = Redact.flattenAndReduceByFields(
        merge({}, parent, baseInput),
        req.authorize(collectionName),
      );

      return clean(
        pick(
          fieldName
            ? get(output, fieldName, output)
            : output,
          Object.keys(req.body),
        ),
      );
    },
  });
