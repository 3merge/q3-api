const { model } = require('q3-api');
const {
  compose,
  redact,
  verify,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const {
  checkNoteID,
  checkThreadID,
} = require('../../helpers');

const DeleteThreadController = async (
  { params: { noteID, threadID }, t, user },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(noteID);
  doc.findThreadStrictly(threadID, user);
  await doc.removeFromThread(threadID);

  res.acknowledge({
    message: t('messages:pulledFromThread'),
  });
};

DeleteThreadController.authorization = [
  verify(),
  redact(MODEL_NAME),
];

DeleteThreadController.validation = [
  checkNoteID,
  checkThreadID,
];

module.exports = compose(DeleteThreadController);
