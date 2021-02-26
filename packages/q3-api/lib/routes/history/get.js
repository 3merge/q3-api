const {
  compose,
  query,
  verify,
} = require('q3-core-composer');
const { size, filter, isObject } = require('lodash');
const mongoose = require('../../config/mongoose');

const hasKeys = (v) =>
  isObject(v) ? size(Object.keys(v)) > 0 : false;

const History = async (
  { query: { collectionName, documentId } },
  res,
) => {
  /**
   * @TODO
   * Permissions on history
   */
  try {
    const doc = await mongoose
      .model(collectionName)
      .findStrictly(documentId);

    const versions = await doc.getHistory({
      $or: [
        {
          updatedFields: {
            $exists: true,
          },
        },
        {
          removedFields: {
            $exists: true,
          },
        },
      ],
    });

    res.ok({
      versions: filter(
        versions,
        (item) =>
          item &&
          (hasKeys(item.updatedFields) ||
            hasKeys(item.removedFields)),
      ),
    });
  } catch (e) {
    res.status(400).send();
  }
};

History.validation = [
  query('collectionName').isString(),
  query('documentId').isMongoId(),
];

History.authorization = [verify];

module.exports = compose(History);
