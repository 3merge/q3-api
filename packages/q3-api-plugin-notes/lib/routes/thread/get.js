const { model } = require('q3-api');
const {
  compose,
  verify,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const { checkNoteID } = require('../../helpers');

const GetAllThreads = async (
  { params: { noteID } },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(noteID);
  const populatedDoc = await doc
    .populate({
      path: 'threads.author',
      select: 'firstName, lastName, email, id',
    })
    .execPopulate();

  res.ok({
    threads: populatedDoc.toJSON().thread,
  });
};

GetAllThreads.authorization = [
  verify(),
  redact(MODEL_NAME),
];

GetAllThreads.validation = [checkNoteID];

module.exports = compose(GetAllThreads);
