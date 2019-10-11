const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const RemoveFromThread = async (
  { params: { noteID, threadID }, translate, user },
  res,
) => {
  const doc = await model(MODEL_NAME).findById(noteID);
  doc.findThreadStrictly(threadID, user);
  await doc.removeFromThread(threadID);

  res.acknowledge({
    message: translate('messages:pulledFromThread'),
  });
};

RemoveFromThread.validation = [checkNoteID, checkThreadID];

module.exports = compose(RemoveFromThread);
