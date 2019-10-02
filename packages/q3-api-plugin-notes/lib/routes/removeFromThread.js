const Q3 = require('q3-api').default;
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const RemoveFromThread = async (
  { params: { noteID, threadID }, translate, user },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findById(noteID);
  doc.findThreadStrictly(threadID, user);
  await doc.removeFromThread(threadID);

  res.acknowledge({
    message: translate('messages:pulledFromThread'),
  });
};

RemoveFromThread.validation = [checkNoteID, checkThreadID];

module.exports = Q3.define(RemoveFromThread);
