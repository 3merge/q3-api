const { model } = require('q3-api');
const {
  compose,
  verify,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../../constants');
const { checkNoteID } = require('../../../helpers');

const ListThreadController = async (
  { params: { notesID } },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(notesID);
  const populatedDoc = await doc.populateAuthors();

  res.ok({
    threads: populatedDoc.toJSON().thread,
  });
};

ListThreadController.authorization = [
  verify(),
  redact(MODEL_NAME),
];

ListThreadController.validation = [checkNoteID];

module.exports = compose(ListThreadController);
