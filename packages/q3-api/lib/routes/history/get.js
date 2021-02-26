const {
  compose,
  query,
  verify,
} = require('q3-core-composer');
const mongoose = require('../../config/mongoose');

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
      versions,
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
