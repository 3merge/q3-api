const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { MODEL_NAME } = require('../constants');
const {
  checkThreadID,
  checkMessage,
  checkNoteID,
} = require('./helpers');

const UpdateInThread = async (
  {
    params: { noteID },
    body: { message, threadID },
    translate,
    user,
  },
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

  doc.thread.message = message;
  await doc.save();

  res.ok({
    message: translate('messages:threadUpdated'),
    thread: subdoc.toJSON({
      virtuals: true,
    }),
  });
};

UpdateInThread.validation = [
  checkThreadID,
  checkMessage,
  checkNoteID,
];

module.exports = Q3.define(UpdateInThread);
