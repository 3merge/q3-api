const Q3 = require('q3-api').default;
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
  const subdoc = doc.findThreadStrictly(threadID, user);
  subdoc.message = message;
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
