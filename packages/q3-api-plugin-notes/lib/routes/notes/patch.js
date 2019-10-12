const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const {
  checkThreadID,
  checkMessage,
  checkNoteID,
} = require('../../helpers');

const UpdateInThread = async (
  {
    params: { noteID },
    body: { message, threadID },
    t,
    user,
  },
  res,
) => {
  const doc = await model(MODEL_NAME).findById(noteID);
  const subdoc = doc.findThreadStrictly(threadID, user);
  subdoc.message = message;
  await doc.save();

  res.ok({
    message: t('messages:threadUpdated'),
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

module.exports = compose(UpdateInThread);
