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

    res.ok({
      versions: await doc.getHistory(),
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
