const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const RemoveFromThread = async (
  { params: { noteID, threadID }, translate, user },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findById(noteID);
  const subdoc = doc.thread.id(threadID);

  if (!subdoc)
    throw new Errors.ResourceNotFoundError(
      translate('messages:unknownThread'),
    );

  if (!subdoc.author.equals(user.id))
    throw new Errors.AuthorizationError(
      translate('messages:mustOwnThread'),
    );

  doc.thread.remove(threadID);
  await doc.save();

  res.acknowledge({
    message: translate('messages:pulledFromThread'),
  });
};

RemoveFromThread.validation = [checkNoteID, checkThreadID];

module.exports = Q3.define(RemoveFromThread);
